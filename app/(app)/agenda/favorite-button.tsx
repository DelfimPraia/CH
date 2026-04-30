'use client';

import { useState, useTransition } from 'react';
import { Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export default function FavoriteButton({
  sessionId,
  initialIsFavorite,
}: {
  sessionId: string;
  initialIsFavorite: boolean;
}) {
  const [isFav, setIsFav] = useState(initialIsFavorite);
  const [, startTransition] = useTransition();

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !isFav;
    setIsFav(next); // optimistic
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (next) {
        await supabase.from('user_favorites').upsert({ user_id: user.id, session_id: sessionId });
      } else {
        await supabase.from('user_favorites').delete().match({ user_id: user.id, session_id: sessionId });
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      className="self-start rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      <Star className={cn('h-5 w-5', isFav ? 'fill-amber-400 stroke-amber-500' : 'text-slate-400')} />
    </button>
  );
}
