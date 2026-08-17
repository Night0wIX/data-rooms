# Data Room

A virtual data room for due diligence document management: nested folders, file uploads, and granular sharing (public links and per-user access) on top of a Node.js/PostgreSQL backend and a React frontend.

## Tech stack

**Backend:** NestJS + TypeScript, PostgreSQL via Prisma, Supabase for auth and blob storage.

NestJS was chosen for its explicit module boundaries and built-in DI — with five domains (user, data-room, folder, file, sharing) that all need to share one access-control service, constructor injection keeps that dependency explicit and testable instead of importing a singleton from a random file. Prisma over a raw query builder for type-safe queries and migrations, with a few hand-written `$queryRaw` recursive CTEs where the ORM can't express tree traversal (ancestor/descendant lookups on the folder tree) without N+1 round trips. Supabase covers both auth (JWT-based, validated by a guard on every request) and storage (S3-compatible, signed URLs) — using one provider for both avoided standing up two separate pieces of infrastructure for an MVP.

**Frontend:** React + TypeScript + Vite, TanStack Query for server state, TanStack Form for forms, Tailwind + shadcn/ui for components, React Router for routing.

TanStack Query instead of manually tracking loading/error state per request — every list (folders, files, shares) needs pending/error/empty states per the app's own UX checklist, and re-deriving that by hand in every component invites inconsistency.

## Architecture

Each backend module follows the same layering: **controller → service → repository**. Controllers never touch the database directly; repositories never contain business logic; all authorization checks live in services, before any data access.

The core piece is a single `AccessService` shared by every module. It exposes two methods, `assertCanView` and `assertCanEdit`, both taking a polymorphic `{ resourceType, resourceId, userId }`. Access is granted if the requesting user owns the data room the resource belongs to, or if there's a non-revoked `Share` covering the resource itself or any of its ancestors (a shared folder implicitly grants access to everything nested inside it). The ancestor chain for a folder is computed with a recursive SQL CTE rather than walking parent links in a loop, so the check is one query regardless of nesting depth. No other service re-implements this logic — every mutation and every read goes through `AccessService` first.

Public link access (view-by-token, no login) is deliberately kept in its own set of endpoints (`/share/public/:token/...`) rather than layered into the authenticated folder/file controllers via an optional token parameter. Anonymous traffic never touches the auth-guarded routes, which keeps two different trust models from being mixed in the same controller.

Files never pass through the NestJS server. The client requests a signed upload URL from the backend, then uploads the file directly to Supabase Storage — the server only ever sees metadata, never the file bytes, which removes it as a bottleneck for large or concurrent uploads. This is a two-phase flow: `POST /files/upload/init` creates a `PENDING` record and returns a signed upload URL; the client uploads directly to storage; `POST /files/:id/upload/complete` then verifies the object actually exists in storage before flipping the record to `READY`. Without that second phase, a browser tab closed mid-upload would leave a database row pointing at a file that was never written.

## Project structure

```
client/
  src/
    app/                 # Router, providers, layouts
    features/            # Business features
      auth/
      data-room/
      folder/
      file/
      sharing/
        api/             # Services, types, query keys
        hooks/            # Feature-specific React hooks
        ui/               # Feature-specific components
        schemas/          # Validation schemas
    pages/               # Route-level components
    shared/              # Reusable UI, config, types, utils

server/
  src/
    core/                # Database, storage, config, validation, filters
    modules/             # Business domains
      auth/
      user/
      data-room/
      folder/
      file/
      sharing/
        controller/      # HTTP endpoints
        service/         # Business logic
        repository/      # Database access
        dto/             # Request/response DTOs
    shared/              # Shared constants and types

  prisma/
    schema.prisma        # Database schema
    migrations/          # Database migrations
```

Frontend features and backend modules mirror each other 1:1, which keeps "where does X live" predictable in both directions.

## Setup

Requirements: Node version per `.nvmrc`, pnpm, a PostgreSQL database, a Supabase project (auth + storage bucket).

```bash
# from repo root
pnpm install

# server
cd server
cp .env.example .env      # fill in the values below
pnpm prisma migrate deploy
pnpm prisma generate
pnpm dev

# client
cd client
cp .env.example .env      # fill in the values below
pnpm dev
```

> Verify the exact script names above against `server/package.json` and `client/package.json` before publishing — this assumes the conventional `pnpm dev` / `pnpm prisma migrate deploy` names.

