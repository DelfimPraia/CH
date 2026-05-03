-- =====================================================================
-- Programa v2 — agenda completa por tracks (Upstream / Midstream / Downstream)
-- 16 de Maio 2026, Huawei Angola office park
-- 17 sessões: recepção, abertura, coffee, 3 tracks com 3 talks + painel cada,
-- almoço, encerramento.
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

-- 3. Inserir programa v2 (17 sessões em hora local Angola UTC+1)
insert into public.sessions (id, title, description, type, track, starts_at, ends_at, location)
values
  -- ===== Abertura =====
  ('00000003-0000-4000-8000-000000000001',
   'Recepção & Credenciamento',
   'Acolhimento, entrega de credenciais e networking inicial.',
   'networking', null,
   '2026-05-16 08:00:00+01', '2026-05-16 08:30:00+01',
   'Foyer · Huawei Angola office park'),

  ('00000003-0000-4000-8000-000000000002',
   'Palestra de Abertura',
   'Sessão de abertura do AI Oil & Gas Conference 2026. Visão estratégica sobre Inteligência Artificial aplicada a reservatórios, produção e geociência.',
   'keynote', null,
   '2026-05-16 08:30:00+01', '2026-05-16 09:15:00+01',
   'Auditório · Huawei Angola office park'),

  ('00000003-0000-4000-8000-000000000003',
   'Coffee Break & Networking',
   'Pausa para café e conversas informais entre participantes.',
   'break', null,
   '2026-05-16 09:15:00+01', '2026-05-16 09:45:00+01',
   'Foyer · Huawei Angola office park'),

  -- ===== Sessão 1: UPSTREAM =====
  ('00000003-0000-4000-8000-000000000004',
   'IA na interpretação sísmica',
   'Modelos de deep learning aplicados à interpretação de dados sísmicos: reconhecimento de horizontes, deteção de falhas e melhoria de imagens.',
   'talk', 'upstream',
   '2026-05-16 09:45:00+01', '2026-05-16 10:05:00+01',
   'Auditório · Huawei Angola office park'),

  ('00000003-0000-4000-8000-000000000005',
   'ML na previsão petrofísica',
   'Machine Learning aplicado a logs de poço para inferência de propriedades petrofísicas (porosidade, permeabilidade, saturação).',
   'talk', 'upstream',
   '2026-05-16 10:05:00+01', '2026-05-16 10:25:00+01',
   'Auditório · Huawei Angola office park'),

  ('00000003-0000-4000-8000-000000000006',
   'Otimização de produção',
   'Algoritmos de otimização e modelos preditivos para maximização de produção em reservatórios.',
   'talk', 'upstream',
   '2026-05-16 10:25:00+01', '2026-05-16 10:45:00+01',
   'Auditório · Huawei Angola office park'),

  ('00000003-0000-4000-8000-000000000007',
   'Painel UPSTREAM — Discussão & Q&A',
   'Debate aberto entre os palestrantes do bloco UPSTREAM, moderado por especialista convidado. Perguntas da audiência.',
   'panel', 'upstream',
   '2026-05-16 10:45:00+01', '2026-05-16 11:30:00+01',
   'Auditório · Huawei Angola office park'),

  -- ===== Almoço =====
  ('00000003-0000-4000-8000-000000000008',
   'Almoço & Networking Dirigido',
   'Mesas temáticas por área de interesse. Oportunidade para conexões orientadas e conversas informais entre participantes, palestrantes e moderadores.',
   'networking', null,
   '2026-05-16 11:30:00+01', '2026-05-16 12:30:00+01',
   'Restaurante · Huawei Angola office park'),

  -- ===== Sessão 2: MIDSTREAM =====
  ('00000003-0000-4000-8000-000000000009',
   'IA para deteção de falhas',
   'Modelos de visão computacional e séries temporais para deteção precoce de falhas em pipelines e infraestrutura midstream.',
   'talk', 'midstream',
   '2026-05-16 12:30:00+01', '2026-05-16 12:50:00+01',
   'Auditório · Huawei Angola office park'),

  ('00000003-0000-4000-8000-00000000000a',
   'IoT + monitoramento em tempo real',
   'Arquiteturas IoT industriais e plataformas de telemetria para monitoramento contínuo de operações de transporte e armazenamento.',
   'talk', 'midstream',
   '2026-05-16 12:50:00+01', '2026-05-16 13:10:00+01',
   'Auditório · Huawei Angola office park'),

  ('00000003-0000-4000-8000-00000000000b',
   'Otimização logística',
   'IA aplicada a logística de transporte: planeamento de rotas, scheduling de tankers, otimização de armazenagem.',
   'talk', 'midstream',
   '2026-05-16 13:10:00+01', '2026-05-16 13:30:00+01',
   'Auditório · Huawei Angola office park'),

  ('00000003-0000-4000-8000-00000000000c',
   'Painel MIDSTREAM — Discussão & Q&A',
   'Debate aberto entre os palestrantes do bloco MIDSTREAM, moderado por especialista em pipelines e operações.',
   'panel', 'midstream',
   '2026-05-16 13:30:00+01', '2026-05-16 14:15:00+01',
   'Auditório · Huawei Angola office park'),

  -- ===== Sessão 3: DOWNSTREAM =====
  ('00000003-0000-4000-8000-00000000000d',
   'IA no refino',
   'Aplicações de IA na otimização de processos de refino e qualidade de produtos finais.',
   'talk', 'downstream',
   '2026-05-16 14:15:00+01', '2026-05-16 14:35:00+01',
   'Auditório · Huawei Angola office park'),

  ('00000003-0000-4000-8000-00000000000e',
   'Manutenção preditiva',
   'Modelos preditivos para antecipação de falhas em equipamentos industriais. Redução de downtime e custos.',
   'talk', 'downstream',
   '2026-05-16 14:35:00+01', '2026-05-16 14:55:00+01',
   'Auditório · Huawei Angola office park'),

  ('00000003-0000-4000-8000-00000000000f',
   'Previsão de demanda',
   'Time-series forecasting e modelos económicos para previsão de demanda de combustíveis e produtos refinados.',
   'talk', 'downstream',
   '2026-05-16 14:55:00+01', '2026-05-16 15:15:00+01',
   'Auditório · Huawei Angola office park'),

  ('00000003-0000-4000-8000-000000000010',
   'Painel DOWNSTREAM — Discussão & Q&A',
   'Debate aberto entre os palestrantes do bloco DOWNSTREAM, moderado por especialista em refino.',
   'panel', 'downstream',
   '2026-05-16 15:15:00+01', '2026-05-16 16:00:00+01',
   'Auditório · Huawei Angola office park'),

  -- ===== Encerramento =====
  ('00000003-0000-4000-8000-000000000011',
   'Encerramento + Networking Final',
   'Conclusões do evento, agradecimentos a parceiros e participantes, roadmap para colaborações futuras. Networking final aberto.',
   'keynote', null,
   '2026-05-16 16:00:00+01', '2026-05-16 16:30:00+01',
   'Auditório · Huawei Angola office park');

-- 4. Ligar Edmilson à Palestra de Abertura
insert into public.session_speakers (session_id, speaker_id, role)
values (
  '00000003-0000-4000-8000-000000000002',  -- Palestra de Abertura
  '00000001-0000-4000-8000-000000000001',  -- Edmilson Delfim Praia
  'speaker'
)
on conflict (session_id, speaker_id) do nothing;
