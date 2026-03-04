'use client'
import useAdmin from 'apps/admin-ui/src/hooks/useAdmin'
import useSidebar from 'apps/admin-ui/src/hooks/useSidebar'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'
import Box from '../Box'
import { Sidebar } from './sidebar.styles'
import Link from 'next/link'
import Logo from '../../../assets/Logo'
import SidebarItems from './sidebar.items'
import Home from '../../../assets/Home'
import SidebarMenu from './sidebar.menu'
import { BellPlus, BellRing, FileClock, ListOrdered, LogOut, PackageSearch, PencilRuler, Settings, Store, Users } from 'lucide-react'
import Payment from '../../../assets/Payment'

const SidebarWrapper = () => {
    const { activeSidebar, setActiveSidebar } = useSidebar()
    const pathName = usePathname()
    const { admin } = useAdmin()

    useEffect(() => {
        setActiveSidebar(pathName)
    }, [pathName, setActiveSidebar])

    const getIconColor = (route: string) =>
        activeSidebar === route ? "#0085ff" : "#969696"

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
                        <Logo />
                        <Box>
                            <h3 className='text-xl font-medium text-[#ecedee]'>
                                {admin?.name}
                            </h3>
                            <h5 className='font-medium text-xs pl-2 text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]:'>
                                {admin?.email}
                            </h5>
                        </Box>
                    </Link>
                </Box>
            </Sidebar.Header>

            <div className='block my-3 h-full'>
                <Sidebar.Body>
                    <SidebarItems
                        title='Dashboard'
                        icon={<Home fill={getIconColor("/dashboard")} />}
                        isActive={activeSidebar === '/dashboard'}
                        href='/dashboard'
                    />
                    <div className='mt-2 block'>
                        <SidebarMenu title='Main Menu'>
                            <SidebarItems
                                title='Orders'
                                icon={<ListOrdered size={26} color={getIconColor("/dashboard/orders")} />}
                                isActive={activeSidebar === '/dashboard/orders'}
                                href='/dashboard/orders'
                            />
                            <SidebarItems
                                isActive={activeSidebar === '/dashboard/payments'}
                                title='Payments'
                                href='/dashboard/payments'
                                icon={<Payment fill={getIconColor("/dashboard/payments")} />}
                            />
                            <SidebarItems
                                isActive={activeSidebar === '/dashboard/products'}
                                title='Products'
                                href='/dashboard/products'
                                icon={<PackageSearch size={22} color={getIconColor("/dashboard/products")} />}
                            />
                            <SidebarItems
                                isActive={activeSidebar === '/dashboard/events'}
                                title='Events'
                                href='/dashboard/events'
                                icon={<BellPlus size={24} color={getIconColor("/dashboard/events")} />}
                            />
                            <SidebarItems
                                isActive={activeSidebar === '/dashboard/users'}
                                title='Users'
                                href='/dashboard/users'
                                icon={<Users size={24} color={getIconColor("/dashboard/users")} />}
                            />
                            <SidebarItems
                                isActive={activeSidebar === '/dashboard/sellers'}
                                title='Sellers'
                                href='/dashboard/sellers'
                                icon={<Store size={22} color={getIconColor("/dashboard/sellers")} />}
                            />
                        </SidebarMenu>
                        <SidebarMenu title='Controllers'>
                            <SidebarItems
                                isActive={activeSidebar === '/dashboard/loggers'}
                                title='Loggers'
                                href='/dashboard/loggers'
                                icon={<FileClock size={22} color={getIconColor("/dashboard/loggers")} />}
                            />
                            <SidebarItems
                                isActive={activeSidebar === '/dashboard/management'}
                                title='Management'
                                href='/dashboard/management'
                                icon={<Settings size={22} color={getIconColor("/dashboard/management")} />}
                            />
                            <SidebarItems
                                isActive={activeSidebar === '/dashboard/notifications'}
                                title='Notifications'
                                href='/dashboard/notifications'
                                icon={<BellRing size={24} color={getIconColor("/dashboard/notifications")} />}
                            />
                        </SidebarMenu>
                        <SidebarMenu title='Customization'>
                            <SidebarItems
                                isActive={activeSidebar === '/dashboard/customization'}
                                title='All Customization'
                                href='/dashboard/customization'
                                icon={<PencilRuler size={22} color={getIconColor("/dashboard/customization")} />}
                            />
                        </SidebarMenu>
                        <SidebarMenu title='Extras'>
                            <SidebarItems
                                isActive={activeSidebar === '/dashboard/logout'}
                                title='Logout'
                                href='/'
                                icon={<LogOut size={20} color={getIconColor("/logout")} />}
                            />
                        </SidebarMenu>
                    </div>
                </Sidebar.Body>
            </div>
        </Box>
    )
}

export default SidebarWrapper