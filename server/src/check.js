// Free website check (lead magnet): fetches a public website and rates basics of
// security, SEO, mobile, performance and conversion. Built to resist SSRF: only
// http(s) on standard ports, every connection is checked against private IP ranges
// at connect time (no DNS rebinding), redirects are re-validated, size/time limits.
import dns from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';

const USER_AGENT = 'WestagenturCheck/1.0 (+https://westagentur.de/website-check)';
const TIMEOUT_MS = 8000;
const MAX_BYTES = 2_000_000;
const MAX_REDIRECTS = 4;

export class CheckError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

// ------------------------------------------------------------------ address guard

const v4ToInt = (ip) => ip.split('.').reduce((n, part) => (n << 8) + Number(part), 0) >>> 0;
const inV4 = (ip, cidr) => {
  const [base, bits] = cidr.split('/');
  const mask = bits === '0' ? 0 : (~0 << (32 - Number(bits))) >>> 0;
  return (v4ToInt(ip) & mask) === (v4ToInt(base) & mask);
};
const BLOCKED_V4 = [
  '0.0.0.0/8', '10.0.0.0/8', '100.64.0.0/10', '127.0.0.0/8', '169.254.0.0/16', '172.16.0.0/12',
  '192.0.0.0/24', '192.0.2.0/24', '192.168.0.0/16', '198.18.0.0/15', '198.51.100.0/24',
  '203.0.113.0/24', '224.0.0.0/4', '240.0.0.0/4',
];

/** True for loopback, private, link-local, CGNAT, multicast and other non-public addresses. */
export const isPrivateAddress = (ip) => {
  if (net.isIPv4(ip)) return BLOCKED_V4.some((cidr) => inV4(ip, cidr));
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1]);
    return (
      lower === '::' || lower === '::1' ||
      /^f[cd]/.test(lower) ||        // unique local fc00::/7
      /^fe[89ab]/.test(lower) ||     // link-local fe80::/10
      /^ff/.test(lower) ||           // multicast
      lower.startsWith('2001:db8') || // documentation
      lower.startsWith('64:ff9b')    // NAT64
    );
  }
  return true;
};

/** dns.lookup replacement that refuses private targets (used at connect time). */
const guardedLookup = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err);
    const list = Array.isArray(addresses) ? addresses : [{ address: addresses, family: options.family }];
    if (!list.length || list.some((a) => isPrivateAddress(a.address))) {
      return callback(new CheckError('blocked_address'));
    }
    if (options.all) return callback(null, list);
    return callback(null, list[0].address, list[0].family);
  });
};

/** Normalises user input like "example.de" to a URL and rejects unsupported targets. */
export const normalizeTarget = (input) => {
  let value = String(input ?? '').trim();
  if (!value) throw new CheckError('invalid_url');
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new CheckError('invalid_url');
  }
  if (!['http:', 'https:'].includes(url.protocol)) throw new CheckError('invalid_url');
  if (url.username || url.password) throw new CheckError('invalid_url');
  if (url.port && !['80', '443'].includes(url.port)) throw new CheckError('invalid_url');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(host) || !host.includes('.') || /\.(local|internal|localhost)$/i.test(host) || host === 'localhost') {
    throw new CheckError('invalid_url');
  }
  url.hash = '';
  return url;
};

// ------------------------------------------------------------------ fetching

/** One HTTP request with limits. Returns { status, headers, body, ms }. */
const request = (url, { method = 'GET', allowPrivate = false, maxBytes = MAX_BYTES } = {}) =>
  new Promise((resolve, reject) => {
    const started = Date.now();
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request(
      url,
      {
        method,
        headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml,*/*;q=0.8', 'Accept-Encoding': 'identity' },
        lookup: allowPrivate ? undefined : guardedLookup,
        timeout: TIMEOUT_MS,
      },
      (res) => {
        const chunks = [];
        let size = 0;
        res.on('data', (chunk) => {
          size += chunk.length;
          if (size > maxBytes) {
            res.destroy();
            return;
          }
          chunks.push(chunk);
        });
        res.on('close', () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf8'),
            bytes: size,
            ms: Date.now() - started,
          })
        );
        res.on('error', reject);
      }
    );
    req.on('timeout', () => req.destroy(new CheckError('timeout')));
    req.on('error', (err) => reject(err instanceof CheckError ? err : new CheckError(err.code === 'ENOTFOUND' ? 'not_found' : 'unreachable')));
    req.end();
  });

/** GET with manually followed (and re-validated) redirects. */
const fetchFollow = async (url, opts) => {
  let current = url;
  const chain = [];
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const res = await request(current, opts);
    chain.push({ url: current.href, status: res.status });
    if (res.status >= 300 && res.status < 400 && res.headers.location) {
      const next = new URL(res.headers.location, current);
      if (!opts?.allowPrivate) normalizeTarget(next.href);
      current = next;
      continue;
    }
    return { ...res, url: current, chain };
  }
  throw new CheckError('too_many_redirects');
};

// ------------------------------------------------------------------ analysis

const attr = (tag, name) => tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1] ?? '';
const metaContent = (html, key, value) => {
  const tag = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]).find((t) => attr(t, key).toLowerCase() === value);
  return tag ? attr(tag, 'content') : '';
};
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

