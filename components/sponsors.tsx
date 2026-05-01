import Image from 'next/image';
import { cn } from '@/lib/utils';

type Variant = 'light' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const SIZE: Record<Size, { box: string; copia: string; huawei: string; gap: string }> = {
  sm: { box: 'p-2',   copia: 'h-10 w-10', huawei: 'h-6 w-auto', gap: 'gap-3' },
  md: { box: 'p-3',   copia: 'h-14 w-14', huawei: 'h-8 w-auto', gap: 'gap-4' },
  lg: { box: 'p-4',   copia: 'h-20 w-20', huawei: 'h-10 w-auto', gap: 'gap-5' },
};

export default function Sponsors({
  label = 'Promovido por',
  variant = 'light',
  size = 'md',
  className,
}: {
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const isDark = variant === 'dark';
  const s = SIZE[size];

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {label && (
        <p className={cn(
          'text-[11px] font-semibold uppercase tracking-[0.18em]',
          isDark ? 'text-slate-400' : 'text-slate-500',
        )}>
          {label}
        </p>
      )}
      <div className={cn('flex items-center', s.gap)}>
        <LogoCard padding={s.box}>
          <Image
            src="/logos/copia.jpg"
            alt="Copia Group of Companies, SA"
            width={400}
            height={400}
            className={cn(s.copia, 'object-contain')}
            priority
          />
        </LogoCard>
        <LogoCard padding={s.box}>
          <Image
            src="/logos/huawei.svg"
            alt="Huawei"
            width={320}
            height={100}
            className={cn(s.huawei, 'object-contain')}
            priority
          />
        </LogoCard>
      </div>
    </div>
  );
}

function LogoCard({ children, padding }: { children: React.ReactNode; padding: string }) {
  return (
    <div className={cn('flex items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/5', padding)}>
      {children}
    </div>
  );
}
