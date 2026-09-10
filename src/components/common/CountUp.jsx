import React, { useState, useEffect, useRef } from 'react';

export default function CountUp({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(end);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimatedRef.current) {
        hasAnimatedRef.current = true;
        observer.unobserve(element);

        const startTime = performance.now();

        const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeOutExpo(progress);
          const currentVal = easedProgress * end;

          setCount(currentVal);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setCount(end);
          }
        };

        requestAnimationFrame(animate);
      }
    }, {
      threshold: 0.2,
    });

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [end, duration]);

  const formattedCount = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString();

  return (
    <span ref={elementRef} className={className}>
      {prefix}{formattedCount}{suffix}
    </span>
  );
}
