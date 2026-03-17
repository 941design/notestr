import { describe, expect, it } from "vitest";
import { DEFAULT_RELAYS, NDK_CONNECT_TIMEOUT_MS } from "./relays";

describe("relay config", () => {
  it("uses a positive NDK connect timeout", () => {
    expect(NDK_CONNECT_TIMEOUT_MS).toBeGreaterThan(0);
  });

  it("does not include duplicate default relays", () => {
    expect(new Set(DEFAULT_RELAYS).size).toBe(DEFAULT_RELAYS.length);
  });
});
