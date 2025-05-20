
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppLogo } from '@/components/shared/AppLogo';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Award,
  Gift,
  History, // Keeping History icon for Attendance Logs
  Users,
  Settings,
  Bell,
  Camera as CameraIcon, 
  CreditCard, // Added CreditCard icon for Payroll
  LogOut,
  ChevronDown,
  ChevronUp,
  ScanFace,
} from 'lucide-react';
import type { NavigationItem } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


const navItems: NavigationItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/recognition-feed', label: 'Recognition Feed', icon: Award },
  { href: '/dashboard/nominate', label: 'Nominate Colleague', icon: Gift },
  { href: '/dashboard/recognition-view', label: 'Recognition View', icon: ScanFace },
  { href: '/dashboard/history', label: 'Attendance Logs', icon: History }, // Updated Label
  { href: '/dashboard/manage-staff', label: 'Manage Staff', icon: Users },
  { href: '/dashboard/payroll', label: 'Payroll', icon: CreditCard }, // Added Payroll
  {
    href: '/dashboard/settings', 
    label: 'Settings',
    icon: Settings,
    children: [
      { href: '/dashboard/settings/notifications', label: 'Notifications', icon: Bell },
      { href: '/dashboard/settings/cameras', label: 'Cameras', icon: CameraIcon },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [openSettings, setOpenSettings] = React.useState(isSettingsPathActive(pathname));

  function isSettingsPathActive(currentPath: string) {
    return navItems.find(item => item.label === 'Settings')?.children?.some(child => currentPath.startsWith(child.href)) || false;
  }

  React.useEffect(() => {
    setOpenSettings(isSettingsPathActive(pathname));
  }, [pathname]);

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <AppLogo />
        </SidebarHeader>
        <SidebarContent asChild>
          <ScrollArea className="flex-1">
            <SidebarMenu className="p-2">
              {navItems.map((item) =>
                item.children ? (
                  <Accordion key={item.label} type="single" collapsible defaultValue={openSettings ? "settings-accordion" : undefined}>
                    <AccordionItem value="settings-accordion" className="border-none">
                      <AccordionTrigger 
                        className="w-full p-0 hover:no-underline group/menu-item"
                        onClick={() => setOpenSettings(!openSettings)}
                        asChild
                      >
                        <SidebarMenuButton
                          tooltip={item.label}
                          isActive={isSettingsPathActive(pathname)}
                          className="justify-between w-full"
                          aria-expanded={openSettings}
                        >
                          <div className="flex items-center gap-2">
                            <item.icon />
                            <span>{item.label}</span>
                          </div>
                           {openSettings ? <ChevronUp className="h-4 w-4 text-muted-foreground group-hover/menu-item:text-sidebar-accent-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground group-hover/menu-item:text-sidebar-accent-foreground" />}
                        </SidebarMenuButton>
                      </AccordionTrigger>
                      <AccordionContent className="pb-0 pl-3 pr-1 pt-1">
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.label}>
                              <Link href={child.href} legacyBehavior passHref>
                                <SidebarMenuSubButton
                                  isActive={pathname === child.href}
                                  className="w-full"
                                >
                                  <child.icon className="mr-0" /> 
                                  <span>{child.label}</span>
                                </SidebarMenuSubButton>
                              </Link>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <SidebarMenuItem key={item.label}>
                    <Link href={item.href} legacyBehavior passHref>
                      <SidebarMenuButton
                        tooltip={item.label}
                        isActive={pathname === item.href}
                        className="w-full"
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border">
          <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4 md:hidden">
            <SidebarTrigger />
            <AppLogo className="md:hidden" showIcon={false} textSize="text-xl" />
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
