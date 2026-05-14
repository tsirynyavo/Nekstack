import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Particles3D = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialisation de la scène
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Caméra
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Création des particules - style "cristal universe" [citation:7]
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3000;
    
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    
    const colorPalette = [
      new THREE.Color(0x00ffff), // cyan
      new THREE.Color(0xa855f7), // purple
      new THREE.Color(0xec4899), // pink
      new THREE.Color(0x06b6d4), // cyan dark
      new THREE.Color(0x8b5cf6), // purple light
    ];
    
    for (let i = 0; i < particlesCount; i++) {
      // Position en forme de sphère
      const radius = 5 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Couleur aléatoire
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Matériau des particules
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    particlesRef.current = particlesMesh;
    
    // Ajout d'une sphère centrale avec effet néon [citation:4]
    const coreGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.15,
      wireframe: true,
    });
    const coreSphere = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreSphere);
    
    // Étoiles lointaines
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 200;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 40;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.5,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    // Lumières
    const ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00ffff, 0.5);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0xa855f7, 0.5);
    pointLight2.position.set(-3, 2, 4);
    scene.add(pointLight2);
    
    // Animation
    let mouseX = 0, mouseY = 0;
    
    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    let time = 0;
    
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.005;
      
      // Rotation des particules
      if (particlesRef.current) {
        particlesRef.current.rotation.y = time * 0.2;
        particlesRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
      }
      
      // Suivi de la souris
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      
      // Pulsation de la sphère centrale
      const scale = 1 + Math.sin(time * 3) * 0.03;
      coreSphere.scale.set(scale, scale, scale);
      
      // Rotation des étoiles
      stars.rotation.y += 0.0005;
      stars.rotation.x += 0.0003;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Redimensionnement
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current?.domElement) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};