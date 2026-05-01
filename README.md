# AI Oil & Gas Conference — App

Plataforma oficial do evento (Next.js 14 + Supabase). Inclui inscrição, agenda, palestrantes, QR de bilhete, check-in administrativo e notificações em tempo real.

## Stack

- **Next.js 14** (App Router, Server Actions, RSC)
- **Supabase** — Auth, Postgres, Realtime, RLS
- **Tailwind CSS** + **lucide-react**
- **qrcode.react** + `BarcodeDetector` API (scanner)
- PWA-ready (manifest + ícones)

## Setup (≈ 10 min)

### 1. Criar projeto Supabase

1. https://supabase.com/dashboard → **New project**
2. Em **SQL Editor**, cola e corre **pela ordem**:
   1. [`supabase/migrations/20260430000000_initial_schema.sql`](./supabase/migrations/20260430000000_initial_schema.sql) — schema base + RLS
   2. [`supabase/migrations/20260430000001_qa_and_extras.sql`](./supabase/migrations/20260430000001_qa_and_extras.sql) — Q&A ao vivo + upvotes
3. (Opcional, para dados de exemplo) corre [`supabase/seed.sql`](./supabase/seed.sql)
4. Em **Authentication → Providers**, deixa **Email** ativado. Para o evento podes desligar **Confirm email** (Authentication → Settings → Email Auth) — assim os participantes entram logo após o registo.
5. Em **Authentication → URL Configuration**, adiciona o domínio de produção a *Site URL* e *Redirect URLs* (e `http://localhost:3000` em dev).

### 2. Promover um utilizador a admin

Depois do primeiro registo (ou seed), executa no **SQL Editor**:

```sql
insert into public.admins (user_id)
select id from public.profiles where email = 'TEU-EMAIL@aqui.com';
```

### 3. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preenche:

- `NEXT_PUBLIC_SUPABASE_URL` — Project Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API → anon public key
- `SUPABASE_SERVICE_ROLE_KEY` — só usado em scripts; **nunca** expor ao browser

### 4. Correr localmente

```bash
npm install
npm run dev
# abre http://localhost:3000
```

### 5. Deploy

Vercel → import → adicionar as 2 vars `NEXT_PUBLIC_*`. Build automático. Ativa o domínio no Supabase URL Configuration.

## Funcionalidades

**Para o participante (auth-guarded):**
- 🔴 **Agora** — sessão a decorrer, próxima sessão, contador para o início do evento
- 📅 **Agenda** completa com favoritos otimistas
- 💬 **Q&A ao vivo** em cada sessão — perguntas com upvote em tempo real
- 👥 **Pessoas** — palestrantes + participantes filtráveis por área (networking)
- 🎫 **O meu bilhete** — perfil + QR code para check-in
- 🔔 **Notificações** em tempo real (Supabase Realtime)

**Para admin:**
- 📊 **Hub** com KPIs (inscritos, check-ins, perguntas)
- 📷 **Check-in** via câmara (BarcodeDetector) + entrada manual
- 📢 **Broadcast** de notificações para todos
- 📈 **Estatísticas** — distribuição por área, sessões mais favoritadas, taxa de presença

## Estrutura

```
app/
  page.tsx                landing pública
  login/, register/       auth
  auth/callback/          confirmação de email
  logout/
  (app)/
    layout.tsx            shell com bottom nav (auth-guarded)
    now/                  live dashboard
    agenda/               lista + detalhe + favoritos + Q&A
    speakers/             redirect para /people, + detalhe individual
    people/               diretório (palestrantes + participantes, filtros)
    me/                   bilhete com QR + perfil
    notifications/        feed em tempo real
  admin/
    layout.tsx            (admin-guarded)
    page.tsx              hub com KPIs
    check-in/             scanner QR + entrada manual
    notifications/        broadcast form + histórico
    stats/                analytics
components/               UI partilhada
lib/
  supabase/               clientes browser/server/middleware
  types/database.ts       tipos do schema (regenerar com `npm run types:db`)
  utils.ts
supabase/
  migrations/             schema + RLS
  seed.sql                dados de exemplo
public/
  manifest.json, icons/   PWA
middleware.ts             refresca sessão e protege rotas
```

## Roadmap

- Biblioteca de materiais por sessão (Supabase Storage + tabela `materials`)
- Certificado pós-evento (Server Action a gerar PDF a partir de `check_ins`)
- Push notifications nativas (Web Push API + Service Worker)
- Networking dirigido (matchmaking automático por área)
- Modo apresentador (vista para palestrante ver perguntas com upvotes em destaque)
