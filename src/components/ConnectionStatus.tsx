import React from "react";
import { shortenPubkey, hexToNpub } from "../lib/nostr";

interface ConnectionStatusProps {
  pubkey: string | null;
  authMethod: "nip07" | "nip46" | null;
  onDisconnect: () => void;
}

export function ConnectionStatus({
  pubkey,
  authMethod,
  onDisconnect,
}: ConnectionStatusProps) {
  if (!pubkey) {
    return (
      <div className="connection-status disconnected">
        <span className="status-dot red" />
        <span className="status-text">Not connected</span>
      </div>
    );
  }

  const label = authMethod === "nip46" ? "bunker" : "NIP-07";

  return (
    <div className="connection-status connected">
      <span className="status-dot green" />
      <span className="status-text" title={hexToNpub(pubkey)}>
        {shortenPubkey(pubkey)}
      </span>
      <span className="auth-badge">{label}</span>
      <button className="btn btn-outline btn-sm" onClick={onDisconnect}>
        Disconnect
      </button>
    </div>
  );
}
