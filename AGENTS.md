# Mission Control — Agent Guide

## Cursor Cloud specific instructions

### Services overview

| Service | Command | Ports |
|---|---|---|
| Automerge Sync Server | `MC_ALLOW_INSECURE_LOCAL=1 npm run sync` | HTTP :8004, WS :8005 |
| UI Prototype (Vite) | `cd ui-prototype && npm run dev` | :5174 (proxies `/mc-api` → :8004, `/mc-ws` → :8005) |
| CLI | `MC_ALLOW_INSECURE_LOCAL=1 node bin/mc.js <command>` | N/A |

### Running locally

- **Auth bypass**: Set `MC_ALLOW_INSECURE_LOCAL=1` for the sync server, CLI, and daemon to skip token auth during local development.
- **Start order**: The sync server must be running before the CLI or UI can connect. Start it first.
- **No external dependencies**: All data is stored in local Automerge CRDT files under `.mission-control/`. No databases, Docker, or external services are required.
- **UI base path**: The Vite dev server serves the UI at `/mc/` (not `/`). Navigate to `http://localhost:5174/mc/`.

### Testing

- Unit tests: `npm test` (uses Node.js built-in `node:test` runner; test files in `test/*.test.js`)
- Smoke tests: `npm run smoke:automerge`, `npm run smoke:cli`
- No ESLint or linter is configured in this project.

### Gotchas

- The CLI writes a `.mission-control-url` file on first run to persist the Automerge document URL. If you get sync issues, delete this file and `.mission-control/` directory, then restart the sync server to create a fresh document.
- The UI prototype uses `@automerge/automerge-repo` v1.x while the backend uses v2.x — they sync over WebSocket via the proxy, not via direct import compatibility.
