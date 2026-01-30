'use client';

import React from 'react';

const Logo = () => {
  return (
    <div
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        backgroundColor: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {/* Simple grid-style logo */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
      >
        <rect x="3" y="3" width="7" height="7" fill="#fff" />
        <rect x="14" y="3" width="7" height="7" fill="#fff" />
        <rect x="3" y="14" width="7" height="7" fill="#fff" />
        <rect x="14" y="14" width="7" height="7" fill="#fff" />
      </svg>
    </div>
  );
};

export default Logo;
