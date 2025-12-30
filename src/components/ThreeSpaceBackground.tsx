
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeSpaceBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouse = useRef({ x: 0, y: 0 });
    const viewBounds = useRef({ width: 500, height: 400 });
    const trailPositions = useRef<THREE.Vector3[]>([]);
    const MAX_TRAIL_POINTS = 25; // Longer trail

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
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        // Intense core light (Vanguard Star)
        const starLight = new THREE.PointLight(0x00f2ff, 100, 2000);
        scene.add(starLight);

        const secondaryLight = new THREE.PointLight(0xbc13fe, 50, 1500);
        secondaryLight.position.set(-200, 100, -300);
        scene.add(secondaryLight);

        // 3. The Vanguard Star (Crystal)
        const starGroup = new THREE.Group();
        starGroup.position.set(0, 0, -350);
        scene.add(starGroup);

        // Core Crystal
        const crystalGeom = new THREE.IcosahedronGeometry(20, 0); // Sharp edges
        const crystalMat = new THREE.MeshStandardMaterial({
            color: 0x00f2ff,
            emissive: 0x00f2ff,
            emissiveIntensity: 10,
            wireframe: false,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.95
        });
        const crystal = new THREE.Mesh(crystalGeom, crystalMat);
        starGroup.add(crystal);

        // Outer Wireframe
        const wireGeom = new THREE.IcosahedronGeometry(25, 0);
        const wireMat = new THREE.MeshBasicMaterial({
            color: 0xbc13fe,
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });
        const wireframe = new THREE.Mesh(wireGeom, wireMat);
        starGroup.add(wireframe);

        // Glow Aura
        const auraGeom = new THREE.SphereGeometry(35, 32, 32);
        const auraMat = new THREE.ShaderMaterial({
            uniforms: {
                c: { value: 0.1 },
                p: { value: 4.5 },
                glowColor: { value: new THREE.Color(0x00f2ff) },
                viewVector: { value: camera.position }
            },
            vertexShader: `
                uniform vec3 viewVector;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize( normalMatrix * normal );
                    vec3 vNormel = normalize( normalMatrix * viewVector );
                    intensity = pow( c - dot(vNormal, vNormel), p );
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4( glow, 1.0 );
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        // Simplified fallback for glow if shader is complex for user
        const simpleAuraMat = new THREE.MeshBasicMaterial({
            color: 0x00f2ff,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending
        });
        const aura = new THREE.Mesh(auraGeom, simpleAuraMat);
        starGroup.add(aura);

        // 4. Digital Flow Trail
        const trailGroup = new THREE.Group();
        scene.add(trailGroup);

        const trailRings: THREE.Mesh[] = [];
        const trailCount = MAX_TRAIL_POINTS;
        const ringGeom = new THREE.TorusGeometry(20, 0.5, 4, 32);

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

        // 5. Dynamic Starfield
        const starCount = 8000;
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        const starVelocities = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            starPositions[i * 3] = (Math.random() - 0.5) * 4500;
            starPositions[i * 3 + 1] = (Math.random() - 0.5) * 3500;
            starPositions[i * 3 + 2] = (Math.random() * -6000);
            starVelocities[i] = Math.random() * 3.5 + 1.0;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starMaterial = new THREE.PointsMaterial({
            size: 1.2,
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

            // Tracking & Drift
            const mouseTargetX = (mouse.current.x * viewBounds.current.width) * 0.45;
            const mouseTargetY = (mouse.current.y * viewBounds.current.height) * 0.45;
            const driftX = Math.sin(time * 0.8) * 15;
            const driftY = Math.cos(time * 0.7) * 10;

            const targetX = mouseTargetX + driftX;
            const targetY = mouseTargetY + driftY;

            const oldPos = starGroup.position.clone();
            starGroup.position.x += (targetX - starGroup.position.x) * 0.1;
            starGroup.position.y += (targetY - starGroup.position.y) * 0.1;

            const velocity = starGroup.position.distanceTo(oldPos);

            // Rotate Crystal
            crystal.rotation.y += 0.04 + velocity * 0.02;
            crystal.rotation.z += 0.02;
            wireframe.rotation.y -= 0.02;
            wireframe.rotation.z -= 0.01;

            // Pulsate Aura
            aura.scale.setScalar(1 + Math.sin(time * 4) * 0.1 + velocity * 0.1);

            // Update Trail
            trailPositions.current.unshift(starGroup.position.clone());
            if (trailPositions.current.length > trailCount * 4) {
                trailPositions.current.pop();
            }

            trailRings.forEach((ring, idx) => {
                const pointIdx = idx * 2;
                const pos = trailPositions.current[pointIdx] || starGroup.position;
                ring.position.copy(pos);

                const factor = 1 - (idx / trailCount);
                ring.scale.setScalar(factor * (0.8 + velocity * 0.5));

                const nextPos = trailPositions.current[pointIdx + 1] || starGroup.position;
                ring.lookAt(nextPos);

                const alpha = factor * Math.min(velocity * 0.8, 0.9);
                (ring.material as THREE.MeshBasicMaterial).opacity = alpha;
            });

            // Starfield
            const positions = starGeometry.attributes.position.array as Float32Array;
            for (let i = 0; i < starCount; i++) {
                positions[i * 3 + 2] += starVelocities[i] * (2.0 + velocity * 1.5);
                if (positions[i * 3 + 2] > 500) {
                    positions[i * 3 + 2] = -5500;
                }
            }
            starGeometry.attributes.position.needsUpdate = true;

            starLight.position.copy(starGroup.position);

            // Camera Motion
            camera.position.x += (mouse.current.x * 15 - camera.position.x) * 0.05;
            camera.position.y += (mouse.current.y * 12 - camera.position.y) * 0.05;
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
