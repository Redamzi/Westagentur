
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeSpaceBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouse = useRef({ x: 0, y: 0 });
    const viewBounds = useRef({ width: 500, height: 400 });
    const trailPositions = useRef<THREE.Vector3[]>([]);
    const MAX_TRAIL_POINTS = 40; // Even longer trail for the light streak

    useEffect(() => {
        if (!containerRef.current) return;

        // 1. Scene & Camera Setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 1);
        containerRef.current.appendChild(renderer.domElement);

        // 2. Cinematic Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        scene.add(ambientLight);

        // Super intense light for the shooting star
        const meteorLight = new THREE.PointLight(0xffffff, 150, 2500);
        scene.add(meteorLight);

        // 3. The Meteor (Shooting Star Core)
        const meteorGroup = new THREE.Group();
        meteorGroup.position.set(0, 0, -350);
        scene.add(meteorGroup);

        // Bright Point Core
        const coreGeom = new THREE.SphereGeometry(6, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const core = new THREE.Mesh(coreGeom, coreMat);
        meteorGroup.add(core);

        // Outer Glow Sphere
        const glowGeom = new THREE.SphereGeometry(15, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0x00f2ff,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeom, glowMat);
        meteorGroup.add(glow);

        // 4. Shooting Star Streak (Trail)
        const trailGroup = new THREE.Group();
        scene.add(trailGroup);

        const trailMeshes: THREE.Mesh[] = [];
        const trailCount = MAX_TRAIL_POINTS;

        // We use slightly tapered spheres or cylinders for a smooth streak
        const streakGeom = new THREE.SphereGeometry(8, 16, 16);

        for (let i = 0; i < trailCount; i++) {
            const opacity = 1.0 - (i / trailCount);
            const tMat = new THREE.MeshBasicMaterial({
                color: i < 5 ? 0xffffff : 0x00f2ff, // Fade from white to cyan
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending
            });
            const mesh = new THREE.Mesh(streakGeom, tMat);
            trailMeshes.push(mesh);
            trailGroup.add(mesh);
        }

        // 5. Starfield
        const starCount = 8000;
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        const starVelocities = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            starPositions[i * 3] = (Math.random() - 0.5) * 4500;
            starPositions[i * 3 + 1] = (Math.random() - 0.5) * 3500;
            starPositions[i * 3 + 2] = (Math.random() * -6000);
            starVelocities[i] = Math.random() * 4.0 + 1.5;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starMaterial = new THREE.PointsMaterial({
            size: 1.3,
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // 6. Interaction
        const handleMouseMove = (event: MouseEvent) => {
            mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const updateBounds = () => {
            const aspect = window.innerWidth / window.innerHeight;
            const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * 600;
            const visibleWidth = visibleHeight * aspect;
            viewBounds.current = { width: visibleWidth, height: visibleHeight };
        };
        updateBounds();

        // 7. Animation Loop
        let time = 0;
        camera.position.z = 250;

        const animate = () => {
            time += 0.02;

            // Tracking
            const mouseTargetX = (mouse.current.x * viewBounds.current.width) * 0.45;
            const mouseTargetY = (mouse.current.y * viewBounds.current.height) * 0.45;

            // Random tiny jitter for meteor look
            const jitterX = Math.random() * 2;
            const jitterY = Math.random() * 2;

            const targetX = mouseTargetX + jitterX;
            const targetY = mouseTargetY + jitterY;

            const oldPos = meteorGroup.position.clone();
            meteorGroup.position.x += (targetX - meteorGroup.position.x) * 0.12;
            meteorGroup.position.y += (targetY - meteorGroup.position.y) * 0.12;

            const velocity = meteorGroup.position.distanceTo(oldPos);

            // Pulsate Glow
            glow.scale.setScalar(1.0 + Math.sin(time * 10) * 0.2 + velocity * 0.1);

            // Update Trail (Light Streak)
            trailPositions.current.unshift(meteorGroup.position.clone());
            if (trailPositions.current.length > trailCount * 2) {
                trailPositions.current.pop();
            }

            trailMeshes.forEach((mesh, idx) => {
                const pos = trailPositions.current[idx] || meteorGroup.position;
                mesh.position.copy(pos);

                const factor = 1.0 - (idx / trailCount);
                // Streak becomes thinner towards the end
                const scale = factor * (0.8 + velocity * 0.4);
                mesh.scale.setScalar(scale);

                // Opacity logic
                const alpha = factor * 0.8 * Math.min(velocity * 0.5, 1.0);
                (mesh.material as THREE.MeshBasicMaterial).opacity = alpha;
            });

            // Starfield
            const positions = starGeometry.attributes.position.array as Float32Array;
            for (let i = 0; i < starCount; i++) {
                positions[i * 3 + 2] += starVelocities[i] * (2.5 + velocity * 2.0);
                if (positions[i * 3 + 2] > 500) {
                    positions[i * 3 + 2] = -5500;
                }
            }
            starGeometry.attributes.position.needsUpdate = true;

            meteorLight.position.copy(meteorGroup.position);

            // Camera Parallax
            camera.position.x += (mouse.current.x * 20 - camera.position.x) * 0.05;
            camera.position.y += (mouse.current.y * 15 - camera.position.y) * 0.05;
            camera.lookAt(0, 0, -500);

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            updateBounds();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[0] pointer-events-none"
            style={{ background: '#000' }}
        />
    );
};

export default ThreeSpaceBackground;
