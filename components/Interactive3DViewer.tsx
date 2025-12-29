
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type AnimationType = 'quantum' | 'neural' | 'shield';

interface Props {
  type?: AnimationType;
}

const Interactive3DViewer: React.FC<Props> = ({ type = 'quantum' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene Setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 2. Interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // Disable zoom to allow page scrolling
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;
    controls.maxDistance = 10;
    controls.minDistance = 2;

    const group = new THREE.Group();
    scene.add(group);

    // 3. Conditional Object Rendering based on 'type'
    if (type === 'quantum') {
      // Inner Core
      const coreGeom = new THREE.IcosahedronGeometry(1, 0);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x00f2ff,
        emissive: 0x00f2ff,
        emissiveIntensity: 2,
        wireframe: true,
        transparent: true,
        opacity: 0.8
      });
      const core = new THREE.Mesh(coreGeom, coreMat);
      group.add(core);

      const shellGeom = new THREE.IcosahedronGeometry(1.6, 1);
      const shellMat = new THREE.MeshBasicMaterial({
        color: 0xbc13fe,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      });
      const shell = new THREE.Mesh(shellGeom, shellMat);
      group.add(shell);
    } else if (type === 'neural') {
      // Neural Network Animation
      const pointsCount = 60;
      const positions = new Float32Array(pointsCount * 3);
      for (let i = 0; i < pointsCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 3;
      }
      const pointsGeom = new THREE.BufferGeometry();
      pointsGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const pointsMat = new THREE.PointsMaterial({ color: 0x00f2ff, size: 0.08 });
      const points = new THREE.Points(pointsGeom, pointsMat);
      group.add(points);

      // Connecting lines for neural look
      const lineMat = new THREE.LineBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.2 });
      const lineGeom = new THREE.IcosahedronGeometry(1.5, 2);
      const lines = new THREE.LineSegments(new THREE.WireframeGeometry(lineGeom), lineMat);
      group.add(lines);
    } else if (type === 'shield') {
      // Security Shield Animation
      const shieldGeom = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
      const shieldMat = new THREE.MeshStandardMaterial({
        color: 0xbc13fe,
        emissive: 0xbc13fe,
        emissiveIntensity: 1.5,
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });
      const shield = new THREE.Mesh(shieldGeom, shieldMat);
      group.add(shield);

      const ringGeom = new THREE.TorusGeometry(1.8, 0.05, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.4 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
    }

    // Lights
    const pLight1 = new THREE.PointLight(0x00f2ff, 10, 10);
    pLight1.position.set(2, 2, 2);
    scene.add(pLight1);

    const pLight2 = new THREE.PointLight(0xbc13fe, 10, 10);
    pLight2.position.set(-2, -2, -2);
    scene.add(pLight2);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    // 4. Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      group.rotation.y += 0.005;
      group.rotation.x += 0.002;
      renderer.render(scene, camera);
    };

    animate();

    // 5. Cleanup & Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
      renderer.dispose();
      controls.dispose();
    };
  }, [type]);

  return (
    <div className="relative w-full h-full min-h-[300px] cursor-grab active:cursor-grabbing">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute bottom-4 left-4 pointer-events-none opacity-40">
        <span className="text-[8px] mono uppercase tracking-widest text-cyan-400">Gedrückt halten zum Rotieren</span>
      </div>
    </div>
  );
};

export default Interactive3DViewer;
