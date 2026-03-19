import React, { useEffect, useRef, useState } from "react";
import { canUseCameraQrScanner, normaliseNpubPayload } from "@/lib/qr";

interface NpubQrScannerProps {
  onScan: (npub: string) => void;
}

export function NpubQrScanner({ onScan }: NpubQrScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<{
    stop: () => void;
    destroy: () => void;
  } | null>(null);
  const handledRef = useRef(false);
  const [starting, setStarting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canUseCameraQrScanner()) {
      setStarting(false);
      setError("Camera not available. Requires a secure context (HTTPS).");
      return;
    }

    let mounted = true;

    async function startScanner() {
      try {
        const { default: QrScanner } = await import("qr-scanner");
        const video = videoRef.current;

        if (!video || !mounted) return;

        const hasCamera = await QrScanner.hasCamera();
        if (!hasCamera) {
          setError("No camera found on this device.");
          setStarting(false);
          return;
        }

        const scanner = new QrScanner(
          video,
          (result: { data: string }) => {
            if (handledRef.current) return;

            const npub = normaliseNpubPayload(result.data);
            if (!npub) {
              setError("QR code does not contain a valid npub.");
              return;
            }

            handledRef.current = true;
            scanner.stop();
            onScan(npub);
          },
          {
            onDecodeError: () => {},
            preferredCamera: "environment",
            highlightScanRegion: true,
            returnDetailedScanResult: true,
            maxScansPerSecond: 8,
          },
        );

        scannerRef.current = scanner;
        await scanner.start();

        if (!mounted) {
          scanner.stop();
          scanner.destroy();
          return;
        }

        setStarting(false);
      } catch (err) {
        const message =
          err instanceof Error ? err.message.toLowerCase() : "";
        const denied =
          message.includes("denied") ||
          message.includes("permission") ||
          message.includes("notallowed");
        setError(
          denied
            ? "Camera permission denied. Please allow camera access."
            : "Camera not available.",
        );
        setStarting(false);
      }
    }

    void startScanner();

    return () => {
      mounted = false;
      handledRef.current = false;
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, [onScan]);

  return (
    <div className="space-y-3">
      {error && (
        <p
          className="text-sm text-destructive"
          data-testid="npub-qr-scan-error"
        >
          {error}
        </p>
      )}

      <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-lg bg-black">
        <video
          ref={videoRef}
          muted
          playsInline
          className="size-full object-cover"
          data-testid="npub-qr-video"
        />
        {starting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 text-white">
            <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span className="text-sm">Starting camera...</span>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Point your camera at an npub QR code.
      </p>
    </div>
  );
}
