import React from "react";

const GoogleButton = () => {
  return (
    <div className="flex justify-center mt-4">
      <button
        type="button"
        className="
          flex items-center gap-2
          px-4 py-2
          rounded-md
          border border-blue-200
          bg-blue-50
          hover:bg-blue-100
          transition
        "
      >
        {/* Google Icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.32 1.54 7.77 2.83l5.65-5.65C33.9 3.43 29.45 1.5 24 1.5 14.95 1.5 7.1 6.97 3.4 14.91l6.91 5.36C12.02 14.02 17.56 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.5 24c0-1.64-.15-3.22-.43-4.75H24v9h12.7c-.55 2.98-2.21 5.5-4.7 7.2l7.23 5.62C43.43 37.25 46.5 31.15 46.5 24z"/>
          <path fill="#FBBC05" d="M10.31 28.27c-.48-1.43-.76-2.95-.76-4.52s.28-3.09.76-4.52l-6.91-5.36C1.93 17.07 1 20.45 1 23.75s.93 6.68 2.4 9.88l6.91-5.36z"/>
          <path fill="#34A853" d="M24 46.5c6.48 0 11.92-2.14 15.9-5.83l-7.23-5.62c-2.01 1.35-4.58 2.15-8.67 2.15-6.44 0-11.98-4.52-13.69-10.77l-6.91 5.36C7.1 41.03 14.95 46.5 24 46.5z"/>
        </svg>

        {/* Text */}
        <span className="font-medium text-gray-800">
          Sign In with Google
        </span>
      </button>
    </div>
  );
};

export default GoogleButton;
