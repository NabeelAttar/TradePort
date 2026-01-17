import * as React from "react";

const ProfileIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={17}
    height={21}
    viewBox="0 0 17 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      cx="8.57894"
      cy="5.77803"
      r="4.77803"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.00002 17.2014C0.998732 16.8655 1.07385 16.5337 1.2197 16.2311C1.67736 15.3158 2.96798 14.8307 4.03892 14.611C4.81128 14.4462 5.59431 14.336 6.38217 14.2815C7.84084 14.1533 9.30793 14.1533 10.7666 14.2815C11.5544 14.336 12.3374 14.4462 13.1098 14.611C14.1807 14.8307 15.4713 15.3158 15.929 16.2311C16.0749 16.5337 16.15 16.8655 16.1487 17.2014"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ProfileIcon;
