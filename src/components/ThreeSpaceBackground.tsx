
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeSpaceBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouse = useRef({ x: 0, y: 0 });
    const viewBounds = useRef({ width: 500, height: 400 });
    const trailPositions = useRef<THREE.Vector3[]>([]);
    const MAX_TRAIL_POINTS = 12;

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
        const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
        scene.add(ambientLight);

        const diskLight = new THREE.PointLight(0xffaa00, 60, 1500);
        scene.add(diskLight);

        const cyanLight = new THREE.PointLight(0x00f2ff, 40, 1800);
        cyanLight.position.set(-200, 100, -300);
        scene.add(cyanLight);

        // 3. The Black Hole Construction
        const blackHoleGroup = new THREE.Group();
        blackHoleGroup.position.set(0, 0, -350);
        scene.add(blackHoleGroup);

        const singularityGeom = new THREE.SphereGeometry(22, 64, 64);
        const singularityMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const singularity = new THREE.Mesh(singularityGeom, singularityMat);
        blackHoleGroup.add(singularity);

        const horizonGeom = new THREE.SphereGeometry(25, 64, 64);
        const horizonMat = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const horizon = new THREE.Mesh(horizonGeom, horizonMat);
        blackHoleGroup.add(horizon);

        const diskGeom = new THREE.TorusGeometry(60, 8, 2, 200);
        const diskMat = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xff4400,
            emissiveIntensity: 5,
            transparent: true,
            opacity: 0.85,
            wireframe: true,
            side: THREE.DoubleSide
        });
        const accretionDisk = new THREE.Mesh(diskGeom, diskMat);
        accretionDisk.rotation.x = Math.PI / 2.05;
        blackHoleGroup.add(accretionDisk);

        // 4. Warp Tunnel Trail (The "Funnel" Effect)
        const trailGroup = new THREE.Group();
        scene.add(trailGroup);

        const trailRings: THREE.Mesh[] = [];
        const trailCount = MAX_TRAIL_POINTS;
        const ringGeom = new THREE.TorusGeometry(58, 1, 2, 60);

        for (let i = 0; i < trailCount; i++) {
            const rMat = new THREE.MeshBasicMaterial({
                color: i % 2 === 0 ? 0x00f2ff : 0xbc13fe,
                transparent: true,
                opacity: 0,
                wireframe: true
            });
            const ring = new THREE.Mesh(ringGeom, rMat);
            trailRings.push(ring);
            trailGroup.add(ring);
        }

        // 5. Starfield (Higher speed for travel feel)
        const starCount = 6000;
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        const starVelocities = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            starPositions[i * 3] = (Math.random() - 0.5) * 4500;
            starPositions[i * 3 + 1] = (Math.random() - 0.5) * 3500;
            starPositions[i * 3 + 2] = (Math.random() * -6000);
            starVelocities[i] = Math.random() * 2.5 + 1.0;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starMaterial = new THREE.PointsMaterial({
            size: 1.1,
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // 6. Interaction & Dynamic Positioning
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
            time += 0.025; // Even faster time

            // MOUSE TRACKING & DRIFT
            const mouseTargetX = (mouse.current.x * viewBounds.current.width) * 0.45;
            const mouseTargetY = (mouse.current.y * viewBounds.current.height) * 0.45;
            const driftX = Math.sin(time * 0.5) * 30;
            const driftY = Math.cos(time * 0.4) * 20;

            const targetX = mouseTargetX + driftX;
            const targetY = mouseTargetY + driftY;

            const oldPos = blackHoleGroup.position.clone();
            blackHoleGroup.position.x += (targetX - blackHoleGroup.position.x) * 0.08;
            blackHoleGroup.position.y += (targetY - blackHoleGroup.position.y) * 0.08;

            // Calculate Velocity for effects
            const velocity = blackHoleGroup.position.distanceTo(oldPos);

            // UPDATE TRAIL (Funnel Effect)
            // Store current position at the beginning of the trail
            trailPositions.current.unshift(blackHoleGroup.position.clone());
            if (trailPositions.current.length > trailCount * 4) {
                trailPositions.current.pop();
            }

            // Position the trailing rings with lag
            trailRings.forEach((ring, idx) => {
                const pointIdx = idx * 3;
                const pos = trailPositions.current[pointIdx] || blackHoleGroup.position;
                ring.position.copy(pos);

                // Funnel scaling: rings get larger or smaller? 
                // Let's make them shrink and fade out for a tunnel look
                const factor = 1 - (idx / trailCount);
                ring.scale.setScalar(factor * (1 + velocity * 0.2));

                // Orient ring to face the movement (roughly lookAt next point)
                const nextPos = trailPositions.current[pointIdx + 1] || blackHoleGroup.position;
                ring.lookAt(nextPos);

                // Opacity tied to velocity - trail appears when moving
                const alpha = (idx === 0) ? 0 : factor * Math.min(velocity * 0.4, 0.6);
                (ring.material as THREE.MeshBasicMaterial).opacity = alpha;
            });

            // ZOOM PULSATION
            const scaleBase = 1.15;
            const scaleZoom = Math.sin(time * 1.8) * 0.25;
            blackHoleGroup.scale.setScalar(scaleBase + scaleZoom + (velocity * 0.05));

            // Accretion disk High-Speed Spin
            accretionDisk.rotation.z += 0.06;
            accretionDisk.rotation.x = Math.PI / 2.05 + Math.sin(time * 1.2) * 0.15;

            diskLight.position.copy(blackHoleGroup.position);

            // Starfield - Velocity Stretching Simulation
            const positions = starGeometry.attributes.position.array as Float32Array;
            for (let i = 0; i < starCount; i++) {
                // Stars move faster based on black hole velocity
                positions[i * 3 + 2] += starVelocities[i] * (1.5 + velocity * 0.5);
                if (positions[i * 3 + 2] > 500) {
                    positions[i * 3 + 2] = -5500;
                }
            }
            starGeometry.attributes.position.needsUpdate = true;

            // Camera Response
            camera.position.x += (mouse.current.x * 12 - camera.position.x) * 0.02;
            camera.position.y += (mouse.current.y * 10 - camera.position.y) * 0.02;
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
