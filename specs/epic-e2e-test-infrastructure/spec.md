# E2E Test Infrastructure

## Goal

Set up a fully reproducible end-to-end testing environment for notestr before deploying to production. Tests must cover the critical user journey: authenticate via NIP-46 bunker → create an encrypted MLS group → manage tasks on the board.

## Context

notestr is a Next.js static app (exported to `./out`) that:
- Connects to Nostr relays (default: `ws://localhost:7777` in dev)
- Authenticates via NIP-07 browser extensions, NIP-46 bunker:// URLs, or nostrconnect://
- Uses marmot-ts (MLS over Nostr) for encrypted group management
- Stores tasks as Nostr events in MLS groups

`next.config.ts` sets `basePath: "/notestr"` only when `NODE_ENV === "production"`. The E2E build uses `NODE_ENV=test` so no basePath is applied and the app is served at `/`.

## Architecture

### Services (Docker Compose — `docker-compose.e2e.yml`)

- **relay**: strfry relay on port 7777, using an ephemeral (tmpfs) volume so state is wiped on each run. Reuses `./strfry.conf`.

Playwright globalSetup starts additional processes on the host:
- **bunker**: `node e2e/fixtures/bunker.mjs` — NIP-46 bunker using `NDKNip46Backend` from `@nostr-dev-kit/ndk` (v3). Connects to `ws://localhost:7777`. Uses a hardcoded deterministic test keypair (`E2E_BUNKER_NSEC` constant) so the `bunker://` URL is known at test time.
- **app**: `npx serve out -l 3100` — serves the pre-built static export. Playwright navigates to `http://localhost:3100`.

All three share the same relay at `ws://localhost:7777`.

### Build Step

```
NODE_ENV=test NEXT_PUBLIC_RELAYS=ws://localhost:7777 npx next build
```

This produces `./out` with the relay URL baked in and no basePath prefix.

### NDK Headless Fixture

`e2e/fixtures/ndk-client.ts` — a Playwright fixture providing a headless `NDK` instance (using `NDKPrivateKeySigner` with a second deterministic test keypair). Used to:
- Subscribe to relay events and verify published events
- Act as a second user for group invitation scenarios

### Bunker URL

The bunker uses a hardcoded test private key. The resulting `bunker://` URL has the form:
```
bunker://<HEX_PUBKEY>?relay=ws%3A%2F%2Flocalhost%3A7777
```
The URL is exported as a constant from `e2e/fixtures/bunker.mjs` and imported into `playwright.config.ts` as `process.env.E2E_BUNKER_URL`.

### Test Scenarios

1. **Auth flow**: Navigate to app → select "bunker:// URL" tab → paste `E2E_BUNKER_URL` → assert authenticated state (pubkey chip visible in header, localStorage has `notestr-nip46-payload`)
2. **Group flow**: After auth → create a new group → verify group name appears in the sidebar list
3. **Task flow**: Select a group → create a task → assert card appears in "To Do" column → drag/click to move to "In Progress"

## Constraints

- Node.js >= 20 LTS required
- `make e2e` must work without manual steps after `npm install` and `npx playwright install --with-deps chromium`
- `make e2e` automatically: builds app, starts relay (Docker), starts bunker + app (host), runs tests, tears down all services
- Relay state is isolated per run: `docker compose -f docker-compose.e2e.yml down -v` wipes the ephemeral volume
- Tests clear localStorage between each test via `storageState: {}` and `page.evaluate(() => localStorage.clear())`
- The existing `docker-compose.yml` (dev relay) is untouched
- Reuses existing `./strfry.conf` for the E2E relay

## File Layout

```
e2e/
  fixtures/
    bunker.mjs          # NIP-46 bunker fixture (Node ESM)
    ndk-client.ts       # Headless NDK fixture for Playwright
  tests/
    auth.spec.ts        # NIP-46 bunker auth flow
    groups.spec.ts      # Group create/list
    tasks.spec.ts       # Task create/move
playwright.config.ts
docker-compose.e2e.yml
```

## Acceptance Criteria

- **AC-001**: `make e2e` runs end-to-end without manual intervention (relay starts, app builds and serves, Playwright runs, all services stop)
- **AC-002**: Playwright successfully authenticates via the hardcoded bunker:// URL; the pubkey chip is visible in the header
- **AC-003**: A Marmot group can be created and its name appears in the sidebar after creation
- **AC-004**: A task can be created in a group and appears in the "To Do" column
- **AC-005**: `docker-compose.e2e.yml up/down -v` starts and stops the relay cleanly with no persistent state between runs
- **AC-006**: `playwright.config.ts` exists with correct `baseURL`, `testDir`, and `globalSetup` pointing to the bunker/app fixtures
