
'use client';

import React from 'react';
// Link component is no longer directly used for navigation items that need the loading overlay
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
  History, 
  Users,
  Settings,
  Bell,
  Camera as CameraIcon, 
  CreditCard, 
  LogOut,
  ChevronDown,
  ChevronUp,
  ScanFace,
  Cloud, 
  Link2, 
  KeyRound,
  ShieldAlert,
  ClipboardList,
  LayoutGrid,
  Shield,
} from 'lucide-react';
import type { NavigationItem } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { LoadingProvider, useLoading } from '@/contexts/LoadingContext'; 
import { LoadingOverlay } from '@/components/shared/LoadingOverlay'; 
import { SheetTitle } from '@/components/ui/sheet'; 

const navItems: NavigationItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/recognition-feed', label: 'Recognition Feed', icon: Award },
  { href: '/dashboard/nominate', label: 'Nominate Colleague', icon: Gift },
  { href: '/dashboard/recognition-view', label: 'Recognition View', icon: ScanFace },
  { href: '/dashboard/multi-camera-feed', label: 'Multi-Camera Feed', icon: LayoutGrid },
  { href: '/dashboard/history', label: 'Attendance Logs', icon: History },
  { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: ClipboardList },
  { href: '/dashboard/manage-staff', label: 'Manage Staff', icon: Users },
  { href: '/dashboard/payroll', label: 'Payroll', icon: CreditCard },
  {
    href: '/dashboard/settings', 
    label: 'Settings',
    icon: Settings,
    children: [
      { href: '/dashboard/settings/notifications', label: 'Notifications', icon: Bell },
      { href: '/dashboard/settings/cameras', label: 'Cameras', icon: CameraIcon },
      { href: '/dashboard/settings/storage', label: 'Cloud Storage', icon: Cloud },
      { href: '/dashboard/settings/integrations', label: 'Integrations', icon: Link2 },
      { href: '/dashboard/settings/security', label: 'Security', icon: Shield },
      { href: '/dashboard/settings/roles', label: 'Roles & Permissions', icon: KeyRound },
      { href: '/dashboard/settings/privacy', label: 'Privacy & Compliance', icon: ShieldAlert },
    ],
  },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [openSettings, setOpenSettings] = React.useState(isSettingsPathActive(pathname));
  const { setIsLoading } = useLoading();

  function isSettingsPathActive(currentPath: string) {
    return navItems.find(item => item.label === 'Settings')?.children?.some(child => currentPath.startsWith(child.href)) || false;
  }

  React.useEffect(() => {
    setOpenSettings(isSettingsPathActive(pathname));
  }, [pathname]);

  const handleNavigation = (href: string) => {
    if (pathname === href) return; // Don't trigger for same page

    setIsLoading(true);
    router.push(href);
    // setIsLoading(false) will be handled by the useEffect below, listening to pathname changes.
  };

  React.useEffect(() => {
    // When the pathname changes (i.e., navigation is complete and new page is rendering),
    // set isLoading to false.
    setIsLoading(false);
  }, [pathname, setIsLoading]);


  const handleLogout = () => {
    // Logout doesn't use the loading overlay, direct push
    router.push('/login');
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <SheetTitle asChild>
            <AppLogo />
          </SheetTitle>
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
                              <SidebarMenuSubButton
                                onClick={() => handleNavigation(child.href)}
                                isActive={pathname === child.href}
                                className="w-full"
                              >
                                <child.icon className="mr-0" /> 
                                <span>{child.label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.href)}
                      tooltip={item.label}
                      isActive={pathname === item.href}
                      className="w-full"
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
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
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
          </div>
          <div>
            <AppLogo showIcon={true} iconSize={28} textSize="text-xl" />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
            {children}
        </main>
      </SidebarInset>
      <LoadingOverlay /> {/* Render LoadingOverlay here */}
    </SidebarProvider>
  );
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LoadingProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </LoadingProvider>
  )
}
