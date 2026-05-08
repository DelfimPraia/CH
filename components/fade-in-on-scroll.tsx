'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type Props = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  /** Selector targeting children to stagger (e.g. '> *', '.card'). If set, children animate in sequence. */
  stagger?: string;
  className?: string;
};

/**
 * GSAP ScrollTrigger fade-up wrapper. Animates the wrapped element (or its
 * staggered children) into view as it enters the viewport. Plays once.
 */
export default function FadeInOnScroll({
  children,
  delay = 0,
  duration = 0.9,
  y = 30,
  stagger,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const targets = stagger ? el.querySelectorAll(stagger) : el;
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: 'power2.out',
          stagger: stagger ? 0.08 : 0,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [delay, duration, y, stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
