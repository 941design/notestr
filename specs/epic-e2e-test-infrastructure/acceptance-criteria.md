# Acceptance Criteria: E2E Test Infrastructure

Generated: 2026-03-17T00:00:00Z
Source: spec.md

## Overview

These criteria verify that a fully reproducible end-to-end test environment exists for notestr, covering the critical user journey: NIP-46 bunker authentication, encrypted MLS group creation, and task management. All criteria must be satisfied before deploying to production.

## Criteria

### AC-001: `make e2e` orchestrates full lifecycle without manual steps

- **Description**: Running `make e2e` from a clean state (after `npm install` and `npx playwright install --with-deps chromium`) builds the app, starts the relay via Docker Compose, starts the bunker and static server on the host, runs all Playwright tests, and tears down all services — all without any manual intervention or preconditions beyond the initial install.
- **Verification**: From repo root, run `npm install && npx playwright install --with-deps chromium && make e2e`. Command must exit 0 and output must show relay started, app built, tests ran, and services stopped.
- **Type**: e2e
- **Source**: Spec "AC-001" and "Constraints" section

### AC-002: Playwright authenticates via hardcoded bunker URL and pubkey chip is visible

- **Description**: The `auth.spec.ts` test navigates to `http://localhost:3100`, selects the "bunker:// URL" tab, pastes `E2E_BUNKER_URL` (the constant exported from `e2e/fixtures/bunker.mjs`), clicks Connect, and asserts: (a) the pubkey chip is visible in the header DOM, and (b) `localStorage.getItem('notestr-nip46-payload')` is non-null.
- **Verification**: `make e2e` runs `auth.spec.ts` test "auth flow" and it passes. Alternatively: `npx playwright test e2e/tests/auth.spec.ts` with services already running exits 0.
- **Type**: e2e
- **Source**: Spec "AC-002" and "Test Scenarios" section

### AC-003: MLS group creation produces group name in sidebar

- **Description**: The `groups.spec.ts` test, after authenticating via the bunker helper, creates a new group with a known name and asserts that the group name string is visible within the sidebar list element.
- **Verification**: `make e2e` runs `groups.spec.ts` test and it passes. The sidebar element containing the group name must be visible in Playwright's assertion.
- **Type**: e2e
- **Source**: Spec "AC-003" and "Test Scenarios" section

### AC-004: Task creation in a group produces card in "To Do" column

- **Description**: The `tasks.spec.ts` test, after authenticating and selecting a group, creates a task with a known title and asserts the task card is visible in the "To Do" column.
- **Verification**: `make e2e` runs `tasks.spec.ts` test and it passes. The task card element must be visible and located within the "To Do" column container in Playwright's assertion.
- **Type**: e2e
- **Source**: Spec "AC-004" and "Test Scenarios" section

### AC-005: `docker-compose.e2e.yml` relay starts, accepts WebSocket connections, and leaves no persistent state

- **Description**: `docker-compose.e2e.yml` defines a `relay` service using strfry on port 7777 with a `tmpfs` volume (not a named or host volume). After `docker compose -f docker-compose.e2e.yml up -d`, a WebSocket connection to `ws://localhost:7777` is accepted. After `docker compose -f docker-compose.e2e.yml down -v`, no named volume exists for the relay data.
- **Verification**: (a) `docker compose -f docker-compose.e2e.yml up -d && npx wscat -c ws://localhost:7777` connects successfully (exit 0 or prints connected). (b) `docker compose -f docker-compose.e2e.yml down -v && docker volume ls` shows no relay data volume. (c) The volume definition in the YAML uses `tmpfs` driver, not a host bind-mount.
- **Type**: integration
- **Source**: Spec "AC-005" and "Services (Docker Compose)" section

### AC-006: `playwright.config.ts` contains correct baseURL, testDir, and globalSetup

- **Description**: The file `playwright.config.ts` at the repo root sets `baseURL` to `'http://localhost:3100'`, `testDir` to `'./e2e/tests'`, and `globalSetup` to a path pointing to the bunker/app setup fixture. A corresponding `globalTeardown` path must also be set.
- **Verification**: Read `playwright.config.ts` and confirm: `baseURL: 'http://localhost:3100'`, `testDir: './e2e/tests'`, `globalSetup` field is present and references an existing file, `globalTeardown` field is present and references an existing file.
- **Type**: manual
- **Source**: Spec "AC-006" and "Architecture" section

### AC-007: Session persists across page reload

