import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * LuminaSelect — custom dark-themed dropdown matching the Lumina design system.
 * Props: options (array of strings or {value,label}), value, onChange, placeholder, icon
 */
function LuminaSelect({ options = [], value, onChange, placeholder = 'Select…', icon: Icon, name }) {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const normalised = options.map(o => typeof o === 'string' ? { value: o, label: o } : o);
  const selected   = normalised.find(o => o.value === value);

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none' }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '13px 16px', borderRadius: 'var(--r-sm, 10px)',
          border: `1px solid ${open ? 'var(--cyan, #2fd8ee)' : 'var(--border-strong, rgba(255,255,255,0.13))'}`,
          background: open ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
          boxShadow: open ? '0 0 0 4px rgba(47,216,238,0.12)' : 'none',
          cursor: 'pointer', fontSize: 14.5, color: selected ? 'var(--text, #eef1fb)' : 'var(--text-faint, #5c6480)',
          transition: 'border-color .25s, box-shadow .25s, background .25s',
        }}
      >
        {Icon && <Icon size={16} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />}
        <span style={{ flex: 1 }}>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={15} style={{
          color: 'var(--text-faint)', flexShrink: 0,
          transition: 'transform .25s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }} />
      </div>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          background: 'linear-gradient(135deg, rgba(13,17,32,0.98), rgba(8,11,20,1))',
          border: '1px solid var(--border-strong, rgba(255,255,255,0.13))',
          borderRadius: 'var(--r-md, 16px)',
          boxShadow: '0 20px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(47,216,238,0.1)',
          zIndex: 999, overflow: 'hidden',
          animation: 'fadeUp .2s cubic-bezier(.16,.84,.44,1) both',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Top sheen */}
          <div style={{
            position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(47,216,238,0.3), transparent)',
            pointerEvents: 'none',
          }} />

          <div style={{ padding: '6px', maxHeight: 260, overflowY: 'auto' }}>
            {normalised.map(opt => {
              const isActive = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 14,
                    background: isActive ? 'rgba(47,216,238,0.1)' : 'transparent',
                    color: isActive ? 'var(--cyan, #2fd8ee)' : 'var(--text-dim, #9aa2ba)',
                    fontWeight: isActive ? 600 : 400,
                    transition: 'background .15s, color .15s',
                  }}
                  onMouseOver={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text, #eef1fb)'; } }}
                  onMouseOut={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dim, #9aa2ba)'; } }}
                >
                  <span>{opt.label}</span>
                  {isActive && <Check size={14} style={{ color: 'var(--cyan, #2fd8ee)', flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default LuminaSelect;
