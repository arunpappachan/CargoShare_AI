import React, { useRef, useState, useCallback } from 'react';

export default function TiltCard({
  children,
  className = '',
  maxTilt = 8, // subtle max degrees
  glare = true,
  scale = 1.02,
}) {
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('');
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, 1)`);

    if (glare) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      setGlarePosition({ x: glareX, y: glareY, opacity: 0.18 });
    }
  }, [maxTilt, glare, scale]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
        willChange: 'transform',
      }}
      className={`relative group preserve-3d transition-shadow duration-300 ${className}`}
    >
      {/* Dynamic border glow */}
      <div
        className="absolute -inset-px rounded-3xl bg-gradient-to-r from-brand-500/0 via-brand-500/25 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
      />

      {children}

      {/* Dynamic Cursor Glare */}
      {glare && (
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden z-20 transition-opacity duration-300"
          style={{
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle 280px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.45), transparent 75%)`,
          }}
        />
      )}
    </div>
  );
}
