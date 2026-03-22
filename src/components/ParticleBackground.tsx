import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Bourich Digital Colors: Orange, Amber, White
    const colors = ['#ea580c', '#d97706', '#fbbf24', '#ffffff', '#f97316'];

    class Particle {
      x: number;
      y: number;
      z: number;
      color: string;
      radius: number;
      originalX: number;
      originalY: number;

      constructor() {
        this.x = (Math.random() - 0.5) * canvas!.width * 2;
        this.y = (Math.random() - 0.5) * canvas!.height * 2;
        this.z = Math.random() * canvas!.width;
        this.originalX = this.x;
        this.originalY = this.y;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.radius = Math.random() * 1.5 + 0.5;
      }

      update() {
        this.z -= 2; // Speed of movement towards viewer
        if (this.z <= 0) {
          this.z = canvas!.width;
          this.x = (Math.random() - 0.5) * canvas!.width * 2;
          this.y = (Math.random() - 0.5) * canvas!.height * 2;
          this.originalX = this.x;
          this.originalY = this.y;
        }
      }

      draw() {
        if (!ctx || !canvas) return;
        
        // Perspective projection
        const x = (this.originalX / this.z) * 100 + canvas.width / 2;
        const y = (this.originalY / this.z) * 100 + canvas.height / 2;
        const radius = (100 / this.z) * this.radius;

        // Don't draw if out of bounds (optimization)
        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) return;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      // Number of particles
      for (let i = 0; i < 800; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      
      // Clear with a slight fade effect for trails (optional, but clean clear is better for this style)
      ctx.fillStyle = '#000000'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full object-cover" />;
};

export default ParticleBackground;
