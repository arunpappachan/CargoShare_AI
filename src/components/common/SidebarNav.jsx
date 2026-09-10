import React, { useRef, useState, useEffect, useCallback } from 'react';

const ACCENT_STYLES = {
  exporter: {
    pill: 'bg-gradient-to-r from-brand-600 to-brand-500 shadow-brand-500/30 border border-brand-400/30',
    activeText: 'text-white font-semibold',
    inactiveText: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40',
    badge: 'bg-brand-400/30 text-white',
  },
  carrier: {
    pill: 'bg-blue-600 shadow-blue-500/30 border border-blue-400/30',
    activeText: 'text-white font-semibold',
    inactiveText: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40',
    badge: 'bg-blue-400/30 text-white',
  },
  admin: {
    pill: 'bg-gradient-to-r from-purple-600 to-purple-500 shadow-purple-500/30 border border-purple-400/30',
    activeText: 'text-white font-semibold',
    inactiveText: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40',
    badge: 'bg-purple-400/30 text-white',
  },
};

export default function SidebarNav({
  items = [],
  activeKey,
  activeId,
  onChange,
  accentClass,
  accent = 'exporter', // 'exporter' | 'carrier' | 'admin'
  className = '',
}) {
  const currentKey = activeKey !== undefined ? activeKey : activeId;
  const containerRef = useRef(null);
  const itemRefs = useRef({});
  const [pillLayout, setPillLayout] = useState({ top: 0, height: 0, ready: false });

  const activeTheme = ACCENT_STYLES[accent] || ACCENT_STYLES.exporter;
  const pillClass = accentClass || activeTheme.pill;

  const measure = useCallback(() => {
    const activeEl = itemRefs.current[currentKey];
    if (activeEl) {
      setPillLayout({
        top: activeEl.offsetTop,
        height: activeEl.offsetHeight,
        ready: true,
      });
    }
  }, [currentKey]);

  useEffect(() => {
    measure();

    // Re-measure once the web font has actually finished loading —
    // metrics can shift after the initial fallback-font layout.
    document.fonts?.ready?.then(measure);

    // Re-measure on resize/zoom.
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure, items]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(measure);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <nav ref={containerRef} className={`relative flex-1 px-4 py-6 space-y-2 select-none ${className}`}>
      {/* Sliding Active Pill */}
      {pillLayout.ready && (
        <div
          className={`absolute left-4 right-4 top-0 rounded-2xl transition-all duration-300 ease-out shadow-lg pointer-events-none z-0 ${pillClass}`}
          style={{
            transform: `translate3d(0, ${pillLayout.top}px, 0)`,
            height: `${pillLayout.height}px`,
          }}
        />
      )}

      {/* Nav items */}
      {items.map((item) => {
        const itemKey = item.key !== undefined ? item.key : item.id;
        const isActive = currentKey === itemKey;
        const Icon = item.icon;

        return (
          <button
            key={itemKey}
            ref={(el) => {
              if (el) itemRefs.current[itemKey] = el;
            }}
            type="button"
            onClick={() => onChange(itemKey)}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left relative z-10 text-sm transition-all duration-200 ${
              isActive ? activeTheme.activeText : activeTheme.inactiveText
            }`}
          >
            <div className="flex items-center gap-3">
              {Icon && (
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
              )}
              <span>{item.label}</span>
            </div>

            {item.badge !== undefined && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
                  isActive ? activeTheme.badge : 'bg-slate-800 text-slate-400'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