- **Description**: After the `auth.spec.ts` test authenticates via bunker, a full page reload (`page.reload()`) still shows the pubkey chip in the header without re-entering credentials, because `restoreNip46Session()` reads `notestr-nip46-payload` from localStorage on mount.
- **Verification**: `auth.spec.ts` contains a test case "session is restored after page reload" that calls `page.reload()` after authentication and asserts the pubkey chip is still visible. Test passes when `make e2e` runs.
- **Type**: e2e
- **Source**: Spec "Test Scenarios" item 1 (implicit: "session is restored automatically"), `src/lib/nostr.ts` `restoreNip46Session()`

### AC-008: Disconnect clears session and returns to sign-in screen

- **Description**: After authentication, clicking the disconnect action removes the pubkey chip from the header and returns the UI to the sign-in screen (the bunker URL input tab is visible again). `localStorage.getItem('notestr-nip46-payload')` returns null after disconnect.
- **Verification**: `auth.spec.ts` contains a test case "disconnect clears session" that clicks disconnect after authentication and asserts: pubkey chip is not visible, sign-in UI is visible, and localStorage key is cleared. Test passes when `make e2e` runs.
- **Type**: e2e
- **Source**: Spec "Test Scenarios" item 1 (implicit: "disconnect → pubkey chip gone, back to sign-in screen")

### AC-009: `e2e/fixtures/bunker.mjs` starts and logs ready

- **Description**: Running `node e2e/fixtures/bunker.mjs` connects to `ws://localhost:7777`, registers the NIP-46 handler via `NDKNip46Backend`, and logs a ready message to stdout. The file exports `E2E_BUNKER_NSEC` (the test private key constant) and `E2E_BUNKER_URL` (the `bunker://` URL derived from it).
- **Verification**: With the relay running (`docker compose -f docker-compose.e2e.yml up -d`), run `node e2e/fixtures/bunker.mjs` and observe stdout contains a ready message within 5 seconds. Also verify `E2E_BUNKER_URL` is defined and matches the pattern `bunker://<64-char-hex>?relay=ws%3A%2F%2Flocalhost%3A7777`.
- **Type**: integration
- **Source**: Spec "Architecture / bunker" section and "Bunker URL" section

### AC-010: `e2e/fixtures/ndk-client.ts` provides headless NDK Playwright fixture

- **Description**: `e2e/fixtures/ndk-client.ts` exports a Playwright `test` object extended with a `ndkClient` fixture. The fixture instantiates `NDK` with `NDKPrivateKeySigner` using a second deterministic test keypair, calls `ndk.connect()`, and yields the connected NDK instance to tests. The fixture tears down the connection after each test.
- **Verification**: A unit-level check: import the fixture in a test file and verify `ndkClient` is an NDK instance with `signer` set and `pool.connectedRelays.size > 0` after the relay is running. This is exercised implicitly when `make e2e` runs any test that uses the fixture.
- **Type**: integration
- **Source**: Spec "NDK Headless Fixture" section

### AC-011: `make e2e-install` installs Playwright and Chromium

- **Description**: Running `make e2e-install` installs `@playwright/test` (if not already in devDependencies) and runs `npx playwright install --with-deps chromium` so that Chromium is available for tests without requiring manual steps.
- **Verification**: After `make e2e-install`, running `npx playwright --version` exits 0 and `npx playwright install --list` shows Chromium is installed.
- **Type**: integration
- **Source**: Spec "Constraints" section ("must work without manual steps after npm install and npx playwright install --with-deps chromium"), exploration "extension_points"

### AC-012: App is built with `NODE_ENV=test` and no basePath

- **Description**: The globalSetup for Playwright builds the Next.js app with `NODE_ENV=test NEXT_PUBLIC_RELAYS=ws://localhost:7777 npx next build`. The resulting `./out` directory contains HTML/JS files with relay URL `ws://localhost:7777` baked in, and no `/notestr` basePath prefix in asset paths.
- **Verification**: After globalSetup runs, inspect `./out/index.html` (or the root HTML file) to confirm asset paths do not begin with `/notestr/`. Confirm `strings ./out/_next/static/chunks/*.js | grep localhost:7777` matches at least one chunk.
- **Type**: integration
- **Source**: Spec "Build Step" section and `next.config.ts` note about basePath

---

## Verification Plan

