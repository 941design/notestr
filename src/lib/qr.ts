import { npubToHex } from "@/lib/nostr";

export function normaliseNpubPayload(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const stripped = trimmed.toLowerCase().startsWith("nostr:")
    ? trimmed.slice("nostr:".length).trim()
    : trimmed;

  try {
    return npubToHex(stripped) ? stripped : null;
  } catch {
    return null;
  }
}

export function canUseCameraQrScanner(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined")
    return false;
  return Boolean(
    window.isSecureContext && navigator.mediaDevices?.getUserMedia,
  );
}
