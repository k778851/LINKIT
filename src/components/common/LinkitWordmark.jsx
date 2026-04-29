'use client';

/**
 * LINKIT brand wordmark — gradient icon + Space Grotesk text
 */
export function LinkitWordmark({ size = 28 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* Gradient icon */}
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="wm-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0088FF" />
            <stop offset="1" stopColor="#00C3D0" />
          </linearGradient>
        </defs>
        <rect width="28" height="28" rx="8" fill="url(#wm-grad)" />
        <path d="M8 14 L14 8 L20 14 L14 20 Z" fill="white" opacity="0.9" />
        <circle cx="14" cy="14" r="3" fill="white" />
      </svg>
      {/* Text */}
      <span style={{
        fontFamily: "'Space Grotesk', 'Noto Sans KR', sans-serif",
        fontWeight: 700,
        fontSize: 20,
        letterSpacing: '-0.5px',
        background: 'linear-gradient(90deg, #0088FF 0%, #00C3D0 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        LINKIT
      </span>
    </div>
  );
}
