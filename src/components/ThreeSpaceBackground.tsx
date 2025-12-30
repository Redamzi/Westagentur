
import React, { useEffect, useRef, useState } from 'react';
import runningManImg from '../assets/running-man.jpg';

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
            {/* Optional Starfield Overlay to keep space theme alive lightly? Or plain black as requested? 
                User said "only the figure", but didn't explicitly say remove the space background, 
                however "maus animation ersetzen" implies the whole background component. 
                I'll keep a subtle starfield CSS if possible, or just the character. 
                Let's stick to just the character on black for now to be safe, or reuse the CSS stars.
            */}

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
                <img
                    src={runningManImg}
                    alt="Running Man"
                    className={`w-full h-full object-contain ${isMoving ? 'animate-bounce-fast' : ''}`}
                    style={{
                        filter: 'contrast(1.2) brightness(1.1)',
                        // Simple hack to remove white background if present (multiply for white bg on dark)
                        mixBlendMode: 'screen' // If image is dark on light?? No, standard multiply hides white.
                        // BUT: We are on black mode. White background image on black bg:
                        // Multiply -> White becomes transparent? No, Multiply makes things darker. White is neutral (1.0). 
                        // So White (1) * Black (0) = Black. Perfect! 
                        // IF the background is black.
                    }}
                />
            </div>
            <style>{`
                @keyframes bounceRun {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                .animate-bounce-fast {
                    animation: bounceRun 0.4s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default ThreeSpaceBackground;
