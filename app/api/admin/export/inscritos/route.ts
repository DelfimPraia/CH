import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const AREA_LABELS: Record<string, string> = {
  geoscience: 'Geociência',
  engineering: 'Engenharia',
  data_science: 'Data Science / IA',
  it: 'TI / Software',
  management: 'Gestão / Negócio',
  other: 'Outro',
};

export async function GET() {
  const supabase = createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Admin check
  const { data: adminRow } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!adminRow) return NextResponse.json({ error: 'Forbidden — admins only' }, { status: 403 });

  // Fetch profiles + check-ins
  const [{ data: profiles, error: pErr }, { data: checkIns }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, company, job_title, area, linkedin_url, created_at')
      .order('created_at', { ascending: true }),
    supabase
      .from('check_ins')
      .select('user_id, checked_in_at'),
  ]);

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  const checkInMap = new Map<string, string>(
    (checkIns ?? []).map((c: { user_id: string; checked_in_at: string }) => [c.user_id, c.checked_in_at]),
  );

  const headers = [
    'Nº',
    'Nome completo',
    'Email',
    'Empresa',
    'Função',
    'Área',
    'LinkedIn',
    'Data de inscrição',
    'Hora de inscrição',
    'Check-in feito?',
    'Hora de check-in',
  ];

  const rows = (profiles ?? []).map((p, i) => {
    const checkIn = checkInMap.get(p.id);
    const created = new Date(p.created_at);
    return [
      String(i + 1),
      p.full_name ?? '',
      p.email ?? '',
      p.company ?? '',
      p.job_title ?? '',
      p.area ? (AREA_LABELS[p.area] ?? p.area) : '',
      p.linkedin_url ?? '',
      created.toLocaleDateString('pt-PT'),
      created.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      checkIn ? 'Sim' : 'Não',
      checkIn ? new Date(checkIn).toLocaleString('pt-PT') : '',
    ];
  });

  const csv = [headers, ...rows].map((row) => row.map(escapeCSV).join(';')).join('\r\n');

  // BOM so Excel detects UTF-8 correctly (preserves accents).
  // ';' separator works better than ',' for European locales (avoids comma/decimal collisions).
  const body = '﻿' + csv;

  const today = new Date().toISOString().slice(0, 10);
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="inscritos-ai-oilgas-${today}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}

function escapeCSV(value: string): string {
  if (value.includes(';') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
