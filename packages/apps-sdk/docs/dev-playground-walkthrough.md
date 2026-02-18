# Dev Playground Walkthrough

The `dev-playground` app is a development-only reference integration for SDK contributors.

It exists to answer one question quickly: "How do I build a real app on top of the Conclave Apps SDK?"

## Where It Lives

- SDK app files: `packages/apps-sdk/src/apps/dev-playground`
- Web layout wrapper: `apps/web/src/app/components/DevPlaygroundLayout.tsx`
- Host registration: `apps/web/src/app/meets-client.tsx`
- Meeting controls wiring:
  - `apps/web/src/app/components/ControlsBar.tsx`
  - `apps/web/src/app/components/mobile/MobileControlsBar.tsx`

## Why It Is Dev-Only

The app is registered only when `NODE_ENV === "development"` so production users do not see an unfinished sandbox in the apps menu.

## What It Demonstrates

1. `defineApp` with a stable `id` (`dev-playground`)
2. Yjs document initialization via `createAppDoc`
3. Shared primitives in one doc (`Map`, `Text`, `Array`)
4. Presence state with `useAppPresence`
5. App lock behavior using `locked` and `isAdmin`
6. Host-level app open/close toggles through `useApps`

## Data Model Example

The app stores this shape in Yjs:

- `counter: number`
- `notes: Y.Text`
- `items: Y.Array<string>`
- `meta: Y.Map` (`createdAt`, `updatedAt`, `updatedBy`)

Source: `packages/apps-sdk/src/apps/dev-playground/core/doc/index.ts`.

## Run It

1. Start web host in dev: `pnpm -C apps/web dev`
2. Join a meeting as admin
3. Open `Apps` menu
4. Toggle `Dev Playground`

## Suggested Contributor Exercises

1. Add a second shared list (for example, "decisions")
2. Add cursor/selection awareness metadata
3. Add an optional file upload action using `useAppAssets`
4. Add a native renderer (`native/index.ts`) and wire mobile host registration

Use this app as a safe scratchpad before creating a production app integration.
