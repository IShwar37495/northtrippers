import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Calendar, Car, LayoutGrid, MapPin, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Create Package',
        href: '/packages/create',
        icon: Plus,
    },
    {
        title: 'Create Event',
        href: '/events/create',
        icon: Plus,
    },
    { title: 'Vehicles', href: '/vehicles', icon: Car },
    { title: 'Pickup Locations', href: '/pickup-locations', icon: MapPin },
    { title: 'Packages', href: '/packages', icon: MapPin },
    { title: 'Events', href: '/events', icon: Calendar },
    // Add Event Bookings tab for admin
    { title: 'Event Bookings', href: '/admin-event-bookings', icon: Calendar },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Nothing',
        href: 'https:://www.google.com',
        icon: Plus,
    },
];

export function AppSidebar() {
    const [eventBookingCount, setEventBookingCount] = useState(0);

    useEffect(() => {
        console.log('[Sidebar Debug] Setting up Echo subscription');
        console.log('[Sidebar Debug] Echo available:', !!window.Echo);
        console.log('[Sidebar Debug] Laravel user:', window.Laravel?.user);

        // Only subscribe for admin/superadmin
        if (
            window.Echo &&
            window.Laravel &&
            window.Laravel.user &&
            window.Laravel.user.role &&
            (window.Laravel.user.role.name === 'admin' || window.Laravel.user.role.name === 'superadmin')
        ) {
            // Listen for shared event booking events
            window.Echo.private('admin-event-bookings').listen('EventBookingCreated', (event: any) => {
                console.log('[Echo] EventBookingCreated received:', event);
                setEventBookingCount((prev) => {
                    const newCount = prev + 1;
                    console.log('[Echo] Event booking badge count updated:', newCount);
                    return newCount;
                });
            });

            // Optionally, keep the per-user notification for other features
        } else {
            console.log('[Sidebar Debug] Cannot subscribe - missing requirements:', {
                hasEcho: !!window.Echo,
                hasLaravel: !!window.Laravel,
                hasUser: !!window.Laravel?.user,
                hasRole: !!window.Laravel?.user?.role,
                roleName: window.Laravel?.user?.role?.name,
                isAdmin: window.Laravel?.user?.role?.name === 'admin' || window.Laravel?.user?.role?.name === 'superadmin',
            });
        }
        // Optionally cleanup
        return () => {
            if (
                window.Echo &&
                window.Laravel &&
                window.Laravel.user &&
                window.Laravel.user.role &&
                (window.Laravel.user.role.name === 'admin' || window.Laravel.user.role.name === 'superadmin')
            ) {
                window.Echo.private('admin-event-bookings').stopListening('EventBookingCreated');
            }
        };
    }, []);

    // Reset badge count when visiting the Event Bookings page
    useEffect(() => {
        if (window.location.pathname === '/admin-event-bookings') {
            setEventBookingCount(0);
        }
    }, [window.location.pathname]);

    // Clone and inject badgeCount into the Event Bookings nav item
    const navItemsWithBadge = mainNavItems.map((item) => (item.title === 'Event Bookings' ? { ...item, badgeCount: eventBookingCount } : item));

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItemsWithBadge} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
