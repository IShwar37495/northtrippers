import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Calendar, Car, LayoutGrid, MapPin, Plus } from 'lucide-react';
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
];

const footerNavItems: NavItem[] = [
    {
        title: 'Nothing',
        href: 'https:://www.google.com',
        icon: Plus,
    },
];

export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
