/**
 * AuthSuccess.jsx
 *
 * This page is loaded in the NEW TAB that monday.com opens for the OAuth flow.
 * After the backend handles the OAuth callback it redirects here.
 *
 * What we do here:
 *  1. Broadcast an "oauth_complete" message over BroadcastChannel so that the
 *     WizClone iframe (same origin, different browsing context) can react immediately.
 *  2. Close this tab automatically.
 *
 * BroadcastChannel is supported in all modern browsers and works between any
 * same-origin contexts — including cross-tab → iframe communication.
 */
import { useEffect } from "react";

export default function AuthSuccess() {
  useEffect(() => {
    try {
      const channel = new BroadcastChannel("wc_oauth");
      channel.postMessage({ type: "oauth_complete" });
      channel.close();
    } catch (e) {
      // BroadcastChannel not supported — polling in Onboard.jsx will catch it
      console.warn("BroadcastChannel not available:", e);
    }

    // Close this tab. Works when the tab was opened programmatically
    // (i.e. via monday.execute("openLinkInTab")).
    // setTimeout gives the channel message time to dispatch before the page unloads.
    setTimeout(() => {
      window.close();
    }, 200);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#fff",
        gap: 12,
      }}
    >
      <p style={{ fontSize: 16, color: "#333", margin: 0 }}>
        ✅ Authorization successful!
      </p>
      <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
        You can close this tab and return to WizClone.
      </p>
    </div>
  );
}
