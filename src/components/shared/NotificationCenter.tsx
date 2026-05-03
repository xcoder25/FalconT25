
'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, AlertCircle, Award, Info, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useRealtimeNotifications } from '@/hooks/useRealtime';
import { cn } from '@/lib/utils';
import type { AppNotification } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

const iconMap: Record<AppNotification['type'], React.ReactNode> = {
  recognition: <Award className="h-4 w-4 text-purple-500" />,
  warning:     <Shield className="h-4 w-4 text-red-500" />,
  error:       <AlertCircle className="h-4 w-4 text-destructive" />,
  info:        <Info className="h-4 w-4 text-blue-400" />,
  success:     <Check className="h-4 w-4 text-green-500" />,
};

const bgMap: Record<AppNotification['type'], string> = {
  recognition: 'bg-purple-500/10 border-purple-500/20',
  warning:     'bg-red-500/10 border-red-500/20',
  error:       'bg-destructive/10 border-destructive/20',
  info:        'bg-blue-500/10 border-blue-500/20',
  success:     'bg-green-500/10 border-green-500/20',
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useRealtimeNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Pulse animation for new unread
  const hasUrgent = notifications.some(
    (n) => !n.read && (n.type === 'warning' || n.type === 'error')
  );

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        className="relative h-9 w-9 rounded-full"
        aria-label="Notifications"
        id="notification-bell-btn"
      >
        <Bell className={cn('h-5 w-5', hasUrgent && 'text-red-500')} />
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white',
              hasUrgent ? 'bg-red-500 animate-pulse' : 'bg-primary'
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-96 animate-in slide-in-from-top-2 duration-200">
          <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={markAllRead}
                  >
                    <CheckCheck className="h-3 w-3" />
                    All read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* List */}
            <ScrollArea className="h-[420px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
                  <Bell className="h-8 w-8 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={cn(
                        'w-full text-left px-4 py-3 transition-colors hover:bg-muted/50',
                        !n.read && 'bg-muted/30'
                      )}
                      id={`notif-item-${n.id}`}
                    >
                      <div className={cn('flex gap-3 p-2 rounded-lg border', bgMap[n.type])}>
                        <div className="mt-0.5 shrink-0">{iconMap[n.type]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold leading-tight truncate">
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-primary mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
