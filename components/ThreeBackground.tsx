
// @ts-nocheck
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { LuminousMode } from '../types';

const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

const ParticleField = ({ mode }: { mode: LuminousMode }) => {
  const mesh = useRef<THREE.Points>(null!);
  const matRef = useRef<THREE.PointsMaterial>(null!);
  const { pointer } = useThree();
  const count = 5000;
  
  const [positions, colors, baseColors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const base = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      let x = (Math.random() - 0.5) * 80;
      let y = (Math.random() - 0.5) * 60;
      let z = (Math.random() - 0.5) * 40;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      color.set('#22d3ee');
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
      base[i * 3] = color.r;
      base[i * 3 + 1] = color.g;
      base[i * 3 + 2] = color.b;
    }
    return [pos, col, base];
  }, []);

  const velocities = useRef(new Float32Array(count * 3));
  useMemo(() => {
    for (let i = 0; i < count; i++) {
        velocities.current[i * 3] = (Math.random() - 0.5) * 0.02;
        velocities.current[i * 3 + 1] = (Math.random() - 0.5) * 0.04; 
        velocities.current[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
  }, []);

  useEffect(() => {
    if (!mesh.current) return;
    const color = new THREE.Color();
    const colorsArray = mesh.current.geometry.attributes.color.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      if (mode === 'OFF') {
        if (rand > 0.8) color.set('#ffffff');
        else if (rand > 0.4) color.set('#22d3ee');
        else color.set('#3b82f6');
      } else if (mode === 'NIGHT') {
        color.set('#0f172a').lerp(new THREE.Color('#38bdf8'), rand * 0.4);
      } else if (mode === 'SOOTHING') {
        color.set('#4c1d95').lerp(new THREE.Color('#f472b6'), rand * 0.6);
      } else if (mode === 'BRIGHT') {
        color.set('#ffffff').lerp(new THREE.Color('#22d3ee'), rand * 0.9);
      }
      
      baseColors[i * 3] = color.r;
      baseColors[i * 3 + 1] = color.g;
      baseColors[i * 3 + 2] = color.b;
      colorsArray[i * 3] = color.r;
      colorsArray[i * 3 + 1] = color.g;
      colorsArray[i * 3 + 2] = color.b;
    }
    mesh.current.geometry.attributes.color.needsUpdate = true;

    if (matRef.current) {
      let targetSize = 0.12;
      let targetOpacity = 0.6;

      if (mode === 'NIGHT') { targetSize = 0.35; targetOpacity = 0.8; }
      else if (mode === 'SOOTHING') { targetSize = 0.45; targetOpacity = 0.9; }
      else if (mode === 'BRIGHT') { targetSize = 0.6; targetOpacity = 1.0; }

      gsap.to(matRef.current, {
        size: targetSize,
        opacity: targetOpacity,
        duration: 1.2,
        ease: 'power4.inOut'
      });
    }
  }, [mode]);

  useFrame((state) => {
    if (!mesh.current) return;
    
    const positionsArray = mesh.current.geometry.attributes.position.array as Float32Array;
    const vel = velocities.current;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      if (mode !== 'OFF') {
          positionsArray[ix] += Math.sin(time + i) * 0.005;
          positionsArray[iy] += 0.01 + Math.cos(time + i) * 0.005;
      } else {
          positionsArray[ix] += vel[ix];
          positionsArray[iy] += vel[iy];
          positionsArray[iz] += vel[iz];
      }

      if (positionsArray[iy] > 30) positionsArray[iy] = -30;
      if (positionsArray[ix] > 40) positionsArray[ix] = -40;
      if (positionsArray[ix] < -40) positionsArray[ix] = 40;
    }

    mesh.current.geometry.attributes.position.needsUpdate = true;
    
    // Smooth interactive rotation following the pointer
    const targetRotX = -pointer.y * 0.15;
    const targetRotY = pointer.x * 0.15 + time * 0.02;
    mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, targetRotX, 0.05);
    mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, targetRotY, 0.05);

    // Dynamic scaling based on pointer activity
    const activityFactor = (Math.abs(pointer.x) + Math.abs(pointer.y)) * 0.08;
    const targetScale = 1 + activityFactor;
    mesh.current.scale.setScalar(THREE.MathUtils.lerp(mesh.current.scale.x, targetScale, 0.05));
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        ref={matRef}
        size={0.12} 
        vertexColors 
        transparent 
        opacity={0.6} 
        sizeAttenuation={true} 
        depthWrite={false} 
        blending={THREE.AdditiveBlending} 
      />
    </points>
  );
};

const ThreeBackground: React.FC<{ mode?: LuminousMode }> = ({ mode = 'OFF' }) => {
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    setWebGLSupported(isWebGLAvailable());
  }, []);

  if (!webGLSupported) {
    return <div className="fixed inset-0 z-0 bg-[#050505]" />;
  }

  return (
    <div className={`fixed inset-0 z-0 pointer-events-none transition-colors duration-1000 ${mode !== 'OFF' ? 'bg-black' : 'bg-transparent'}`}>
      <Canvas camera={{ position: [0, 0, 20], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <ParticleField mode={mode} />
        <Stars radius={100} depth={50} count={mode === 'OFF' ? 2000 : 500} factor={4} saturation={0} fade speed={1} />
      </Canvas>
      <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-1000 ${mode !== 'OFF' ? 'bg-black/60' : 'bg-transparent'}`} />
    </div>
  );
};

export default ThreeBackground;
