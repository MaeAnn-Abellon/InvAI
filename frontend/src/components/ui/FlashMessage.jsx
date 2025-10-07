import React, { useEffect, useState } from 'react';

/**
 * Lightweight inline flash message component.
 * Props:
 *  - message: string (required)
 *  - type: 'info' | 'success' | 'error' (default 'info')
 *  - duration: ms before auto-hide (optional; no auto-hide if omitted)
 */
export default function FlashMessage({ message, type = 'info', duration }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!duration) return;
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [duration]);
  if (!visible || !message) return null;
  const palette = {
    info: { bg: '#eff6ff', border: '#3b82f6', color: '#1e3a8a' },
    success: { bg: '#ecfdf5', border: '#10b981', color: '#065f46' },
    error: { bg: '#fef2f2', border: '#ef4444', color: '#991b1b' }
  }[type];
  return (
    <div style={{
      background: palette.bg,
      border: '1px solid ' + palette.border,
      color: palette.color,
      padding: '.65rem .9rem',
      borderRadius: '10px',
      fontSize: '.75rem',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '.6rem',
      boxShadow: '0 4px 16px -6px rgba(0,0,0,.08)'
    }}>
      <span>{message}</span>
      {duration && (
        <button
          onClick={() => setVisible(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: palette.color,
            cursor: 'pointer',
            fontSize: '.85rem',
            lineHeight: 1
          }}
          aria-label="Dismiss"
        >×</button>
      )}
    </div>
  );
}
