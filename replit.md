# Connect

Stay Close, Even When You're Far. A premium Pixar-inspired family communication platform for residential students who can only access shared computers.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, path `/api`)
- `pnpm --filter @workspace/connect run dev` — run the frontend (port 20001, path `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion, wouter routing
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — Drizzle table schemas (users, connections, conversations, messages, emergency_alerts, settings, devices)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/connect/src/pages/` — Frontend pages (Landing, Onboarding, Signup, Verify, Login, Chats, Chat, Themes, Settings, Devices, etc.)
- `artifacts/connect/src/components/` — Reusable UI components
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod schemas for server validation (do not edit)

## Architecture decisions

- Demo user approach: A seeded demo user (`sree_07`) exists for exploring the app without requiring real auth. Firebase Auth is frontend-only and not yet wired to the backend.
- Priority messages are a first-class entity (enum: normal, good_news, important, urgent, emergency) that affect notification severity.
- Auto-logout is a core security feature for shared/public computers — enabled by default with 15-minute timeout.
- The api-zod barrel (`lib/api-zod/src/index.ts`) only re-exports from `./generated/api` (not `./generated/types`) to prevent TS2308 collisions when operations have both path and query params.
- The codegen script in `lib/api-spec/package.json` uses a `printf` post-step to overwrite the barrel after orval regenerates it.

## Product

- Landing page with hero, features, "Connect in Your Way" section, auto-logout feature, and "Your safety, our priority" section
- Onboarding (3 screens): Welcome → Create Account with username availability check → OTP Verification
- Authentication: Google, Mobile OTP, Username/Password
- Home chat list with tabs: All / Important / Groups / Emergency
- Individual chat with priority message system (5 levels with unique gradients and animations)
- Emergency alert system with red glowing UI
- Theme gallery: Midnight, Galaxy, Sunset, Ocean, Forest, Lavender, Candy, Bubblegum
- Auto-logout security feature for shared computers
- Connected devices management
- Settings, profile, connections (username search, QR, invite link)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` before using updated hooks.
- The codegen overwrites `lib/api-zod/src/index.ts` — the script includes a `printf` fix to restore a clean barrel.
- Backend routes use hardcoded `DEMO_USER_ID = 1` (first seeded user) until real auth is wired up.
- Do not run `pnpm dev` at workspace root — individual workflows use injected `PORT` and `BASE_PATH` env vars.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
