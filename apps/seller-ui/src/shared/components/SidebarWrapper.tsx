'use client';
import React, { useEffect } from 'react'
import useSidebar from '../../hooks/useSidebar'
import { usePathname } from 'next/navigation';
import useSeller from '../../hooks/useSeller';

const SidebarWrapper = () => {
    const {activeSidebar, setActiveSidebar} = useSidebar();
    const pathName = usePathname();
    const {seller} = useSeller();

    useEffect(() => {
        setActiveSidebar(pathName);
    }, [pathName, setActiveSidebar])

    const getIconColor = (route: string) => activeSidebar === route ? '#0085ff' : '#969696';

  return (
    <div>SidebarWrapper</div>
  )
}

export default SidebarWrapper