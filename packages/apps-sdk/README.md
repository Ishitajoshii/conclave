# @conclave/apps-sdk

Conclave in-meeting app SDK (shared web + native).

## Guides

- [Add a New App Integration](./docs/add-a-new-app-integration.md)
- [Contributing To Apps SDK](./docs/contributing-to-apps-sdk.md)
- [Dev Playground Walkthrough](./docs/dev-playground-walkthrough.md)

## What You Can Build

- Shared canvases and drawing tools (whiteboard pattern)
- Structured collaborative tools (polls, checklists, planning boards)
- Synchronized editors (notes, agendas, runbooks)
- Lightweight multiplayer utilities (timers, estimators, scoreboards)
- Asset-backed apps with uploads using `useAppAssets`

## Quick Start (Host Integration)

```tsx
import {
  AppsProvider,
  createAssetUploadHandler,
  defineApp,
  registerApps,
} from "@conclave/apps-sdk";

const pollApp = defineApp({
  id: "poll",
  name: "Poll",
  web: PollWeb,
  native: PollNative,
});

registerApps([pollApp]);

const uploadAsset = createAssetUploadHandler({
  // endpoint defaults to "/api/apps"
  // baseUrl is optional for non-web hosts
  baseUrl: process.env.EXPO_PUBLIC_API_URL,
});

<AppsProvider socket={socket} user={user} isAdmin={isAdmin} uploadAsset={uploadAsset}>
  <MeetingUI />
</AppsProvider>;
```

## Development Playground (Example App)

To make onboarding easier, this repo includes a dev-only sample app:

- App id: `dev-playground`
- Source: `src/apps/dev-playground`
- Web entry: `@conclave/apps-sdk/dev-playground/web`
- Core helpers: `@conclave/apps-sdk/dev-playground/core`

What it demonstrates:

- Defining an app with `defineApp` and `createDoc`
- Yjs shared state patterns (`Map`, `Text`, `Array`)
- Presence with `useAppPresence`
- Lock behavior (`locked` + `isAdmin` override)

How to use it:

1. Run the web app in development mode: `pnpm -C apps/web dev`
2. Join a meeting as admin
3. Open the `Apps` menu and toggle `Dev Playground`

The app is registered only in development (`NODE_ENV === "development"`) in `apps/web/src/app/meets-client.tsx`.

## Meeting Permissions

- Admins can open and close apps from meeting controls.
- Admins can lock and unlock app editing.
- Non-admins receive app state and can interact when unlocked.
- Lock mode should be treated as read-only for non-admins.

## Build A New App Fast

Scaffold a new app shell (core + web + native + exports + mobile aliases):

```bash
pnpm -C packages/apps-sdk run new:app polls
```

Preview changes only:

```bash
pnpm -C packages/apps-sdk run new:app polls --dry-run
```

Validate app wiring (exports + mobile aliases):

```bash
pnpm -C packages/apps-sdk run check:apps
```

Auto-fix JSON wiring drift:

```bash
pnpm -C packages/apps-sdk run check:apps:fix
```

## Core Concepts

- `defineApp(app)`
  - Validates app shape at registration time.
  - Requires `id`, `name`, and at least one renderer (`web` or `native`).
- `registerApps(apps)` / `registerApp(app)`
  - Adds apps to the runtime registry.
  - Safe to call repeatedly from mount effects.
- `useApps()`
  - Runtime state + controls (`openApp`, `closeApp`, `setLocked`, `refreshState`).
- `useAppDoc(appId)`
  - Returns `{ doc, awareness, isActive, locked }` for Yjs + presence.
- `useRegisteredApps(platform?)`
  - Returns registered apps with runtime metadata:
  - `isActive`, `supportsWeb`, `supportsNative`.
- `createAssetUploadHandler(options)`
  - Cross-platform file upload helper for app assets.
  - Supports `File`, `Blob`, and native `{ uri, name, type }` inputs.
  - Defaults to `POST /api/apps` with no config.
- `createAppDoc(rootKey, initializer?)`
  - Small helper to initialize app Yjs docs consistently.
  - Combine with `getAppRoot`, `ensureAppMap`, `ensureAppArray`, `ensureAppText`.

## Built-In App Export Paths

- Whiteboard (web): `@conclave/apps-sdk/whiteboard/web`
- Whiteboard (native): `@conclave/apps-sdk/whiteboard/native`
- Whiteboard (core): `@conclave/apps-sdk/whiteboard/core`
- Dev playground (web): `@conclave/apps-sdk/dev-playground/web`
- Dev playground (core): `@conclave/apps-sdk/dev-playground/core`

## Patterns For New Apps

- Keep app-specific Yjs schema initialization in `createDoc`.
- Keep local-only ephemeral UX state in React state, not Yjs.
- Use awareness for cursor/selection/presence only.
- Treat lock as a read-only mode for non-admin users.
- Use `uploadAsset` from context instead of wiring ad hoc uploads per app.