**Server environment variables** (`server/.env`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string, used by Prisma |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase key, used for signed upload/download URLs and auth verification |
| CORS_ORIGINS | Comma-separated list of allowed frontend origins for CORS |

> This list reflects what's confirmed from `storage.service.ts`. Cross-check against `server/src/core/config/env/env.schema.ts` for the complete, authoritative list (JWT secret, storage bucket name, port, etc.) before publishing.

**Client environment variables** (`client/.env`):

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the deployed backend |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Supabase client config for auth (Google sign-in) |

> Verify exact names against `client/src/shared/config/env/env.schema.ts`.

Both frontend and backend are deployed independently and publicly accessible; see the links at the top of this repository / submission.

## Features

**Folders** — create, rename, nest arbitrarily, breadcrumb navigation, delete with a preview of affected items (`GET /folders/:id/deletion-preview` walks the subtree and returns file/folder counts before the destructive action is confirmed).

**Files** — multi-file drag-and-drop upload with per-file progress, rename with conflict resolution within a folder, move between folders, delete. Uploads use the signed-URL flow described above: the backend never buffers file bytes, it only issues a short-lived signed PUT URL and later confirms the object landed in storage.

**Sharing** — a data room, folder, or file can be shared two ways: a public link (anyone with the URL gets read-only access, no login) or a per-user invite by email (requires the invitee to have signed in at least once, since access is tied to an internal user record, not a raw email). Both share types support revocation, which takes effect on the next request — access checks aren't cached. Sharing a folder or data room implicitly covers everything nested inside it.

## Data model / ERD

See `./docs/database-diagram.png` for the full ERD.

Notable modeling decisions:

- `Folder.parentId` is a self-relation, supporting arbitrary nesting depth from a single table.
- `File.dataRoomId` is denormalized (a file's data room is technically derivable via `folder → dataRoom`), which avoids a join on every listing query and allows a direct composite index.
- `Share.resourceType` / `Share.resourceId` is a polymorphic reference without a database-level foreign key, rather than three separate `FolderShare` / `FileShare` / `DataRoomShare` tables. This trades away DB-enforced referential integrity (a share could in principle point at a deleted resource id) for a single sharing code path instead of three duplicated ones; integrity is enforced in the service layer instead, which resolves and validates the target resource before creating a share.

## How it scales

**Computing a folder's total size and item count including its subtree.** Not stored — computed on demand with a recursive CTE that walks the folder tree downward from the target folder, summing `File.sizeBytes` and counting rows across every folder in the subtree. This is what powers the deletion preview. For moderate tree sizes this is fast enough given an index on `(parentId)`. If trees get very large or very deep, the next step is denormalized counters (`itemCount`, `totalSizeBytes`) on `Folder`, maintained incrementally on create/move/delete rather than recomputed on every read.

**One data room with 100,000 files.** Indexes already in place cover the common access patterns: `(dataRoomId, createdAt)` and `(folderId, createdAt)` on `File`, `(dataRoomId, parentId)` on `Folder` — both support "list contents of this location, sorted by recency" without a table scan. Cursor-based pagination is already implemented for the data room list (`GET /data-rooms`); the same pattern (`take N+1`, `cursor: { id }`, `skip: 1`) needs to be extended to `GET /files` and `GET /folders`, which currently return unbounded lists. Name search (`searchByName`) currently uses a `LIKE '%query%'` pattern, which can't use a standard B-tree index at this scale — a `pg_trgm` GIN index on `displayName` would fix substring search; true relevance-ranked search would need a dedicated full-text index instead.

**Extending sharing to per-user viewer/editor roles without remodeling.** Already supported, not a hypothetical extension: `Share.role` has been a `VIEWER | EDITOR` enum from the start, and `AccessService.assertCanEdit` already filters on `role === EDITOR` while `assertCanView` accepts either. Adding another role (e.g. `COMMENTER`) is a change to one enum plus the handful of call sites that branch on it — not a schema migration or a change to how existing shares are stored.

## A note on where and how AI was used

I didn't have access to Claude Code or Cursor for this project and worked entirely through chat-based assistants — Claude (Sonnet 5) and GPT — please take that into account when evaluating the AI-assisted portions; the workflow was slower and more manual than an agentic coding tool would allow (copy-pasting files back and forth, no direct repo access for either model).

AI was used for: drafting a manual-testing checklist covering edge cases, states, and permissions UX before implementation, so those cases were designed for up front rather than discovered late; debugging specific errors (stack traces, NestJS dependency-injection failures, type errors) by pasting the relevant files and error output; generating boilerplate/template code for repetitive patterns (DTOs, read-only UI variants of existing components); reviewing code for readability and consistency issues; and flagging specific architectural risks as they came up during the build — for example, catching a module import that would have created a circular dependency between the sharing and file modules, and catching an access-control gap where folder-level sharing worked for browsing folders but was silently bypassed in the file-listing endpoint, which still checked data-room-level access only.

I made the core architectural and security decisions myself rather than delegating them: the service/repository layering, the `AccessService` design and its ancestor-resolution approach, the database schema (including the polymorphic `Share` model and the tradeoffs that come with it), authentication and guard setup, and the signed-upload flow for file storage. AI suggestions in these areas were evaluated and often rejected or corrected rather than applied directly — the circular-dependency and access-control gap mentioned above were both cases where an initial AI-proposed approach was wrong and had to be redesigned rather than patched.