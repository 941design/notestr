/**
 * Headless NDK Playwright fixture.
 *
 * Provides a connected NDK instance using a second deterministic test keypair.
 * Used in E2E tests to subscribe to relay events and verify published data
 * without going through the browser UI.
 */

import { test as base } from '@playwright/test';
import NDK, { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

// Second deterministic test keypair (distinct from the bunker keypair)
// Hex-encoded private key — NDKPrivateKeySigner accepts hex strings directly.
const NDK_CLIENT_PRIVATE_KEY = '3ad635dc380ed603e85842e163bb6a0f6af83110cf61c78785fab7bce173c105';

const RELAY_URL = 'ws://localhost:7777';

export type NdkClientFixtures = {
  ndkClient: NDK;
};

export const test = base.extend<NdkClientFixtures>({
  ndkClient: async ({}, use) => {
    const signer = new NDKPrivateKeySigner(NDK_CLIENT_PRIVATE_KEY);
    const ndk = new NDK({
      explicitRelayUrls: [RELAY_URL],
      signer,
    });
    await ndk.connect(3000);
    await use(ndk);
    // NDK doesn't expose a clean disconnect — just drop the reference
  },
});

export { expect } from '@playwright/test';