/** Rates a fetched page. Pure function – testable without network. */
export const analyzeHtml = ({ html, finalUrl, ms, bytes, httpRedirectsToHttps, hasRobots, hasSitemap }) => {
  const title = decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  const description = decode(metaContent(html, 'name', 'description'));
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const imgsWithoutAlt = imgs.filter((t) => !/\balt\s*=/i.test(t)).length;
  const viewport = metaContent(html, 'name', 'viewport');
  const lang = attr(html.match(/<html\b[^>]*>/i)?.[0] ?? '', 'lang');
  const canonical = /<link\b[^>]*rel=["']canonical["']/i.test(html);
  const ogImage = metaContent(html, 'property', 'og:image');
  const jsonLd = /application\/ld\+json/i.test(html);
  const hasContact = /href=["'](tel:|mailto:)/i.test(html) || /<form\b/i.test(html);
  const textLength = decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/gi, ' ')).length;
  const https = finalUrl.protocol === 'https:';

  const c = (id, category, status, value) => ({ id, category, status, value });
  const checks = [
    c('https', 'security', https ? 'pass' : 'fail', https ? 'HTTPS' : 'HTTP'),
    c('http_redirect', 'security', httpRedirectsToHttps ? 'pass' : 'warn', ''),
    c('title', 'seo', !title ? 'fail' : title.length < 20 || title.length > 65 ? 'warn' : 'pass', title),
    c('description', 'seo', !description ? 'fail' : description.length < 70 || description.length > 170 ? 'warn' : 'pass', description),
    c('h1', 'seo', h1Count === 1 ? 'pass' : h1Count === 0 ? 'fail' : 'warn', String(h1Count)),
    c('lang', 'seo', lang ? 'pass' : 'warn', lang),
    c('canonical', 'seo', canonical ? 'pass' : 'warn', ''),
    c('structured_data', 'seo', jsonLd ? 'pass' : 'warn', ''),
    c('sitemap', 'seo', hasRobots && hasSitemap ? 'pass' : hasSitemap || hasRobots ? 'warn' : 'fail', ''),
    c('content', 'seo', textLength > 1500 ? 'pass' : textLength > 400 ? 'warn' : 'fail', String(textLength)),
    c('viewport', 'mobile', /width=device-width/i.test(viewport) ? 'pass' : 'fail', viewport),
    c('alt', 'mobile', imgsWithoutAlt === 0 ? 'pass' : imgsWithoutAlt <= 3 ? 'warn' : 'fail', `${imgsWithoutAlt}/${imgs.length}`),
    c('response_time', 'performance', ms < 800 ? 'pass' : ms < 2000 ? 'warn' : 'fail', `${ms} ms`),
    c('page_size', 'performance', bytes < 150_000 ? 'pass' : bytes < 500_000 ? 'warn' : 'fail', `${Math.round(bytes / 1024)} KB`),
    c('social_preview', 'conversion', ogImage ? 'pass' : 'warn', ''),
    c('contact', 'conversion', hasContact ? 'pass' : 'fail', ''),
  ];
  const points = { pass: 2, warn: 1, fail: 0 };
  const score = Math.round((checks.reduce((sum, ch) => sum + points[ch.status], 0) / (checks.length * 2)) * 100);
  return { url: finalUrl.href, score, checks };
};

/** Runs the full check for a user-supplied URL. */
export const runWebsiteCheck = async (input, { allowPrivate = false } = {}) => {
  const target = allowPrivate ? new URL(/^https?:\/\//.test(input) ? input : `https://${input}`) : normalizeTarget(input);
  const opts = { allowPrivate };
  const page = await fetchFollow(target, opts);
  if (page.status >= 400) throw new CheckError('http_error');
  if (!/html/i.test(String(page.headers['content-type'] ?? 'text/html'))) throw new CheckError('not_html');

  const origin = page.url.origin;
  const exists = async (path) => {
    try {
      const res = await fetchFollow(new URL(path, origin), { ...opts, maxBytes: 200_000 });
      return res.status === 200 ? res.body : null;
    } catch {
      return null;
    }
  };
  const httpVariant = new URL(page.url.href);
  httpVariant.protocol = 'http:';
  const [robots, sitemap, httpRes] = await Promise.all([
    exists('/robots.txt'),
    exists('/sitemap.xml'),
    fetchFollow(httpVariant, { ...opts, maxBytes: 50_000 }).catch(() => null),
  ]);

  return analyzeHtml({
    html: page.body,
    finalUrl: page.url,
    ms: page.ms, // response time of the final document
    bytes: page.bytes,
    httpRedirectsToHttps: Boolean(httpRes && httpRes.url.protocol === 'https:'),
    hasRobots: robots !== null,
    hasSitemap: sitemap !== null || /sitemap:/i.test(robots ?? ''),
  });
};
