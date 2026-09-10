import React from 'react';
import { useReveal } from '../../hooks/useReveal';

export default function RevealSection({
  children,
  className = '',
  id,
  delay = 0,
  threshold = 0.15,
  as: Component = 'section',
}) {
  const [ref, isVisible] = useReveal({ threshold });

  return (
    <Component
      ref={ref}
      id={id}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      } ${className}`}
    >
      {children}
    </Component>
  );
}