### Automated Tests
- E2E tests (Playwright): AC-001, AC-002, AC-003, AC-004, AC-007, AC-008
- Integration tests (scripted CLI checks): AC-005, AC-009, AC-010, AC-011, AC-012

### Manual Verification
- AC-006: Read `playwright.config.ts` and verify field values match the spec

---

## E2E Test Plan (MANDATORY)

### Infrastructure Requirements
- **Docker Compose**: `docker-compose.e2e.yml` with `relay` (strfry, port 7777, tmpfs volume)
- **Playwright**: Chromium, `baseURL: http://localhost:3100`, `testDir: ./e2e/tests`
- **Host processes (globalSetup)**: `node e2e/fixtures/bunker.mjs`, `npx serve out -l 3100`
- **Test data**: Hardcoded `E2E_BUNKER_NSEC` in `bunker.mjs`; localStorage cleared between tests

### E2E Scenarios

| Scenario | User Steps (Browser) | Expected Outcome | ACs Validated |
|----------|---------------------|-------------------|---------------|
| bunker-auth-flow | 1. Navigate to `http://localhost:3100` 2. Click "bunker:// URL" tab 3. Paste `E2E_BUNKER_URL` 4. Click Connect 5. Wait for pubkey chip | Pubkey chip visible in header; `localStorage.notestr-nip46-payload` is set | AC-001, AC-002 |
| session-restore | 1. Complete auth 2. Call `page.reload()` 3. Wait for hydration | Pubkey chip still visible without re-authenticating | AC-007 |
| disconnect-flow | 1. Complete auth 2. Click disconnect action 3. Observe UI | Pubkey chip gone; sign-in screen visible; localStorage key cleared | AC-008 |
| group-creation | 1. Authenticate via bunker helper 2. Click "Create group" 3. Enter group name 4. Confirm | Group name appears in sidebar list | AC-003 |
| task-creation | 1. Authenticate via bunker helper 2. Select group 3. Create task with known title 4. Confirm | Task card appears in "To Do" column | AC-004 |

### Test Flow Per Scenario

**bunker-auth-flow**
1. Docker Compose setup: `relay` service running
2. Preconditions: globalSetup has built app, started bunker, started serve on port 3100; `E2E_BUNKER_URL` available in env
3. User steps: navigate, click tab, type URL, click Connect, `page.waitForSelector('[data-testid="pubkey-chip"]')`
4. Assertions: `expect(page.locator('[data-testid="pubkey-chip"]')).toBeVisible()`, `expect(await page.evaluate(() => localStorage.getItem('notestr-nip46-payload'))).not.toBeNull()`
5. Teardown: `page.evaluate(() => localStorage.clear())`

**group-creation**
1. Docker Compose setup: `relay` service running
2. Preconditions: authenticated state (via auth helper calling bunker flow before test)
3. User steps: click create-group button, type group name "E2E Test Group", confirm
4. Assertions: `expect(page.locator('text=E2E Test Group')).toBeVisible()` within sidebar
5. Teardown: `page.evaluate(() => localStorage.clear())`

**task-creation**
1. Docker Compose setup: `relay` service running
2. Preconditions: authenticated state; group "E2E Test Group" already created
3. User steps: click group in sidebar, click create-task button, type task title "E2E Task", confirm
4. Assertions: `expect(page.locator('[data-column="todo"] >> text=E2E Task')).toBeVisible()`
5. Teardown: `page.evaluate(() => localStorage.clear())`

### E2E Coverage Rule
- AC-001: covered by bunker-auth-flow (full lifecycle)
- AC-002: covered by bunker-auth-flow
- AC-003: covered by group-creation
- AC-004: covered by task-creation
- AC-007: covered by session-restore
- AC-008: covered by disconnect-flow

---

## Coverage Matrix

| Spec Requirement | Acceptance Criteria |
|------------------|---------------------|
| `make e2e` runs end-to-end without manual intervention | AC-001, AC-011, AC-012 |
| Playwright authenticates via bunker:// URL; pubkey chip visible | AC-002 |
| MLS group can be created; name appears in sidebar | AC-003 |
| Task can be created; appears in "To Do" column | AC-004 |
| `docker-compose.e2e.yml` relay starts/stops with no persistent state | AC-005 |
| `playwright.config.ts` has correct baseURL, testDir, globalSetup | AC-006 |
| Session restore after page reload | AC-007 |
| Disconnect clears session | AC-008 |
| Bunker fixture starts and logs ready | AC-009 |
| NDK headless fixture provides connected NDK instance | AC-010 |
