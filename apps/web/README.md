# Conclave Web

Development
- Install deps: `pnpm install`
- Start dev server: `pnpm --filter conclave-web dev`

Integration notes
- Provide `getJoinInfo` in `src/app/clients/meets-client-page.tsx` (client wrapper) or wire your own wrapper.
- Optionally provide `getRooms` and `getRoomsForRedirect` to populate admin room lists.
- Reaction assets are served from `public/reactions` and passed via `reactionAssets`.
