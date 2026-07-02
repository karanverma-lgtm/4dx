'use client';

import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface LottieProgressBarProps {
  progress: number; // 0 to 100
}

export default function LottieProgressBar({ progress }: LottieProgressBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load Lottie progress bar animation
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: '/progress-bar.json'
    });

    animRef.current = anim;

    anim.addEventListener('DOMLoaded', () => {
      const totalFrames = anim.totalFrames || 706;
      // Clamp progress between 0 and 100
      const clamped = Math.max(0, Math.min(progress, 100));
      const targetFrame = (clamped / 100) * totalFrames;
      anim.goToAndStop(targetFrame, true);
    });

    return () => {
      anim.destroy();
    };
  }, []);

  // Update Lottie frame on progress changes
  useEffect(() => {
    const anim = animRef.current;
    if (!anim) return;

    const totalFrames = anim.totalFrames || 706;
    const clamped = Math.max(0, Math.min(progress, 100));
    const targetFrame = (clamped / 100) * totalFrames;

    anim.goToAndStop(targetFrame, true);
  }, [progress]);

  return (
    <div className="relative w-full h-[100px] md:h-[130px] overflow-hidden flex items-center justify-center bg-surface-container-low/20 rounded-xl border border-outline-variant/15 p-2 shadow-inner">
      <div 
        ref={containerRef} 
        className="w-full h-full scale-[1.8] sm:scale-[1.4] md:scale-[1.1] pointer-events-none"
        style={{ transformOrigin: 'center center' }}
      />
    </div>
  );
}
