'use client';

import React, { useEffect, useState } from 'react'; 
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
  useSidebar,
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
  Building2,
  Crown,
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
import { Skeleton } from '@/components/ui/skeleton'; 
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { NotificationCenter } from '@/components/shared/NotificationCenter';
import { Badge } from '@/components/ui/badge';

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
      { href: '/dashboard/settings/company-profile', label: 'Company Profile', icon: Building2 },
      { href: '/dashboard/settings/notifications', label: 'Notifications', icon: Bell },
      { href: '/dashboard/settings/cameras', label: 'Cameras', icon: CameraIcon },
      { href: '/dashboard/settings/security', label: 'Security', icon: Shield },
      { href: '/dashboard/settings/storage', label: 'Cloud Storage', icon: Cloud },
      { href: '/dashboard/settings/integrations', label: 'Integrations', icon: Link2 },
      { href: '/dashboard/settings/roles', label: 'Roles & Permissions', icon: KeyRound },
      { href: '/dashboard/settings/privacy', label: 'Privacy & Compliance', icon: ShieldAlert },
    ],
  },
];

function PlanBanner() {
  const { planLabel, isTrialing, daysLeft } = useSubscription();

  return (
    <div className="mx-2 mb-2 p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
      <div className="flex items-center gap-2 mb-1">
        <Crown className="h-4 w-4 text-violet-500" />
        <span className="text-xs font-semibold text-violet-500 uppercase tracking-wider">{planLabel}</span>
      </div>
      {isTrialing && daysLeft !== null && (
        <div className="text-[10px] text-muted-foreground">
          Trial ends in <span className="font-medium text-foreground">{daysLeft} days</span>
        </div>
      )}
      <Button variant="link" className="h-auto p-0 text-[10px] text-violet-500 font-medium mt-1">
        Manage Subscription →
      </Button>
    </div>
  );
}

function MyDashboardUI({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [openSettings, setOpenSettings] = React.useState(isSettingsPathActive(pathname));
  const { setIsLoading } = useLoading();
  const { isMobile } = useSidebar();
  const { user, logout } = useAuth();
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Generate an avatar based on company name or user's display name
    const name = user?.companyName || user?.displayName || 'Company';
    const initials = name.substring(0, 2).toUpperCase();
    setCompanyLogoUrl(`https://placehold.co/100x100.png?text=${initials}`);
  }, [user]);

  function isSettingsPathActive(currentPath: string) {
    return navItems.find(item => item.label === 'Settings')?.children?.some(child => currentPath.startsWith(child.href)) || false;
  }

  React.useEffect(() => {
    setOpenSettings(isSettingsPathActive(pathname));
  }, [pathname]);

  const handleNavigation = (href: string) => {
    if (pathname === href) return;
    setIsLoading(true);
    router.push(href);
  };

  React.useEffect(() => {
    setIsLoading(false);
  }, [pathname, setIsLoading]);

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
  };

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          {isMobile ? (
            <SheetTitle> 
              <AppLogo />
            </SheetTitle>
          ) : (
            <AppLogo />
          )}
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
        <SidebarFooter className="border-t border-sidebar-border p-2">
          {!isMobile && <PlanBanner />}
          <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive mt-1" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <div className="hidden md:flex items-center gap-3">
              <Badge variant="outline" className="text-xs font-normal">
                Tenant ID: <span className="font-mono ml-1">{user?.tenantId?.substring(0, 8) || '...'}</span>
              </Badge>
              <Badge variant="secondary" className="text-xs font-normal capitalize">
                Role: {user?.role || '...'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <div className="flex items-center gap-3 pl-4 border-l">
               {companyLogoUrl ? (
                 <AppLogo
                   companyLogoUrl={companyLogoUrl}
                   companyName={user?.companyName || user?.displayName || 'Company'}
                   showIcon={true}
                   iconSize={32}
                   textSize="text-sm"
                 />
               ) : (
                 <Skeleton className="h-8 w-8 rounded-full" />
               )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/20">
            {children}
        </main>
      </SidebarInset>
      <LoadingOverlay />
    </>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <MyDashboardUI>{children}</MyDashboardUI>
    </SidebarProvider>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LoadingProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </LoadingProvider>
  );
}
