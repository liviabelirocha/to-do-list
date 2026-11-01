# Tasks

A small task manager built with Next.js 15 and tRPC. Tasks are shown on a two-column board (pending / completed), can be dragged between columns, and are created and edited in a modal. The backend keeps everything in memory.

## Running

Requirements: Node.js 18.18+ and pnpm.

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000.

Other scripts:

| Command             | What it does               |
| ------------------- | -------------------------- |
| `pnpm build`        | Production build           |
| `pnpm start`        | Serve the production build |
| `pnpm typecheck`    | TypeScript check           |
| `pnpm lint`         | ESLint                     |
| `pnpm format:write` | Prettier                   |

Data lives only in the server process, so it's lost whenever the server restarts.

## Stack

- **Next.js 15** (App Router) with React 19
- **tRPC 11** + **TanStack Query 5** for the API and client cache, with **superjson** so `Date`s survive the wire
- **Zod** for validation, shared between server and form
- **react-hook-form** for the form state
- **@dnd-kit/core** for drag and drop
- **sonner** for toasts
- **Tailwind CSS 4** for styling

The project was scaffolded with create-t3-app.

## Structure

```
src/
  app/
    layout.tsx                    Providers and toaster
    _components/modal.tsx         Generic modal
    (board)/
      layout.tsx                  Prefetches the board and renders it around every route below
      page.tsx                    "/" (renders nothing; the board is in the layout)
      _components/                Board, Column, TaskCard
      tasks/
        new/page.tsx              "/tasks/new": create modal
        [id]/edit/page.tsx        "/tasks/:id/edit": edit modal
        _components/              TaskForm, TaskModal
    api/trpc/[trpc]/route.ts      tRPC HTTP handler
  lib/schemas/task.ts             Zod field schemas used by router and form
  server/
    api/routers/tasks.ts          Task procedures
    store/tasks.ts                In-memory task list
  trpc/                           tRPC clients (React and server components)
```

Components that belong to a single route live in that route's `_components` folder.

## API

All procedures are under `tasks` (`/api/trpc/tasks.<name>`).

| Procedure | Type     | Input                                          | Returns                         |
| --------- | -------- | ---------------------------------------------- | ------------------------------- |
| `list`    | query    | `{ completed: boolean, cursor?: string }`      | `{ items, nextCursor?, total }` |
| `get`     | query    | `{ id }`                                       | task                            |
| `create`  | mutation | `{ title, description? }`                      | task                            |
| `update`  | mutation | `{ id, title?, description?: string \| null }` | task                            |
| `toggle`  | mutation | `{ id }`                                       | task                            |
| `delete`  | mutation | `{ id }`                                       | `{ id }`                        |

A task is `{ id, title, description?, completed, completedAt?, createdAt }`. The server generates `id` (UUID), `createdAt`, `completed: false` and `completedAt`.

Errors:

- An empty or whitespace-only title is rejected with `BAD_REQUEST`.
- An unknown `id` returns `NOT_FOUND` ("Task not found").
- An unknown `cursor` returns `BAD_REQUEST` ("Invalid cursor").

## How it works

**Board and modals.** The board lives in the `(board)` route group's layout, and `/tasks/new` and `/tasks/:id/edit` render only a modal. Opening or closing a modal is a normal navigation, so the board stays mounted underneath, and the create/edit URLs can be linked or reloaded directly.

**SSR.** The board layout prefetches the first page of each column on the server, and `HydrateClient` passes that data to the client cache, so the first HTML already contains the tasks. The edit page also loads its task on the server and returns a 404 for unknown ids.

**Infinite scroll.** Each column paginates on its own, 10 tasks per page:

- Pending tasks are sorted newest first.
- Completed tasks are sorted by most recently completed.
- The cursor is the id of the last task loaded.
- Each column has its own scroll area with an invisible sentinel at the end, and an `IntersectionObserver` loads the next page when the sentinel comes into view.

**Drag and drop.** Dropping a card on the other column calls `toggle`, which sets or clears `completedAt` on the server:

- A drag only starts after 5px of movement, so clicking a card still opens it for editing.
- The dragged card is rendered in a `DragOverlay`, so the column's scroll area doesn't clip it.

**Mutations.** There are no optimistic updates, and the client doesn't repeat any business rule:

- After each mutation the client invalidates `tasks.list` and refetches from the server.
- Success and error messages are shown as toasts.
- Server error messages, such as "Task not found", are shown as they are.

**Validation.** `title` and `description` are defined once in `src/lib/schemas/task.ts`, and the router and the form both use them. The form blocks submission when the title is empty.

**Clearing a description.** In `update`, `undefined` leaves a field unchanged and `description: null` clears it. The form sends `null` when the description field is emptied.

**In-memory store.** The list is kept on `globalThis`. Next.js loads server modules separately for the API route handler and for server components, so a plain module-level array would give SSR and the API two different lists.

## Notes

- In development, tRPC adds an artificial 100–500ms delay to every call (`timingMiddleware` in `src/server/api/trpc.ts`). This simulates network latency.
- Dates are formatted in `pt-BR`. They're rendered on the server in the server's time zone, so if the server and the browser are in different time zones the dates can cause a hydration mismatch.
