
import React, { useEffect, useRef, useState } from 'react';

const RunningManSVG = () => (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
        <g transform="translate(0, 20)">
            {/* Body/Suit */}
            <path d="M150,220 C130,220 120,240 110,280 C100,320 120,380 180,400 C240,420 320,400 350,350 C380,300 360,240 330,220 Z" fill="#4B3621" />

            {/* Vest (Round Belly) */}
            <path d="M160,230 C160,230 140,300 180,350 C220,400 300,380 320,330 C340,280 320,230 320,230 Z" fill="#D2691E" />

            {/* White Shirt */}
            <path d="M210,230 L240,280 L270,230 Z" fill="#FFFFFF" />

            {/* Bow Tie */}
            <path d="M220,235 L260,235 L270,225 L210,225 Z" fill="#8B0000" />
            <circle cx="240" cy="235" r="5" fill="#8B0000" />

            {/* Head */}
            <circle cx="240" cy="160" r="50" fill="#FFCC99" />

            {/* Face details */}
            <circle cx="260" cy="150" r="5" fill="#000" /> {/* Eye */}
            <path d="M230,150 Q240,140 250,150" fill="none" stroke="#000" strokeWidth="2" /> {/* Eyebrow */}
            <path d="M240,180 Q260,190 280,170" fill="none" stroke="#000" strokeWidth="3" /> {/* Smile */}
            <path d="M260,165 L290,165" fill="none" stroke="#333" strokeWidth="4" /> {/* Moustache */}

            {/* Top Hat */}
            <rect x="190" y="110" width="100" height="20" fill="#222" /> {/* Brim */}
            <rect x="200" y="50" width="80" height="70" fill="#222" /> {/* Top */}
            <rect x="200" y="100" width="80" height="10" fill="#8B0000" /> {/* Ribbon */}

            {/* Arms (Running motion) */}
            {/* Back Arm */}
            <path d="M300,240 Q350,260 380,220" fill="none" stroke="#4B3621" strokeWidth="30" strokeLinecap="round" />
            <circle cx="380" cy="220" r="15" fill="#FFCC99" /> {/* Hand */}

            {/* Front Arm */}
            <path d="M160,250 Q100,280 80,240" fill="none" stroke="#4B3621" strokeWidth="30" strokeLinecap="round" />
            <circle cx="80" cy="240" r="15" fill="#FFCC99" /> {/* Hand */}

            {/* Legs (Running motion) */}
            {/* Back Leg */}
            <path d="M220,380 Q180,450 140,440" fill="none" stroke="#2F1F10" strokeWidth="35" strokeLinecap="round" />
            <path d="M140,440 L120,480 L160,480" fill="#000" /> {/* Shoe */}

            {/* Front Leg */}
            <path d="M280,380 Q340,420 380,380" fill="none" stroke="#2F1F10" strokeWidth="35" strokeLinecap="round" />
            <path d="M380,380 L420,360 L410,400" fill="#000" /> {/* Shoe */}
        </g>
    </svg>
);

const ThreeSpaceBackground: React.FC = () => {
    const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const [direction, setDirection] = useState(1); // 1 = right, -1 = left
    const [isMoving, setIsMoving] = useState(false);

    // Refs for animation loop to avoid dependency cycles
    const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const currentPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const frameId = useRef<number>(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouse.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            // Calculate distance
            const dx = mouse.current.x - currentPos.current.x;
            const dy = mouse.current.y - currentPos.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 5) { // Threshold to stop jittering
                setIsMoving(true);

                // Lerp factor - speed of following
                const speed = 0.08;

                currentPos.current.x += dx * speed;
                currentPos.current.y += dy * speed;

                // Determine direction based on movement
                if (Math.abs(dx) > 1) {
                    setDirection(dx > 0 ? -1 : 1); // Flip logic depending on original image orientation
                }

                setPosition({ ...currentPos.current });
            } else {
                setIsMoving(false);
            }

            frameId.current = requestAnimationFrame(animate);
        };

        frameId.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(frameId.current);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[0] pointer-events-none overflow-hidden bg-black">
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    transform: `translate(${position.x - 75}px, ${position.y - 75}px) scaleX(${direction})`,
                    willChange: 'transform',
                    width: '150px',
                    height: '150px',
                    pointerEvents: 'none'
                }}
            >
                <div className={`w-full h-full ${isMoving ? 'animate-bounce-fast' : ''}`}>
                    <RunningManSVG />
                </div>
            </div>
            <style>{`
                @keyframes bounceRun {
                    0%, 100% { transform: translateY(0); rotate(0deg); }
                    25% { transform: translateY(-10px) rotate(5deg); }
                    50% { transform: translateY(0) rotate(0deg); }
                    75% { transform: translateY(-10px) rotate(-5deg); }
                }
                .animate-bounce-fast {
                    animation: bounceRun 0.4s infinite linear;
                }
            `}</style>
        </div>
    );
};

export default ThreeSpaceBackground;
