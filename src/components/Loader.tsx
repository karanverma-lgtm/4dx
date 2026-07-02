'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import lottie from 'lottie-web';

interface LoaderProps {
  size?: number;
  text?: string;
  fullScreen?: boolean;
}

export default function Loader({ size = 180, text = "Loading dashboard...", fullScreen = false }: LoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load Lottie animation
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/loading-hand.json'
    });

    return () => {
      anim.destroy();
    };
  }, []);

  const content = (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Lottie Animation container */}
      <div 
        ref={containerRef} 
        style={{ width: size, height: size }} 
        className="relative"
      />
      {text && (
        <motion.p 
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-body-md font-bold text-on-surface/80 tracking-wide mt-2 font-headline-md bg-surface-container-high/40 px-4 py-1.5 rounded-full border border-outline-variant/15 shadow-sm"
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface-bright bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface-bright via-surface-bright/95 to-surface-bright/90 backdrop-blur-xl">
        {/* Decorative glassmorphic card for loader container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-surface-container-lowest/80 border border-outline-variant/35 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4"
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return content;
}
