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
2. Em **SQL Editor**, cola e corre [`supabase/migrations/20260430000000_initial_schema.sql`](./supabase/migrations/20260430000000_initial_schema.sql)
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

## Estrutura

```
app/
  page.tsx                landing pública
  login/, register/       auth
  auth/callback/          confirmação de email
  logout/
  (app)/
    layout.tsx            shell com bottom nav (auth-guarded)
    agenda/               lista + detalhe + favoritos
    speakers/             lista + detalhe
    me/                   bilhete com QR + perfil
    notifications/        feed em tempo real
  admin/
    layout.tsx            (admin-guarded)
    check-in/             scanner QR + entrada manual
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

## Roadmap pós-MVP

- Push notifications (Web Push API + serviço externo, ex. OneSignal)
- Q&A ao vivo durante palestras (tabela `questions` + voting + realtime)
- Networking dirigido (matching por `area`)
- Biblioteca de conteúdo (Supabase Storage + tabela `materials`)
- Certificado pós-evento (server action que gera PDF a partir de `check_ins`)
- Dashboard admin (estatísticas de presenças, sessões mais favoritadas)
