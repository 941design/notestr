/**
 * Central relay configuration — single source of truth.
 *
 * Override at build time with NEXT_PUBLIC_ env vars (comma-separated):
 *   NEXT_PUBLIC_RELAYS="wss://nos.lol,wss://relay.primal.net"
 *   NEXT_PUBLIC_NOSTRCONNECT_RELAY="wss://relay.primal.net"
 *
 * Defaults: localhost in development, public relays in production.
 */

const PRODUCTION_RELAYS = [
  "wss://nos.lol",
  "wss://relay.primal.net",
  "wss://purplepag.es",
  "wss://offchain.pub",
];

const DEV_RELAYS = ["ws://localhost:7777"];
export const NDK_CONNECT_TIMEOUT_MS = 4_000;

const isProduction = process.env.NODE_ENV === "production";

function parseRelays(envVar: string | undefined, fallback: string[]): string[] {
  const source = envVar
    ? envVar.split(",").map((relay) => relay.trim())
    : fallback;

  return Array.from(new Set(source.filter(Boolean)));
}

export const DEFAULT_RELAYS: string[] = parseRelays(
  process.env.NEXT_PUBLIC_RELAYS,
  isProduction ? PRODUCTION_RELAYS : DEV_RELAYS,
);

export const NOSTRCONNECT_RELAY: string =
  process.env.NEXT_PUBLIC_NOSTRCONNECT_RELAY || "wss://relay.primal.net";
