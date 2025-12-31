
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeSpaceBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const reticleRef = useRef<HTMLDivElement>(null);
    const coordsRef = useRef<HTMLDivElement>(null);

    // State is handled via refs for performance (LERP loop)
    const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    useEffect(() => {
        // --- 1. THREE.JS STARFIELD ---
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 100;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // Stars
        const starCount = 3000;
        const starGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const velocities = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 1500;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
            velocities[i] = Math.random() * 0.2 + 0.05;
        }

        starGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const starMat = new THREE.PointsMaterial({
            size: 1.2,
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            map: null
        });
        const stars = new THREE.Points(starGeom, starMat);
        scene.add(stars);

        // --- 2. ANIMATION LOOPS ---
        let frameId = 0;

        // State for speed calculation
        const speedRef = {
            current: 1.0,  // Base speed multiplier
            target: 1.0
        };
        const lastPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

        const animate = () => {
            // Calculate mouse speed based on reticle movement (smoothed)
            const dx = pos.current.x - lastPos.x;
            const dy = pos.current.y - lastPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Map movement to speed target (0 movement = 1x, fast movement = up to 5x)
            // Smaller threshold for sensitivity
            speedRef.target = 1.0 + (dist * 0.2);

            // Limit max speed
            if (speedRef.target > 8.0) speedRef.target = 8.0;

            // Smoothly interpolate current speed to target
            // accelerate fast, decelerate slow
            speedRef.current += (speedRef.target - speedRef.current) * 0.1;

            lastPos.x = pos.current.x;
            lastPos.y = pos.current.y;

            // Stars Animation
            const posAttr = starGeom.attributes.position.array as Float32Array;
            for (let i = 0; i < starCount; i++) {
                // Apply dynamic speed multiplier
                const moveSpeed = velocities[i] * speedRef.current;
                posAttr[i * 3 + 2] += moveSpeed;

                if (posAttr[i * 3 + 2] > 200) {
                    posAttr[i * 3 + 2] = -1800; // Reset to far back
                }
            }
            starGeom.attributes.position.needsUpdate = true;
            renderer.render(scene, camera);

            // Reticle LERP (Follow Mouse)
            const targetX = mouse.current.x;
            const targetY = mouse.current.y;

            // Lerp factor 0.12 for distinct smooth lag
            pos.current.x += (targetX - pos.current.x) * 0.12;
            pos.current.y += (targetY - pos.current.y) * 0.12;

            if (reticleRef.current) {
                reticleRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
            }

            // Coords Update (Live Data)
            if (coordsRef.current) {
                // Formatting to look technical: X: 0192 Y: 0843
                const xStr = Math.round(pos.current.x).toString().padStart(4, '0');
                const yStr = Math.round(pos.current.y).toString().padStart(4, '0');
                coordsRef.current.innerText = `X: ${xStr}\nY: ${yStr}`;
            }

            frameId = requestAnimationFrame(animate);
        };

        frameId = requestAnimationFrame(animate);

        // Events
        const handleMouseMove = (e: MouseEvent) => {
            mouse.current = { x: e.clientX, y: e.clientY };
        };

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
            if (containerRef.current) containerRef.current.innerHTML = '';
            renderer.dispose();
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[0] pointer-events-none bg-transparent overflow-hidden">
            {/* 3D Starfield layer */}
            <div ref={containerRef} className="absolute inset-0" />

            {/* Reticle HUD Overlay */}
            <div
                ref={reticleRef}
                className="absolute top-0 left-0"
                style={{
                    willChange: 'transform',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '0px',
                    height: '0px'
                }}
            >
                {/* Centered Container relative to mouse position */}
                <div className="relative flex items-center justify-center w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2">

                    {/* SVG Filters Definition */}
                    <svg width="0" height="0" className="absolute">
                        <defs>
                            <filter id="glow-blur">
                                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                    </svg>

                    {/* Layer 1: Outer Rotating Dashed Ring (Slow) */}
                    <div className="absolute inset-0 flex items-center justify-center animate-spin-very-slow opacity-20">
                        <div className="w-[225px] h-[225px] rounded-full border border-dashed border-cyan-500/30"></div>
                    </div>

                    {/* Layer 2: Mid Tech Ring with Violet Accents (Counter-Rotate) */}
                    <div className="absolute inset-0 flex items-center justify-center animate-reverse-spin opacity-50">
                        <svg width="175" height="175" viewBox="0 0 350 350" fill="none">
                            {/* Violet Arc */}
                            <circle cx="175" cy="175" r="170" stroke="#bc13fe" strokeWidth="2" strokeDasharray="4 8" opacity="0.6" />
                            {/* Cyan Markers */}
                            <path d="M175,5 L175,25 M175,325 L175,345 M5,175 L25,175 M325,175 L345,175" stroke="#00f2ff" strokeWidth="4" />
                        </svg>
                    </div>

                    {/* Layer 3: Inner Focus Ring (Fast Spin + Glow) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div
                            className="w-[90px] h-[90px] rounded-full border border-cyan-400 opacity-70 border-t-transparent border-b-transparent animate-spin-slow"
                            style={{ filter: 'drop-shadow(0 0 8px rgba(0,242,255,0.6))' }}
                        ></div>
                    </div>

                    {/* Layer 4: Center Crosshair & Core */}
                    <div className="absolute w-4 h-4 bg-cyan-400 rounded-full blur-[2px] opacity-80"></div>
                    <div className="absolute w-2 h-2 bg-white rounded-full z-10"></div>

                    {/* Cross Lines */}
                    <div className="absolute w-[125px] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
                    <div className="absolute h-[125px] w-[1px] bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent"></div>

                    {/* Layer 5: Live Coordinates Display */}
                    <div
                        ref={coordsRef}
                        className="absolute top-1/2 left-1/2 transform translate-x-6 translate-y-4 font-['Space_Mono'] text-[10px] text-cyan-300 drop-shadow-[0_0_5px_rgba(0,242,255,0.8)] whitespace-pre leading-tight"
                    >
                    </div>

                </div>
            </div>

            <style>{`
                .animate-spin-very-slow { animation: spin 40s linear infinite; }
                .animate-spin-slow { animation: spin 8s linear infinite; }
                .animate-reverse-spin { animation: spin 15s linear infinite reverse; }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ThreeSpaceBackground;
