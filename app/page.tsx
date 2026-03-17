"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getNip07Signer,
  connectBunker,
  restoreNip46Session,
  clearNip46Session,
  hasNip46Session,
  startNostrConnect,
} from "../src/lib/nostr";
import { QRCodeSVG } from "qrcode.react";
import { MarmotProvider } from "../src/marmot/client";
import { TaskStoreProvider } from "../src/store/task-store";
import { ConnectionStatus } from "../src/components/ConnectionStatus";
import { ThemeToggle } from "../src/components/ThemeToggle";
import { GroupManager } from "../src/components/GroupManager";
import { Board } from "../src/components/Board";
import type { EventSigner } from "applesauce-core";
import { DEFAULT_RELAYS, NOSTRCONNECT_RELAY } from "../src/config/relays";

type AuthMethod = "nip07" | "nip46" | null;
type LoginTab = "amber" | "bunker";

export default function Page() {
  const [signer, setSigner] = useState<EventSigner | null>(null);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [signerChecked, setSignerChecked] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);

  // Login tab
  const [loginTab, setLoginTab] = useState<LoginTab>("amber");

  // Bunker login state
  const [bunkerUrl, setBunkerUrl] = useState("");
  const [bunkerConnecting, setBunkerConnecting] = useState(false);
  const [bunkerError, setBunkerError] = useState<string | null>(null);

  // Nostrconnect (Amber) state
  const [nostrConnectUri, setNostrConnectUri] = useState<string | null>(null);
  const [nostrConnectCancel, setNostrConnectCancel] = useState<
    (() => void) | null
  >(null);
  const [nostrConnectError, setNostrConnectError] = useState<string | null>(
    null,
  );

  // On mount: try restoring NIP-46 session, then check NIP-07
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Try NIP-46 restore first
      if (hasNip46Session()) {
        try {
          const conn = await restoreNip46Session(DEFAULT_RELAYS);
          if (conn && !cancelled) {
            setSigner(conn.signer);
            setPubkey(conn.pubkey);
            setAuthMethod("nip46");
            setSignerChecked(true);
            return;
          }
        } catch {
          // fall through to NIP-07
        }
      }

      // Check NIP-07 after a short delay for extension injection
      await new Promise((r) => setTimeout(r, 300));
      if (!cancelled) {
        const s = getNip07Signer();
        if (s) setSigner(s);
        setSignerChecked(true);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleNip07Connect = useCallback(async () => {
    const s = getNip07Signer();
    if (!s) return;
    setSigner(s);
    setAuthMethod("nip07");
    try {
      const pk = await s.getPublicKey();
      setPubkey(pk);
    } catch (err) {
      console.error("Failed to get public key:", err);
    }
  }, []);

  const handleBunkerConnect = useCallback(async () => {
    if (!bunkerUrl.trim()) return;
    setBunkerConnecting(true);
    setBunkerError(null);
    try {
      const conn = await connectBunker(bunkerUrl.trim(), DEFAULT_RELAYS);
      setSigner(conn.signer);
      setPubkey(conn.pubkey);
      setAuthMethod("nip46");
      setBunkerUrl("");
    } catch (err) {
      setBunkerError(
        err instanceof Error ? err.message : "Failed to connect to bunker",
      );
    } finally {
      setBunkerConnecting(false);
    }
  }, [bunkerUrl]);

  const handleNostrConnect = useCallback(() => {
    setNostrConnectError(null);
    const { uri, connection, cancel } = startNostrConnect(
      NOSTRCONNECT_RELAY,
      [...DEFAULT_RELAYS, NOSTRCONNECT_RELAY],
    );
    setNostrConnectUri(uri);
    setNostrConnectCancel(() => cancel);

    connection
      .then((conn) => {
        setSigner(conn.signer);
        setPubkey(conn.pubkey);
        setAuthMethod("nip46");
        setNostrConnectUri(null);
        setNostrConnectCancel(null);
      })
      .catch((err) => {
        if (err instanceof Error && err.message === "Cancelled") return;
        setNostrConnectError(
          err instanceof Error ? err.message : "Connection failed",
        );
        setNostrConnectUri(null);
        setNostrConnectCancel(null);
      });
  }, []);

  const handleNostrConnectCancel = useCallback(() => {
    nostrConnectCancel?.();
    setNostrConnectUri(null);
    setNostrConnectCancel(null);
    setNostrConnectError(null);
  }, [nostrConnectCancel]);

  const handleDisconnect = useCallback(() => {
    if (authMethod === "nip46") {
      clearNip46Session();
    }
    setSigner(null);
    setPubkey(null);
    setAuthMethod(null);
    setSelectedGroupId(null);
  }, [authMethod]);

  // Not yet connected: show connect screen
  if (!pubkey) {
    return (
      <div className="app">
        <header className="topbar">
          <h1 className="app-title">notestr</h1>
          <ThemeToggle />
        </header>
        <main className="main-area">
          <div className="placeholder">
            {!signerChecked ? (
              <p>Connecting...</p>
            ) : (
              <div className="login-options">
                <h2>Sign in to notestr</h2>
                <p className="login-subtitle">
                  Choose how to connect your Nostr identity
                </p>

                {/* NIP-07 option */}
                <div className="login-section">
                  <h3 className="login-section-title">Browser Extension</h3>
                  {signer ? (
                    <button
                      className="btn btn-primary login-btn"
                      onClick={handleNip07Connect}
                    >
                      Connect with NIP-07
                    </button>
                  ) : (
                    <p className="text-muted">
                      No NIP-07 extension detected (nos2x, Alby, etc.)
                    </p>
                  )}
                </div>

                {/* NIP-46 remote signer options */}
                <div className="login-section">
                  <h3 className="login-section-title">Remote Signer</h3>

                  <div className="login-tabs">
                    <button
                      className={`login-tab ${loginTab === "amber" ? "active" : ""}`}
                      onClick={() => setLoginTab("amber")}
                    >
                      Amber / QR Code
                    </button>
                    <button
                      className={`login-tab ${loginTab === "bunker" ? "active" : ""}`}
                      onClick={() => setLoginTab("bunker")}
                    >
                      Paste bunker:// URL
                    </button>
                  </div>

                  {loginTab === "amber" && (
                    <div className="login-tab-content">
                      {!nostrConnectUri ? (
                        <>
                          <p className="text-muted login-hint">
                            Scan a QR code with Amber or another NIP-46 signer
                          </p>
                          <button
                            className="btn btn-primary login-btn"
                            onClick={handleNostrConnect}
                          >
                            Show QR Code
                          </button>
                          {nostrConnectError && (
                            <p className="error-text">{nostrConnectError}</p>
                          )}
                        </>
                      ) : (
                        <div className="nostrconnect-qr">
                          <QRCodeSVG
                            value={nostrConnectUri}
                            size={200}
                            bgColor="transparent"
                            fgColor="currentColor"
                          />
                          {/Android/i.test(
                            typeof navigator !== "undefined"
                              ? navigator.userAgent
                              : "",
                          ) && (
                            <a
                              href={nostrConnectUri}
                              className="btn btn-primary login-btn"
                            >
                              Open in Amber
                            </a>
                          )}
                          <p className="text-muted nostrconnect-waiting">
                            Waiting for signer to connect...
                          </p>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={handleNostrConnectCancel}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {loginTab === "bunker" && (
                    <div className="login-tab-content">
                      <p className="text-muted login-hint">
                        Paste a bunker:// URL from nsec.app or another NIP-46
                        signer
                      </p>
                      <div className="bunker-form">
                        <input
                          className="input"
                          type="text"
                          placeholder="bunker://..."
                          value={bunkerUrl}
                          onChange={(e) => setBunkerUrl(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleBunkerConnect()
                          }
                          disabled={bunkerConnecting}
                        />
                        <button
                          className="btn btn-primary"
                          onClick={handleBunkerConnect}
                          disabled={bunkerConnecting || !bunkerUrl.trim()}
                        >
                          {bunkerConnecting ? "Connecting..." : "Connect"}
                        </button>
                      </div>
                      {bunkerError && (
                        <p className="error-text">{bunkerError}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Connected: wrap in MarmotProvider
  return (
    <MarmotProvider signer={signer!} pubkey={pubkey}>
      <div className="app">
        <header className="topbar">
          <h1 className="app-title">notestr</h1>
          <div className="topbar-actions">
            <ThemeToggle />
            <ConnectionStatus
            pubkey={pubkey}
            authMethod={authMethod}
            onDisconnect={handleDisconnect}
          />
          </div>
        </header>
        <div className="app-body">
          <aside className="sidebar">
            <GroupManager
              onGroupSelect={setSelectedGroupId}
              selectedGroupId={selectedGroupId}
            />
          </aside>
          <main className="main-area">
            {selectedGroupId ? (
              <TaskStoreProvider groupId={selectedGroupId}>
                <Board currentUserPubkey={pubkey} />
              </TaskStoreProvider>
            ) : (
              <div className="placeholder">
                <h2>Select a Group</h2>
                <p>
                  Pick a group from the sidebar or create a new one to start
                  managing tasks.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </MarmotProvider>
  );
}
