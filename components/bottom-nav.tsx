'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Radio, Ticket, Users, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const items: Item[] = [
  { href: '/now',      label: 'Agora',    icon: Radio },
  { href: '/agenda',   label: 'Agenda',   icon: CalendarDays },
  { href: '/people',   label: 'Pessoas',  icon: Users },
  { href: '/me',       label: 'O meu',    icon: Ticket },
];

export default function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const all = isAdmin ? [...items, { href: '/admin', label: 'Admin', icon: Wrench }] : items;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0b1220]/95 backdrop-blur">
      <div className={cn('mx-auto grid max-w-2xl', isAdmin ? 'grid-cols-5' : 'grid-cols-4')}>
        {all.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-2 py-3 text-xs',
                active ? 'text-orange-500' : 'text-slate-400 hover:text-slate-200',
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
