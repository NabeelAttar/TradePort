'use client';

import React from 'react';

interface PaymentProps {
  fill?: string;
  size?: number;
}

const Payment = ({ fill = '#969696', size = 24 }: PaymentProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Card body */}
      <rect x="2" y="5" width="20" height="14" rx="3" fill={fill} />

      {/* Card stripe */}
      <rect x="2" y="9" width="20" height="2" fill="#00000033" />

      {/* Small chip / detail */}
      <rect x="5" y="13" width="5" height="3" rx="1" fill="#ffffff" opacity="0.85" />
    </svg>
  );
};

export default Payment;
