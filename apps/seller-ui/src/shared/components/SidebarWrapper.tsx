'use client';
import React, { useEffect } from 'react'
import useSidebar from '../../hooks/useSidebar'
import { usePathname } from 'next/navigation';
import useSeller from '../../hooks/useSeller';
import Box from './Box';
import { Sidebar } from './sidebar.styles';
import Link from 'next/link';
import Logo from '../../assests/svgs/Logo';
import SidebarItems from './sidebar.items';
import { BellPlus, BellRing, CalendarPlus, ListOrdered, LogOut, Mail, PackageSearch, Settings, SquarePlus, TicketPercent } from 'lucide-react';
import Home from '../../assests/svgs/Home';
import SidebarMenu from './sidebar.menu';
import Payment from '../../assests/svgs/Payment';

const SidebarWrapper = () => {
    const {activeSidebar, setActiveSidebar} = useSidebar();
    const pathName = usePathname();
    const {seller} = useSeller();

    useEffect(() => {
        setActiveSidebar(pathName);
    }, [pathName, setActiveSidebar])

    const getIconColor = (route: string) => activeSidebar === route ? '#0085ff' : '#969696';

  return (
    <Box
     css={{
        height: '100vh',
        zIndex: 202,
        position: 'sticky',
        padding: '8px',
        top: '0',
        overflowY: 'scroll',
        scrollbarWidth: 'none',
      }} 
      className='sidebar-wrapper'
    >
      <Sidebar.Header>
        <Box>
          <Link href={'/'} className='flex justify-center text-center gap-2'>
            <Logo/>
            <Box>
              <h3 className='text-xl font-medium text-[#ecedee]'>
                {seller?.shop?.name}
              </h3>
              <h5 className='font-medium text-xs pl-2 text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]:'>
                {seller?.shop?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className='block my-3 h-full'>
        <Sidebar.Body className='body-sidebar'>
          <SidebarItems 
            title='Dashboard' 
            icon={<Home fill={getIconColor("/dashboard")}/>}
            isActive={activeSidebar === '/dashboard'}
            href='/dashboard'
          />
          <div className='mt-2 block '>
            <SidebarMenu title='Main Menu'>
              <SidebarItems 
                title='Orders' 
                icon={<ListOrdered size={26} color={getIconColor("/dashboard/orders")}/>}
                isActive={activeSidebar === '/dashboard/orders'}
                href='/dashboard/orders'
              />
              <SidebarItems 
                title='Payments' 
                icon={<Payment fill={getIconColor("/dashboard/payments")}/>}
                isActive={activeSidebar === '/dashboard/payments'}
                href='/dashboard/payments'
              />
            </SidebarMenu>
            <SidebarMenu title='Products'>
              <SidebarItems 
                title='Create Product' 
                icon={<SquarePlus size={24} color={getIconColor("/dashboard/create-product")}/>}
                isActive={activeSidebar === '/dashboard/create-product'}
                href='/dashboard/create-product'
              />
              <SidebarItems 
                title='All Products' 
                icon={<PackageSearch size={22} color={getIconColor("/dashboard/all-products")}/>}
                isActive={activeSidebar === '/dashboard/all-products'}
                href='/dashboard/all-products'
              />
            </SidebarMenu>
            <SidebarMenu title='Events'>
              <SidebarItems 
                title='Create Event' 
                icon={<CalendarPlus size={24} color={getIconColor("/dashboard/create-events")}/>}
                isActive={activeSidebar === '/dashboard/create-events'}
                href='/dashboard/create-events'
              />
              <SidebarItems 
                title='All Events' 
                icon={<BellPlus size={24} color={getIconColor("/dashboard/all-events")}/>}
                isActive={activeSidebar === '/dashboard/all-events'}
                href='/dashboard/all-events'
              />
            </SidebarMenu>
            <SidebarMenu title='Controllers'>
              <SidebarItems 
                title='Inbox' 
                icon={<Mail size={20} color={getIconColor("/dashboard/inbox")}/>}
                isActive={activeSidebar === '/dashboard/inbox'}
                href='/dashboard/inbox'
              />
              <SidebarItems 
                title='Settings' 
                icon={<Settings size={22} color={getIconColor("/dashboard/settings")}/>}
                isActive={activeSidebar === '/dashboard/settings'}
                href='/dashboard/settings'
              />
              <SidebarItems 
                title='Notifications' 
                icon={<BellRing size={22} color={getIconColor("/dashboard/notifications")}/>}
                isActive={activeSidebar === '/dashboard/notifications'}
                href='/dashboard/notifications'
              />
            </SidebarMenu>
            <SidebarMenu title='Extras'>
              <SidebarItems 
                title='Discount Codes' 
                icon={<TicketPercent size={22} color={getIconColor("/dashboard/discount-codes")}/>}
                isActive={activeSidebar === '/dashboard/discount-codes'}
                href='/dashboard/discount-codes'
              />
              <SidebarItems 
                title='Logout' 
                icon={<LogOut size={20} color={getIconColor("/dashboard/logout")}/>}
                isActive={activeSidebar === '/dashboard/logout'}
                href='/dashboard/logout'
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
      

    </Box>
  )
}

export default SidebarWrapper