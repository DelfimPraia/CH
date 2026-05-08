'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Cyan radial gradient that follows the mouse inside the parent element.
 * Inspira-UI style — no Framer Motion needed, vanilla CSS variables.
 *
 * Place inside a `relative` parent. Reduces motion gracefully on touch devices.
 */
export default function Spotlight({
  className,
  size = 600,
  intensity = 0.18,
}: {
  className?: string;
  size?: number;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    let raf = 0;

    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--spot-x', `${x}px`);
        el.style.setProperty('--spot-y', `${y}px`);
        el.style.opacity = '1';
      });
    };

    const onLeave = () => {
      el.style.opacity = '0';
    };

    parent.addEventListener('mousemove', onMove);
    parent.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      parent.removeEventListener('mousemove', onMove);
      parent.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300',
        className,
      )}
      style={{
        background: `radial-gradient(${size}px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(249, 115, 22, ${intensity}), transparent 45%)`,
      }}
    />
  );
}
