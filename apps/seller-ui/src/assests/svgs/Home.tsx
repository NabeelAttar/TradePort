'use client';

import React from 'react';

interface HomeProps {
  fill?: string;
  size?: number;
}

const Home = ({ fill = '#969696', size = 18 }: HomeProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15C14.4477 21 14 20.5523 14 20V15H10V20C10 20.5523 9.55228 21 9 21H4C3.44772 21 3 20.5523 3 20V10.5Z"
        fill={fill}
      />
    </svg>
  );
};

export default Home;
