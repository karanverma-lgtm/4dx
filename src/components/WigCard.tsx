'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Metric } from '../data/mockData';

interface WigCardProps {
  title: string;
  subtitle: string;
  iconName: string;
  metric: Metric;
  isCurrency: boolean;
  type: 'revenue' | 'pipeline' | 'seats';
  onEdit?: () => void;
  onEditTarget?: () => void;
}

function AnimatedCount({ value, isCurrency }: { value: number; isCurrency: boolean }) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const prevValueRef = useRef<number>(0);

  useEffect(() => {
    const obj = { val: prevValueRef.current };

    const formatValue = (v: number) => {
      const rounded = Math.round(v);
      if (isCurrency) {
        return '₹' + rounded.toLocaleString('en-IN');
      }
      return rounded.toString();
    };

    // Animate from previous value to the new value
    const anim = gsap.to(obj, {
      val: value,
      duration: 1.2,
      ease: 'power3.out',
      onUpdate: () => {
        if (elementRef.current) {
          elementRef.current.textContent = formatValue(obj.val);
        }
      },
    });

    prevValueRef.current = value;

    return () => {
      anim.kill();
    };
  }, [value, isCurrency]);

  return <span ref={elementRef} />;
}

export default function WigCard({
  title,
  subtitle,
  iconName,
  metric,
  isCurrency,
  type,
  onEdit,
  onEditTarget,
}: WigCardProps) {
  const isErrorColor = type === 'pipeline';

  // Highlight style presets matching DESIGN.md and code.html
  const iconBgClass = isErrorColor ? 'bg-error/10 text-error ring-error/20' : 'bg-primary/10 text-primary ring-primary/20';
  const textValClass = isErrorColor ? 'text-error' : 'text-primary';
  const progressBgClass = isErrorColor 
    ? 'bg-gradient-to-r from-error-container to-error shadow-[0_0_12px_rgba(186,26,26,0.5)]' 
    : 'bg-gradient-to-r from-secondary-fixed-dim to-secondary shadow-[0_0_12px_rgba(0,108,73,0.6)]';
  const badgeClass = isErrorColor 
    ? 'text-error bg-error/10 ring-error/30' 
    : 'text-secondary bg-secondary/10 ring-secondary/30';
  const percentTextClass = isErrorColor ? 'text-error' : 'text-secondary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
      className="bg-surface-container-lowest/70 backdrop-blur-xl border border-outline-variant/30 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden transition-all duration-300 relative group p-6 flex flex-col gap-5"
    >
      <div 
        className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 opacity-0 group-hover:opacity-100 pointer-events-none ${
          isErrorColor ? 'from-error/5 to-transparent' : 'from-primary/5 to-transparent'
        }`} 
      />

      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-xl shadow-sm ring-1 ${iconBgClass}`}>
            <span className="material-symbols-outlined text-[28px]">{iconName}</span>
          </div>
          <div>
            <h4 className="font-headline-md text-[20px] font-bold text-on-surface mb-0.5">{title}</h4>
            <p className="font-body-sm text-on-surface-variant">{subtitle}</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-1.5 group/edit">
            <div className={`font-display-lg text-[42px] font-bold tracking-tighter leading-none mb-1 ${textValClass}`}>
              <AnimatedCount value={metric.current} isCurrency={isCurrency} />
            </div>
            {onEdit && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEdit}
                className="p-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors shadow-sm border border-outline-variant/20 bg-surface-container-lowest/80"
                title="Update WIG Value"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </motion.button>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${badgeClass}`}>
              Target: {metric.formattedTarget}
            </span>
            {onEditTarget && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEditTarget}
                className="p-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors shadow-sm border border-outline-variant/20 bg-surface-container-lowest/80 flex items-center justify-center cursor-pointer"
                title="Set Target"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-1">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Progress</span>
          <span className={`text-sm font-bold ${percentTextClass}`}>{metric.progress}%</span>
        </div>
        <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden relative shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${metric.progress}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
            className={`absolute top-0 left-0 h-full rounded-full`}
            style={{
              background: isErrorColor
                ? 'linear-gradient(to right, var(--color-error-container), var(--color-error))'
                : 'linear-gradient(to right, var(--color-secondary-fixed-dim), var(--color-secondary))',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
