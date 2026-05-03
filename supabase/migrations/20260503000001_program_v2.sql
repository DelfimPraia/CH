-- =====================================================================
-- Programa final — 8 sessões: 1 palestra de abertura + 3 painéis por track
-- 16 de Maio 2026, Huawei Angola office park
-- 1 keynote (Edmilson) + 3 grandes painéis (Upstream / Midstream / Downstream)
-- Idempotente — pode ser corrido mais que uma vez sem efeitos.
-- =====================================================================

-- 1. Schema: adicionar enum track_tag e coluna na tabela sessions
do $$ begin
  if not exists (select 1 from pg_type where typname = 'track_tag') then
    create type track_tag as enum ('upstream', 'midstream', 'downstream');
  end if;
end $$;

alter table public.sessions add column if not exists track track_tag;

-- 2. Limpar programa anterior (cascade limpa session_speakers e questions)
delete from public.sessions;

-- 3. Inserir programa final (hora local Angola UTC+1)
insert into public.sessions (id, title, description, type, track, starts_at, ends_at, location)
values
  -- 08:00–08:30  Recepção
  ('00000003-0000-4000-8000-000000000001',
   'Recepção & Credenciamento',
   'Acolhimento dos participantes, entrega de credenciais e networking inicial.',
   'networking', null,
   '2026-05-16 08:00:00+01', '2026-05-16 08:30:00+01',
   'Foyer · Huawei Angola office park'),

  -- 08:30–09:15  Palestra de Abertura (única palestra do dia)
  ('00000003-0000-4000-8000-000000000002',
   'Palestra de Abertura — AI Oil & Gas 2026',
   'Sessão de abertura do AI Oil & Gas Conference 2026. Visão estratégica e técnica sobre Inteligência Artificial aplicada a reservatórios, produção e geociência. Enquadramento dos blocos temáticos do dia (Upstream, Midstream, Downstream).',
   'keynote', null,
   '2026-05-16 08:30:00+01', '2026-05-16 09:15:00+01',
   'Auditório · Huawei Angola office park'),

  -- 09:15–09:45  Coffee Break
  ('00000003-0000-4000-8000-000000000003',
   'Coffee Break & Networking',
   'Pausa para café e conversas informais entre participantes.',
   'break', null,
   '2026-05-16 09:15:00+01', '2026-05-16 09:45:00+01',
   'Foyer · Huawei Angola office park'),

  -- 09:45–11:30  PAINEL UPSTREAM
  ('00000003-0000-4000-8000-000000000004',
   'Painel UPSTREAM — Exploração & Produção',
   E'Painel técnico sobre Inteligência Artificial aplicada à fase de exploração e produção. Tópicos cobertos:\n\n• IA na interpretação sísmica\n• Machine Learning na previsão petrofísica\n• Otimização de produção\n\nDebate moderado, intervenções dos painelistas e perguntas da audiência via app.',
   'panel', 'upstream',
   '2026-05-16 09:45:00+01', '2026-05-16 11:30:00+01',
   'Auditório · Huawei Angola office park'),

  -- 11:30–12:30  Almoço
  ('00000003-0000-4000-8000-000000000005',
   'Almoço & Networking Dirigido',
   'Mesas temáticas por área de interesse (Geociência, Engenharia, Data Science / IA). Oportunidade para conexões orientadas e conversas informais com palestrantes e moderadores.',
   'networking', null,
   '2026-05-16 11:30:00+01', '2026-05-16 12:30:00+01',
   'Restaurante · Huawei Angola office park'),

  -- 12:30–14:15  PAINEL MIDSTREAM
  ('00000003-0000-4000-8000-000000000006',
   'Painel MIDSTREAM — Transporte & Operações',
   E'Painel técnico sobre IA aplicada à infraestrutura de transporte, armazenamento e operações. Tópicos cobertos:\n\n• IA para deteção de falhas em pipelines\n• IoT + monitoramento em tempo real\n• Otimização logística (rotas, tankers, armazenagem)\n\nDebate moderado por especialista em operações midstream.',
   'panel', 'midstream',
   '2026-05-16 12:30:00+01', '2026-05-16 14:15:00+01',
   'Auditório · Huawei Angola office park'),

  -- 14:15–16:00  PAINEL DOWNSTREAM
  ('00000003-0000-4000-8000-000000000007',
   'Painel DOWNSTREAM — Refino & Distribuição',
   E'Painel técnico sobre IA aplicada à fase final da cadeia de valor. Tópicos cobertos:\n\n• IA no refino e qualidade de produtos\n• Manutenção preditiva de equipamentos industriais\n• Previsão de demanda de combustíveis\n\nDebate moderado por especialista em refino.',
   'panel', 'downstream',
   '2026-05-16 14:15:00+01', '2026-05-16 16:00:00+01',
   'Auditório · Huawei Angola office park'),

  -- 16:00–16:30  Encerramento
  ('00000003-0000-4000-8000-000000000008',
   'Encerramento + Networking Final',
   'Conclusões do evento, agradecimentos a parceiros e participantes, roadmap para colaborações futuras. Networking final aberto.',
   'keynote', null,
   '2026-05-16 16:00:00+01', '2026-05-16 16:30:00+01',
   'Auditório · Huawei Angola office park');

-- 4. Ligar Edmilson à Palestra de Abertura (única palestra do dia)
insert into public.session_speakers (session_id, speaker_id, role)
values (
  '00000003-0000-4000-8000-000000000002',  -- Palestra de Abertura
  '00000001-0000-4000-8000-000000000001'   -- Edmilson Delfim Praia
, 'speaker'
)
on conflict (session_id, speaker_id) do nothing;
