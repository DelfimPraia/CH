import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // PDF generation may take a few seconds

const AREA_LABELS: Record<string, string> = {
  geoscience: 'Geociência',
  engineering: 'Engenharia',
  data_science: 'Data Science / IA',
  it: 'TI / Software',
  management: 'Gestão / Negócio',
  other: 'Outro',
};

type Profile = {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  job_title: string | null;
  area: string | null;
  linkedin_url: string | null;
  created_at: string;
};

type CheckIn = { user_id: string; checked_in_at: string };

export async function GET(request: NextRequest) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: adminRow } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!adminRow) return NextResponse.json({ error: 'Forbidden — admins only' }, { status: 403 });

  const [{ data: profiles, error: pErr }, { data: checkIns }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, company, job_title, area, linkedin_url, created_at')
      .order('created_at', { ascending: true }),
    supabase.from('check_ins').select('user_id, checked_in_at'),
  ]);

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  const format = request.nextUrl.searchParams.get('format') ?? 'pdf';
  const today = new Date().toISOString().slice(0, 10);

  if (format === 'pdf') {
    return generatePDF((profiles ?? []) as Profile[], (checkIns ?? []) as CheckIn[], today);
  }
  return generateCSV((profiles ?? []) as Profile[], (checkIns ?? []) as CheckIn[], today);
}

// =====================================================================
// PDF
// =====================================================================
async function generatePDF(profiles: Profile[], checkIns: CheckIn[], today: string) {
  // Dynamic import — keeps the heavy PDF lib out of routes that don't need it.
  const [{ renderToBuffer }, { InscritosReport }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/lib/pdf/inscritos-report'),
  ]);

  const buffer = await renderToBuffer(
    InscritosReport({ profiles, checkIns, generatedAt: new Date() }),
  );

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="inscritos-ai-oilgas-${today}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}

// =====================================================================
// CSV (fallback)
// =====================================================================
function generateCSV(profiles: Profile[], checkIns: CheckIn[], today: string) {
  const checkInMap = new Map<string, string>(checkIns.map((c) => [c.user_id, c.checked_in_at]));

  const headers = [
    'Nº', 'Nome completo', 'Email', 'Empresa', 'Função', 'Área',
    'LinkedIn', 'Data de inscrição', 'Hora de inscrição',
    'Check-in feito?', 'Hora de check-in',
  ];

  const rows = profiles.map((p, i) => {
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
  const body = '﻿' + csv;

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
