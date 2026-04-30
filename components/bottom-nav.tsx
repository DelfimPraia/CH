'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Mic, ScanLine, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const items: Item[] = [
  { href: '/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/speakers', label: 'Palestrantes', icon: Mic },
  { href: '/me', label: 'O meu', icon: Ticket },
];

export default function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const all = isAdmin
    ? [...items, { href: '/admin/check-in', label: 'Check-in', icon: ScanLine }]
    : items;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto grid max-w-2xl grid-cols-4">
        {all.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-2 py-3 text-xs',
                active ? 'text-brand-600' : 'text-slate-500 dark:text-slate-400',
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
