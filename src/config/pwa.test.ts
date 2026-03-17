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

  it("sets scope from NEXT_PUBLIC_BASE_PATH", () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/notestr";
    const config = getPwaConfig("production");
    expect(config.scope).toBe("/notestr/");
    delete process.env.NEXT_PUBLIC_BASE_PATH;
  });

  it("sets scope to / when NEXT_PUBLIC_BASE_PATH is unset", () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    const config = getPwaConfig("development");
    expect(config.scope).toBe("/");
  });
});
