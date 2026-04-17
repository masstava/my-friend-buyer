# My Friend Buyer

Gestionale di magazzino e operations per la rete WindTre My Friend Buyer
(16 punti vendita organizzati in 4 società), migrato da Lovable/Supabase
a Replit.

## Stack

- **Frontend** — React 19 + Vite (`artifacts/my-friend-buyer`), Wouter,
  TanStack Query, Tailwind + shadcn/ui, Clerk per l'autenticazione.
- **Backend** — Express + TypeScript (`artifacts/api-server`), Drizzle ORM
  su PostgreSQL gestito Replit, Clerk middleware via proxy `/__clerk`.
- **Contract** — OpenAPI in `lib/api-spec/openapi.yaml`; Orval genera
  hooks React Query (`@workspace/api-client-react`) e Zod (`@workspace/api-zod`).
- **Mockup sandbox** — `artifacts/mockup-sandbox` per esplorazione UI.

## Layout monorepo (pnpm workspaces)

```
artifacts/
  api-server/        Express + Clerk + Drizzle
  my-friend-buyer/   Web app React (UI italiana)
  mockup-sandbox/    Sandbox componenti per Canvas
lib/
  api-spec/          OpenAPI source-of-truth
  api-zod/           Zod schemas generati (read-only)
  api-client-react/  Hooks React Query generati (read-only)
  db/                Drizzle schema condiviso
.github/workflows/   CI (typecheck su push/PR)
```

## Modello dominio (Fase 1)

Anagrafiche già esposte via API CRUD:

- `companies` — 4 società (id, name)
- `stores` — 16 punti vendita (id, name, companyId)
- `warehouses` — magazzini collegati ai negozi (id, name, storeId)
- `suppliers` — fornitori (id, name)
- `product_skus` — articoli (id, code, brand, description, isSerialized)

Tabelle ausiliarie già presenti su DB e in Drizzle schema, non ancora esposte:
`stock_movements`, `product_units`, `user_profiles`, `user_roles`
(enum `app_role`: super_admin, admin_config, warehouse, store_manager,
finance, readonly).

## Convenzioni

- **OpenAPI prima del codice**: ogni nuovo endpoint si aggiunge a
  `lib/api-spec/openapi.yaml`, poi `pnpm --filter @workspace/api-spec run codegen`.
  Le route Express importano i Zod generati (`CreateXBody`, `UpdateXParams`,
  ecc.) e il frontend usa gli hooks generati.
- **Auth**: tutte le rotte sotto `/api` sono protette dal middleware
  `requireAuth` (basato su `getAuth(req)` di `@clerk/express`), tranne
  `/api/healthz`. Il middleware popola `req.userId` con l'id Clerk.
- **User profile**: la prima chiamata `GET /api/me` di un utente Clerk
  inserisce automaticamente la riga in `user_profiles`.
- **DB**: schema applicato via `executeSql` durante la migrazione iniziale.
  Per modifiche future usare Drizzle (`pnpm --filter @workspace/db run push`).
- **Italiano**: tutta la UI utente in italiano; i log, i nomi di funzioni
  e variabili in inglese.
- **No segreti nel codice**: le chiavi Clerk e l'URL del DB sono variabili
  ambiente Replit (`CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`,
  `VITE_CLERK_PUBLISHABLE_KEY`, `DATABASE_URL`).

## Stato per fase

### Fase 1 — Migrazione (in chiusura)
- [x] Schema PostgreSQL e import dati seed (1226 righe da dump Supabase)
- [x] Drizzle schema in `lib/db/src/schema/index.ts`
- [x] Clerk autenticazione (server proxy + middleware + ClerkProvider)
- [x] OpenAPI spec + codegen Orval
- [x] CRUD anagrafiche (companies, stores, warehouses, suppliers, skus)
- [x] Endpoint `/me` e `/dashboard/{summary,recent-activity}`
- [x] Frontend: AppShell, Sidebar, Topbar, 9 pagine (italiano)
- [x] CI GitHub Actions (typecheck a ogni push)
- [x] Object Storage server-side (`/api/storage/uploads/request-url` + serving routes)
- [ ] Collegamento repo `masstava/my-friend-buyer` (azione manuale dell'utente)

### Fase 2+ — Ancora da pianificare
- Porting completo delle 12 edge functions Supabase
- Pagine: Acquisti, Resi, CashFlow, Pipelines, Kanban, Competitions,
  Import, IntegrationSettings (oggi placeholder "in arrivo")
- Integrazione Fatture in Cloud
- Integrazione bancaria (sync transazioni, match pagamenti)
- Logica avanzata Kanban + Competitions

## Comandi utili

```bash
# Codegen contract
pnpm --filter @workspace/api-spec run codegen

# Push schema Drizzle al DB
pnpm --filter @workspace/db run push

# Avvio workflow (gestiti dalla piattaforma)
#   - artifacts/api-server: API Server
#   - artifacts/my-friend-buyer: web
#   - artifacts/mockup-sandbox: Component Preview Server
```

## Deploy

Replit Deployments gestisce build, hosting, TLS e healthchecks. La
configurazione di deploy è nel file `.replit`. Il workflow CI su GitHub
fa solo typecheck — il deploy è manuale tramite la dashboard Replit.
