/**
 * Central relay configuration — single source of truth.
 *
 * Override at build time with NEXT_PUBLIC_ env vars (comma-separated):
 *   NEXT_PUBLIC_RELAYS="wss://relay.damus.io,wss://nos.lol"
 *   NEXT_PUBLIC_NOSTRCONNECT_RELAY="wss://relay.damus.io"
 *
 * Defaults: localhost in development, public relays in production.
 */

const PRODUCTION_RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.nostr.band",
];

const DEV_RELAYS = ["ws://localhost:7777"];

const isProduction = process.env.NODE_ENV === "production";

function parseRelays(envVar: string | undefined, fallback: string[]): string[] {
  if (!envVar) return fallback;
  return envVar.split(",").map((r) => r.trim()).filter(Boolean);
}

export const DEFAULT_RELAYS: string[] = parseRelays(
  process.env.NEXT_PUBLIC_RELAYS,
  isProduction ? PRODUCTION_RELAYS : DEV_RELAYS,
);

export const NOSTRCONNECT_RELAY: string =
  process.env.NEXT_PUBLIC_NOSTRCONNECT_RELAY || "wss://relay.damus.io";
