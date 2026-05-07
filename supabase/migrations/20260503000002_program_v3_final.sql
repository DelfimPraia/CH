-- =====================================================================
-- Programa final v3 — 20 de Maio de 2026 (quarta-feira), 08:00–14:00
-- Tema: "Aplicação da Inteligência Artificial na Indústria de Petróleo e Gás"
-- Local: Huawei Angola office park
-- 6 sessões: 1 keynote (Dr. Edmilson) + 1 painel institucional & técnico.
-- Idempotente — pode ser corrido mais que uma vez.
-- =====================================================================

-- 1. Atualizar bio do Dr. Edmilson Delfim Praia
update public.speakers
   set full_name  = 'Dr. Edmilson Delfim Praia',
       bio        = 'Especialista em Inteligência Artificial aplicada à Engenharia de Reservatórios. Doutorando em Geofísica. Fundador da Justificações Acadêmicas e analista de dados na WellDesk, com experiência em modelagem geológica e de reservatórios, interpretação de perfis de poço e processamento de dados geofísicos.',
       institution = 'WellDesk · Justificações Acadêmicas',
       specialty  = 'IA aplicada à Engenharia de Reservatórios'
 where id = '00000001-0000-4000-8000-000000000001';

-- Garantir que o speaker existe (caso a migration anterior não tenha sido corrida)
insert into public.speakers (id, full_name, bio, institution, specialty)
values (
  '00000001-0000-4000-8000-000000000001',
  'Dr. Edmilson Delfim Praia',
  'Especialista em Inteligência Artificial aplicada à Engenharia de Reservatórios. Doutorando em Geofísica. Fundador da Justificações Acadêmicas e analista de dados na WellDesk, com experiência em modelagem geológica e de reservatórios, interpretação de perfis de poço e processamento de dados geofísicos.',
  'WellDesk · Justificações Acadêmicas',
  'IA aplicada à Engenharia de Reservatórios'
)
on conflict (id) do nothing;

-- 2. Limpar programa anterior (cascade limpa session_speakers + questions)
delete from public.sessions;

-- 3. Inserir programa final (hora local Angola UTC+1)
insert into public.sessions (id, title, description, type, track, starts_at, ends_at, location)
values
  -- 08:00–08:30  Recepção
  ('00000004-0000-4000-8000-000000000001',
   'Recepção & Credenciamento',
   'Acolhimento dos participantes, entrega de credenciais e networking inicial.',
   'networking', null,
   '2026-05-20 08:00:00+01', '2026-05-20 08:30:00+01',
   'Foyer · Huawei Angola office park'),

  -- 08:30–10:00  Palestra principal (única do dia)
  ('00000004-0000-4000-8000-000000000002',
   'Palestra Principal — Aplicação da IA na Indústria de Petróleo e Gás',
   E'Palestra principal do AI Oil & Gas Conference 2026, ministrada pelo Dr. Edmilson Delfim Praia (especialista em IA aplicada à Engenharia de Reservatórios; Doutorando em Geofísica).\n\nTópicos abordados:\n• Estado da arte: IA em reservatórios, produção e geociência\n• Casos práticos: modelagem geológica, interpretação de perfis de poço, processamento de dados geofísicos\n• Visão estratégica para a transformação digital da indústria energética em Angola',
   'keynote', null,
   '2026-05-20 08:30:00+01', '2026-05-20 10:00:00+01',
   'Auditório · Huawei Angola office park'),

  -- 10:00–10:30  Coffee break
  ('00000004-0000-4000-8000-000000000003',
   'Coffee Break & Networking',
   'Pausa para café e conversas informais entre participantes, palestrantes e convidados institucionais.',
   'break', null,
   '2026-05-20 10:00:00+01', '2026-05-20 10:30:00+01',
   'Foyer · Huawei Angola office park'),

  -- 10:30–12:30  Painel institucional & técnico
  ('00000004-0000-4000-8000-000000000004',
   'Painel Institucional & Técnico',
   E'Painel de discussão com representantes das principais entidades académicas, governamentais e empresariais convidadas.\n\nFoco da discussão:\n• Transformação digital e inteligência artificial no setor energético angolano\n• Inovação tecnológica e o papel da academia\n• Cooperação entre Estado, universidades, setor petrolífero e telecomunicações\n• Caminhos para o futuro da indústria energética em Angola\n\nEntidades convidadas: Ministério do Ensino Superior, Ciência, Tecnologia e Inovação · Universidade Internacional do Cuanza · Universidade Agostinho Neto · Universidade Católica de Angola · Universidade de Belas · ANPG · Sonangol · Setor de Telecomunicações.',
   'panel', null,
   '2026-05-20 10:30:00+01', '2026-05-20 12:30:00+01',
   'Auditório · Huawei Angola office park'),

  -- 12:30–13:45  Almoço & networking final
  ('00000004-0000-4000-8000-000000000005',
   'Almoço & Networking Final',
   'Almoço oferecido aos participantes. Mesas temáticas por área de interesse com palestrante, painelistas e convidados institucionais.',
   'networking', null,
   '2026-05-20 12:30:00+01', '2026-05-20 13:45:00+01',
   'Restaurante · Huawei Angola office park'),

  -- 13:45–14:00  Encerramento
  ('00000004-0000-4000-8000-000000000006',
   'Encerramento',
   'Sessão de encerramento, agradecimentos a parceiros, palestrantes e participantes. Roadmap para colaborações futuras.',
   'keynote', null,
   '2026-05-20 13:45:00+01', '2026-05-20 14:00:00+01',
   'Auditório · Huawei Angola office park');

-- 4. Ligar Dr. Edmilson à Palestra Principal
insert into public.session_speakers (session_id, speaker_id, role)
values (
  '00000004-0000-4000-8000-000000000002',  -- Palestra Principal
  '00000001-0000-4000-8000-000000000001'   -- Dr. Edmilson Delfim Praia
, 'speaker'
)
on conflict (session_id, speaker_id) do nothing;
