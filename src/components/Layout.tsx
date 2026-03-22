import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function Layout({ children }: { children: React.ReactNode }) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const transitionOverlayRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Custom Cursor
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMouseMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  // Scroll Progress Bar
  useEffect(() => {
    const progress = progressRef.current;
    if (!progress) return;

    gsap.to(progress, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    });
  }, [location.pathname]); // Re-init on route change

  // Page Transition
  useGSAP(() => {
    const overlay = transitionOverlayRef.current;
    if (!overlay) return;

    // Sweep out on new page load
    gsap.fromTo(overlay, 
      { scaleY: 1, transformOrigin: 'top' },
      { scaleY: 0, duration: 0.8, ease: 'power3.inOut' }
    );
  }, [location.pathname]);

  return (
    <>
      {/* Scroll Progress Bar */}
      <div 
        ref={progressRef} 
        className="fixed top-0 left-0 w-full h-1 bg-orange-600 z-[100] origin-left scale-x-0"
      />

      {/* Custom Cursor */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-4 h-4 bg-orange-500 rounded-full pointer-events-none z-[100] mix-blend-difference -translate-x-1/2 -translate-y-1/2 hidden md:block"
      />

      {/* Page Transition Overlay */}
      <div 
        id="page-transition-overlay"
        ref={transitionOverlayRef}
        className="fixed inset-0 bg-zinc-900 z-[90] pointer-events-none origin-top"
      />

      {children}
    </>
  );
}
