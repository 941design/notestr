import { describe, it, expect } from "vitest";
import { getPwaConfig } from "./pwa";

describe("getPwaConfig", () => {
  it("disables PWA in development to avoid broken SWC helpers in sw.js", () => {
    const config = getPwaConfig("development");
    expect(config.disable).toBe(true);
  });

  it("enables PWA in production", () => {
    const config = getPwaConfig("production");
    expect(config.disable).toBeFalsy();
  });

  it("sets dest to public", () => {
    const config = getPwaConfig("production");
    expect(config.dest).toBe("public");
  });

  it("sets scope with basePath in production", () => {
    const config = getPwaConfig("production");
    expect(config.scope).toBe("/notestr/");
  });

  it("sets scope to / in development", () => {
    const config = getPwaConfig("development");
    expect(config.scope).toBe("/");
  });
});
