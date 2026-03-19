import React, { useState } from "react";
import { LogOut, QrCode } from "lucide-react";
import { shortenPubkey, hexToNpub } from "@/lib/nostr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMarmot } from "@/marmot/client";
import { NpubQrModal } from "@/components/NpubQrModal";

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
  const { discoverable } = useMarmot();
  const [showQr, setShowQr] = useState(false);

  if (!pubkey) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="size-2 shrink-0 rounded-full bg-destructive shadow-[0_0_6px] shadow-destructive" />
        <span className="font-mono text-muted-foreground">Not connected</span>
      </div>
    );
  }

  const npub = hexToNpub(pubkey);
  const label = authMethod === "nip46" ? "bunker" : "NIP-07";
  const dotColor = discoverable ? "bg-success shadow-success" : "bg-warning shadow-warning";
  const dotTitle = discoverable
    ? "Discoverable — others can invite you to groups"
    : "Not discoverable — no published key package available for invites";

  return (
    <div className="flex items-center gap-2 text-sm" data-testid="pubkey-chip">
      <span
        className={`size-2 shrink-0 rounded-full shadow-[0_0_6px] ${dotColor}`}
        title={dotTitle}
      />
      <span
        className="font-mono text-muted-foreground"
        title={npub}
      >
        {shortenPubkey(pubkey)}
      </span>
      <Badge variant="secondary" className="text-xs uppercase tracking-wide">
        {label}
      </Badge>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setShowQr(true)}
        aria-label="Show QR code"
        data-testid="show-own-npub-qr-btn"
      >
        <QrCode className="size-3.5" />
      </Button>
      <Button variant="outline" size="sm" onClick={onDisconnect} data-testid="disconnect-button">
        <LogOut className="size-3.5" />
        Disconnect
      </Button>

      <NpubQrModal
        isOpen={showQr}
        onClose={() => setShowQr(false)}
        title="Your npub"
        mode="display"
        npub={npub}
      />
    </div>
  );
}
