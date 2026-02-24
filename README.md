# UniWallet (Budgeting App)

UniWallet is a student-focused budgeting app built with Next.js.

It supports:
- Budget setup (weekly, monthly, termly)
- Category allocation and goal editing
- Expense tracking
- Dashboard insights (remaining budget, daily allowance, category progress)
- Save Smart AI-style recommendations
- Track Spend analytics
- Offers feed (live API with fallback)
- Theme modes: dark, light, fancy
- Hybrid persistence: localStorage + Postgres/Neon sync

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Postgres (`pg`) for server-side state sync
- Vitest + Testing Library for tests

## App Pages

- `/` Dashboard
- `/setup` Onboarding
- `/add` Add expense
- `/history` Expense history
- `/goals` Category goals/allocation editor
- `/calculator` Budget calculator + suggested breakdown
- `/save-smart` AI-style suggestions
- `/track-spend` Graphs and spending analytics
- `/marketplace` Offers / student deals
- `/profile` Profile summary
- `/settings` Theme + QR + budget editing/reset

## Project Structure

- `app/` Next.js routes
- `components/` UI components
- `contexts/` global state providers (budget/theme/sidebar)
- `lib/` helpers, types, storage, db access
- `app/api/state/route.ts` state sync endpoint
- `app/api/offers/route.ts` offers endpoint
- `db/schema.sql` Postgres schema (Neon-ready)
- `public/` static assets (logo, partner logos)

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

Create `.env` (or `.env.local`) with:

```bash
POSTGRES_URL=postgres://...
OFFERS_API_URL=https://your-live-endpoint
```

Notes:
- `POSTGRES_URL` enables DB sync (`/api/state`).
- If DB is unavailable, the app falls back to localStorage-only mode.
- `OFFERS_API_URL` is optional. If omitted or invalid, default offers are used.

### 3. Run development server

```bash
bun run dev
```

Open `http://localhost:3000`.

### 4. Build for production

```bash
bun run build
bun run start
```

## Scripts

- `bun run dev` start local dev server
- `bun run build` production build
- `bun run start` run production server
- `bun run lint` lint code
- `bun run test` run tests once
- `bun run test:watch` watch mode
- `bun run test:coverage` coverage run
- `bun run test:e2e` run Playwright E2E tests
- `bun run test:e2e:ui` run Playwright UI mode

## Data Persistence Model

UniWallet uses a hybrid model:

1. Local first:
- State is loaded from `localStorage` immediately for fast UX.

2. Optional DB sync:
- App calls `GET /api/state?stateId=...` on hydration.
- If server state exists and is meaningful, it replaces local state.
- Any state updates are debounced and sent via `POST /api/state?stateId=...`.

3. Per-device state key:
- A client UUID is stored in `localStorage` key `uniwallet-state-id`.
- That value is used as `stateId`, so each device/browser profile keeps separate synced state.

4. Fallback behavior:
- DB/API failures do not block the app.
- localStorage continues to work offline/degraded.

## API Endpoints

### `GET /api/state?stateId=<id>`

Returns:
- `{ state: BudgetState | null }`

Behavior:
- Ensures `app_states` table exists.
- Loads JSON state by `id`.

### `POST /api/state?stateId=<id>`

Body:

```json
{ "state": { "budget": null, "expenses": [], "isOnboarded": false } }
```

Behavior:
- Validates shape.
- Upserts JSONB into `app_states`.

### `GET /api/offers`

Behavior:
- Uses `OFFERS_API_URL` if configured and valid.
- Falls back to local default offers if missing/failing/invalid.

Response:
- `{ offers: OfferItem[], source: "live" | "fallback" }`

## Database (Neon/Postgres)

Schema file:
- `db/schema.sql`

It includes:
- Core relational model (`users`, `budgets`, `categories`, `budget_categories`, `expenses`)
- Snapshot sync table used by the current app runtime (`app_states`)

### Apply schema in Neon

1. Open Neon SQL editor.
2. Run contents of `db/schema.sql`.
3. Copy connection string into `POSTGRES_URL`.
4. Restart app.

## Themes

Supported modes:
- `dark`
- `light`
- `fancy`

Theme is stored in `localStorage` (`uniwallet-theme`) and applied early in layout to reduce FOUC.

## Testing

Vitest is configured with jsdom and Testing Library.

Run:

```bash
bun run test
```

Coverage:

```bash
bun run test:coverage
```

### E2E (Playwright)

Install browser binaries once:

```bash
bunx playwright install
```

Run E2E:

```bash
bun run test:e2e
```

## Troubleshooting

### ChunkLoadError in dev (`/_next/static/chunks/...`)

Usually stale dev chunks/HMR cache.

Fix:

```bash
rm -rf .next
bun run dev
```

Then hard-refresh browser.

### Hook order error (`Rendered more hooks than during previous render`)

Cause:
- Hook called conditionally (after an early return).

Fix:
- Ensure all hooks are called unconditionally at top-level of component.

### DB unavailable errors

If `POSTGRES_URL` is missing/unreachable:
- Server sync endpoints degrade gracefully.
- App still works with localStorage.

## Notes

- The app is mobile-first, with desktop side menu behavior at larger breakpoints.
- Logo is served from `public/logo.svg` (not hardcoded SVG in component).
