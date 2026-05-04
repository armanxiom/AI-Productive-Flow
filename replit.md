# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the Ideaso mobile productivity app (Expo) and a shared API server (Express).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (available, not used by Ideaso in MVP)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Ideaso Mobile App (`artifacts/ideaso`)
- **Type**: Expo (React Native)
- **Preview path**: `/`
- **Description**: Offline-first, AI-native productivity app for capturing ideas, notes, and tasks

#### Features
- 5-tab navigation: Home, Inbox, Notes, Tasks, Search
- Dark-only theme (`#0D0D0D` bg, `#8B5CF6` purple primary)
- Note editor with AI actions (Summarize, Clean Up, To Tasks, Outline)
- Task management with status cycling (Todo → In Progress → Done)
- Tag system with custom colors
- Quick capture (Inbox) for instant idea capture
- Local-first with AsyncStorage persistence
- Seeded with sample data on first launch

#### Key Files
- `constants/colors.ts` — Dark theme tokens (purple #8B5CF6 primary)
- `lib/types.ts` — Note, Task, Tag TypeScript interfaces
- `lib/storage.ts` — AsyncStorage CRUD helpers
- `lib/utils.ts` — generateId, formatDate, truncate, stripMarkdown
- `lib/api.ts` — Fetch helper for AI calls to API server
- `context/AppContext.tsx` — Global state provider for notes/tasks/tags
- `components/` — NoteCard, TaskCard, AIPanel, EmptyState, QuickCapture, TagBadge
- `app/(tabs)/` — Home, Inbox, Notes, Tasks, Search screens
- `app/notes/[id].tsx` — Note editor with AI panel
- `app/settings.tsx` — Settings, tag management, export

### API Server (`artifacts/api-server`)
- **Type**: Express 5 + TypeScript
- **Path**: `/api`
- **AI Integration**: OpenAI via Replit AI Integrations (env: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`)
- **AI Route**: `POST /api/ai` — actions: `summarize`, `cleanup`, `to-tasks`, `outline`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
