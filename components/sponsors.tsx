import Image from 'next/image';
import { cn } from '@/lib/utils';

type Variant = 'light' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const SIZE: Record<Size, { copia: string; huawei: string; gap: string; pad: string; inner: string }> = {
  sm: { copia: 'h-9 w-9',   huawei: 'h-5 w-auto', gap: 'gap-3', pad: 'p-2.5', inner: 'p-1.5' },
  md: { copia: 'h-12 w-12', huawei: 'h-7 w-auto', gap: 'gap-4', pad: 'p-3',   inner: 'p-2' },
  lg: { copia: 'h-16 w-16', huawei: 'h-9 w-auto', gap: 'gap-5', pad: 'p-4',   inner: 'p-2.5' },
};

export default function Sponsors({
  label = 'Promovido por',
  variant: _variant = 'dark',
  size = 'md',
  className,
}: {
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const s = SIZE[size];

  return (
    <div className={cn('relative isolate', className)}>
      {/* tech grid + radial glow background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage: [
            'radial-gradient(circle at 50% 30%, rgba(249, 115, 22, 0.10), transparent 65%)',
            'linear-gradient(rgba(249, 115, 22, 0.05) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(249, 115, 22, 0.05) 1px, transparent 1px)',
          ].join(','),
          backgroundSize: '100% 100%, 28px 28px, 28px 28px',
        }}
      />

      {label && (
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-orange-500/50" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-400">
            {label}
          </p>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-orange-500/50" />
        </div>
      )}

      <div className={cn('mt-6 flex items-center justify-center', s.gap)}>
        <LogoChip src="/logos/copia.jpg" alt="Copia Group of Companies, SA" pad={s.pad} inner={s.inner} imgClass={s.copia} />
        <LogoChip src="/logos/huawei.svg" alt="Huawei" pad={s.pad} inner={s.inner} imgClass={s.huawei} />
      </div>
    </div>
  );
}

function LogoChip({
  src,
  alt,
  pad,
  inner,
  imgClass,
}: {
  src: string;
  alt: string;
  pad: string;
  inner: string;
  imgClass: string;
}) {
  return (
    <div
      className={cn(
        'group relative rounded-xl border border-orange-500/20 bg-white/[0.04] backdrop-blur-sm transition-all',
        'hover:border-orange-500/50 hover:bg-white/[0.08] hover:shadow-[0_0_24px_rgba(249,115,22,0.18)]',
        pad,
      )}
    >
      {/* corner accents — tech ticks */}
      <span aria-hidden className="absolute left-0 top-0 h-2 w-2 border-l border-t border-orange-500/60" />
      <span aria-hidden className="absolute right-0 top-0 h-2 w-2 border-r border-t border-orange-500/60" />
      <span aria-hidden className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-orange-500/60" />
      <span aria-hidden className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-orange-500/60" />

      <div className={cn('flex items-center justify-center rounded-md bg-white', inner)}>
        <Image
          src={src}
          alt={alt}
          width={400}
          height={400}
          className={cn(imgClass, 'object-contain')}
          priority
        />
      </div>
    </div>
  );
}
