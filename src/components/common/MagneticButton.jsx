import React, { useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

export default function MagneticButton({
  children,
  to,
  onClick,
  className = '',
  strength = 0.28,
  type = 'button',
  disabled = false,
  ...props
}) {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState([]);

  const handleMouseMove = useCallback((e) => {
    if (!buttonRef.current || disabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;

    setPosition({ x, y });
  }, [strength, disabled]);

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleClick = (e) => {
    if (disabled) return;
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now() + Math.random();

      setRipples((prev) => [...prev, { x, y, id }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 650);
    }

    if (onClick) {
      onClick(e);
    }
  };

  const style = {
    transform: `translate3d(${position.x.toFixed(2)}px, ${position.y.toFixed(2)}px, 0)`,
    transition: position.x === 0 && position.y === 0 ? 'transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1)' : 'transform 0.1s linear',
    willChange: 'transform',
  };

  const content = (
    <>
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {/* Ripple elements */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none bg-white/35 animate-ripple z-0"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 24,
            height: 24,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </>
  );

  const sharedClasses = `relative overflow-hidden select-none inline-flex items-center justify-center transition-shadow duration-200 ${className}`;

  if (to) {
    return (
      <Link
        ref={buttonRef}
        to={to}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={style}
        className={sharedClasses}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={style}
      className={sharedClasses}
      {...props}
    >
      {content}
    </button>
  );
}
