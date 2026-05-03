-- =====================================================================
-- Programa real do evento — 16 de Maio de 2026 (sábado)
-- Local: Huawei Angola office park
-- Substitui qualquer seed/sample anterior. Idempotente — pode ser corrido
-- mais que uma vez sem efeitos secundários.
-- =====================================================================

-- ---------- 1. Cleanup de seed antigo (se existir) ----------
delete from public.session_speakers
  where session_id in (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6'
  );

delete from public.sessions where id in (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6'
);

delete from public.speakers where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

-- ---------- 2. Palestrante: Edmilson Delfim Praia ----------
insert into public.speakers (id, full_name, bio, institution, specialty)
values (
  '00000001-0000-4000-8000-000000000001',
  'Edmilson Delfim Praia',
  'Especialista em geologia aplicada ao petróleo e gás com doutorado em Geofísica aplicada, combinando sólida formação acadêmica com experiência prática em análise de dados e educação técnica. Fundador da Justificações Acadêmicas e analista de dados na WellDesk, com expertise comprovada em modelagem geológica e de reservatórios, interpretação de perfis de poço e processamento de dados geofísicos.',
  'WellDesk · Justificações Acadêmicas',
  'IA aplicada a reservatórios, geofísica e modelagem geológica'
)
on conflict (id) do update set
  full_name  = excluded.full_name,
  bio        = excluded.bio,
  institution = excluded.institution,
  specialty  = excluded.specialty;

-- ---------- 3. Programa do dia (timestamps em hora local Angola, UTC+1) ----------
insert into public.sessions (id, title, description, type, starts_at, ends_at, location)
values
  -- 09:00–09:30  Recepção (antes de tudo)
  ('00000002-0000-4000-8000-000000000001',
   'Recepção e credenciamento',
   'Acolhimento dos participantes, entrega de credenciais e networking inicial. Aproveita para conhecer outros participantes antes da abertura.',
   'networking',
   '2026-05-16 09:00:00+01', '2026-05-16 09:30:00+01',
   'Foyer · Huawei Angola office park'),

  -- 09:30–10:30  Edmilson — primeiro palestrante
  ('00000002-0000-4000-8000-000000000002',
   'AI aplicada a reservatórios, produção e geociência',
   'Visão estratégica e técnica sobre como a Inteligência Artificial está a transformar a caracterização de reservatórios, otimização de produção e interpretação geocientífica. Casos práticos de modelagem geológica, análise de perfis de poço e processamento de dados geofísicos com técnicas de IA.',
   'talk',
   '2026-05-16 09:30:00+01', '2026-05-16 10:30:00+01',
   'Auditório · Huawei Angola office park'),

  -- 10:30–11:00  Coffee break (o único)
  ('00000002-0000-4000-8000-000000000003',
   'Coffee break & networking',
   'Pausa para café e conversas informais entre participantes.',
   'break',
   '2026-05-16 10:30:00+01', '2026-05-16 11:00:00+01',
   'Foyer · Huawei Angola office park'),

  -- 11:00–12:30  Painel técnico
  ('00000002-0000-4000-8000-000000000004',
   'Painel técnico — IA na geociência',
   'Painel com convidados a definir. Discussão aberta sobre aplicações práticas de IA em exploração, produção e modelagem geológica.',
   'panel',
   '2026-05-16 11:00:00+01', '2026-05-16 12:30:00+01',
   'Auditório · Huawei Angola office park'),

  -- 12:30–14:00  Almoço (networking dirigido, não é coffee break)
  ('00000002-0000-4000-8000-000000000005',
   'Almoço & networking dirigido',
   'Mesas temáticas por área (Geociência, Engenharia, Data Science / IA). Oportunidade para conexões orientadas por interesse.',
   'networking',
   '2026-05-16 12:30:00+01', '2026-05-16 14:00:00+01',
   'Restaurante · Huawei Angola office park'),

  -- 14:00–15:30  Sessão técnica da tarde
  ('00000002-0000-4000-8000-000000000006',
   'Sessão técnica da tarde',
   'Palestra/painel a confirmar. Tópicos avançados de IA aplicada ao setor de Oil & Gas.',
   'talk',
   '2026-05-16 14:00:00+01', '2026-05-16 15:30:00+01',
   'Auditório · Huawei Angola office park'),

  -- 15:30–16:00  Encerramento
  ('00000002-0000-4000-8000-000000000007',
   'Encerramento e próximos passos',
   'Conclusões do evento, agradecimentos a parceiros e participantes, e roadmap para colaborações e próximas edições.',
   'keynote',
   '2026-05-16 15:30:00+01', '2026-05-16 16:00:00+01',
   'Auditório · Huawei Angola office park')
on conflict (id) do update set
  title       = excluded.title,
  description = excluded.description,
  type        = excluded.type,
  starts_at   = excluded.starts_at,
  ends_at     = excluded.ends_at,
  location    = excluded.location;

-- ---------- 4. Ligar Edmilson à sua palestra ----------
insert into public.session_speakers (session_id, speaker_id, role)
values (
  '00000002-0000-4000-8000-000000000002',  -- a palestra do Edmilson
  '00000001-0000-4000-8000-000000000001',  -- Edmilson
  'speaker'
)
on conflict (session_id, speaker_id) do nothing;
