const MAX_BODY_BYTES = 20_000;

export class HttpError extends Error {
  constructor(status, code, details) {
    super(code);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const sendJson = (res, status, payload, headers = {}) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  res.end(JSON.stringify(payload));
};

export const readJson = (req, maxBytes = MAX_BODY_BYTES) =>
  new Promise((resolve, reject) => {
    if (!String(req.headers['content-type'] || '').startsWith('application/json')) {
      reject(new HttpError(415, 'unsupported_media_type'));
      return;
    }
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new HttpError(413, 'payload_too_large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(new HttpError(400, 'invalid_json'));
      }
    });
    req.on('error', reject);
  });

// nginx sets X-Real-IP; fall back to the socket address when running standalone.
export const clientIp = (req) => String(req.headers['x-real-ip'] || req.socket.remoteAddress || 'unknown');

export const parseCookies = (req) =>
  Object.fromEntries(
    String(req.headers.cookie || '')
      .split(';')
      .map((part) => part.trim().split('='))
      .filter(([key, value]) => key && value !== undefined)
      .map(([key, ...rest]) => [key, decodeURIComponent(rest.join('='))])
  );

/**
 * Minimal router: routes are [method, pattern, handler]. Patterns use ":name"
 * segments; matched params are passed to the handler as ctx.params.
 */
export const createRouter = (routes) => {
  const compiled = routes.map(([method, pattern, handler]) => {
    const keys = [];
    const regex = new RegExp(
      '^' + pattern.replace(/:(\w+)/g, (_, key) => (keys.push(key), '([^/]+)')) + '$'
    );
    return { method, regex, keys, handler };
  });

  return (method, pathname) => {
    let pathMatched = false;
    for (const route of compiled) {
      const match = route.regex.exec(pathname);
      if (!match) continue;
      pathMatched = true;
      if (route.method !== method) continue;
      const params = Object.fromEntries(route.keys.map((key, i) => [key, decodeURIComponent(match[i + 1])]));
      return { handler: route.handler, params };
    }
    return { notAllowed: pathMatched };
  };
};
