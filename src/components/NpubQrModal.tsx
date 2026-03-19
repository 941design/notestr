import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NpubQrScanner } from "@/components/NpubQrScanner";

interface NpubQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mode: "display" | "scan";
  npub?: string;
  onScan?: (npub: string) => void;
}

export function NpubQrModal({
  isOpen,
  onClose,
  title,
  mode,
  npub,
  onScan,
}: NpubQrModalProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!npub) return;
    navigator.clipboard.writeText(npub).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent data-testid={`npub-qr-modal-${mode}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === "display"
              ? "Scan this QR code to get the npub."
              : "Scan an npub QR code with your camera."}
          </DialogDescription>
        </DialogHeader>

        {mode === "display" && npub ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center rounded-lg border bg-white p-4">
              <QRCodeSVG
                value={npub}
                size={256}
                level="M"
                data-testid="npub-qr-image"
              />
            </div>

            <div className="flex items-center gap-2">
              <code
                className="flex-1 break-all rounded-md bg-muted p-2 text-xs"
                data-testid="npub-qr-modal-value"
              >
                {npub}
              </code>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handleCopy}
                aria-label="Copy npub"
              >
                {copied ? (
                  <Check className="size-3.5" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
        ) : mode === "scan" ? (
          <NpubQrScanner
            onScan={(value) => {
              onScan?.(value);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
