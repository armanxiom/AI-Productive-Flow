# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the Ideaso mobile productivity app (Expo) and a shared API server (Express).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Auth**: Replit Auth (OpenID Connect + PKCE) via `openid-client` v6
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec) — run `pnpm --filter @workspace/api-spec run codegen`
- **Build**: esbuild (CJS bundle)

## Codegen Notes

The codegen script in `lib/api-spec/package.json` runs orval AND then patches `lib/api-zod/src/index.ts` to export only from `./generated/api` plus `AuthUser` from `./generated/types/authUser`. This avoids a duplicate export conflict between Orval's Zod validators and TypeScript interfaces.

## Artifacts

### Ideaso Mobile App (`artifacts/ideaso`)
- **Type**: Expo (React Native) SDK 54
- **Preview path**: `/`
- **Description**: Offline-first, AI-native productivity app for capturing ideas, notes, and tasks

#### Features
- 5-tab navigation: Home, Inbox, Notes, Tasks, Search
- Dark-only theme (`#0D0D0D` bg, `#8B5CF6` purple primary)
- Note editor with AI panel (10 AI actions)
- Task management with status cycling
- Tag system with custom colors
- Quick capture inbox
- **Replit Auth login** — opens OIDC flow via expo-auth-session, stores session in expo-secure-store
- **Cloud sync** — on login, syncs notes/tasks/tags to/from PostgreSQL via `/api/data/sync`
- Local-first with AsyncStorage, syncs to server when authenticated

#### AI Actions (10 total)
Summarize, Clean Up, To Tasks, Outline, Expand, Key Points, Title Ideas, Brainstorm, Fix Grammar, Meeting Notes

#### Key Files
- `constants/colors.ts` — Dark theme tokens
- `lib/types.ts` — Note, Task, Tag, AIAction TypeScript interfaces
- `lib/storage.ts` — AsyncStorage CRUD helpers
- `lib/utils.ts` — generateId, formatDate, truncate, stripMarkdown
- `lib/api.ts` — Fetch helpers (AI calls + data sync, auth token via SecureStore)
- `lib/auth.tsx` — AuthProvider + useAuth hook (Replit OIDC mobile flow)
- `context/AppContext.tsx` — Global state with cloud sync on login
- `components/AIPanel.tsx` — 10-action AI panel modal

### API Server (`artifacts/api-server`)
- **Type**: Express 5 + TypeScript
- **Path**: `/api`
- **Auth**: Replit Auth — login/callback/logout routes + mobile token exchange
- **AI Integration**: OpenAI via Replit AI Integrations
- **AI Route**: `POST /api/ai` — 10 actions (summarize, cleanup, to-tasks, outline, expand, key-points, title, brainstorm, fix-grammar, meeting-notes)
- **Data Sync**: `GET /api/data/sync` / `POST /api/data/sync` — per-user JSON blob in PostgreSQL

### Database Tables
- `sessions` — Auth sessions (Replit Auth requirement)
- `users` — User accounts (Replit Auth requirement)
- `user_data` — Per-user notes/tasks/tags JSON blob for cloud sync

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
