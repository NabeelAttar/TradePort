import Link from 'next/link';
import React from 'react'

interface Props {
    title: string;
    icon: React.ReactNode;
    isActive: boolean;
    href: string
}
const SidebarItems = ({icon, title, isActive, href} : Props) => {
  return (
    <Link href={href} className='my-2 block'>
        <div className={`flex gap-2 w-full min-h-12 h-full items-center px-[13px] rounded-lg cursor-pointer transition hover:bg-[#2b3f31] 
            ${isActive && "scale-[0.98] bg-[#0f3158] fill-blue-200 hover:bg-[#0f3158dc]"}`}
        >
            {icon}
            <h5 className='text-slate-200 text-lg'>
                {title}
            </h5>
        </div>
    </Link>
  )
}

export default SidebarItems