"use client";

import { useEffect, useRef } from "react";

/**
 * Tracks how long a portfolio page was open and the deepest scroll
 * percentage reached. Sends a single beacon on unload/blur using
 * navigator.sendBeacon so it survives the page navigating away.
 */
export function DwellBeacon({
  viewId,
  portfolioId,
}: {
  viewId: string;
  portfolioId: string;
}) {
  const startedAt = useRef<number>(Date.now());
  const maxScrollPct = useRef<number>(0);
  const sent = useRef<boolean>(false);

  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.min(100, Math.round((window.scrollY / docHeight) * 100));
      if (pct > maxScrollPct.current) maxScrollPct.current = pct;
    };

    const send = () => {
      if (sent.current) return;
      sent.current = true;
      const dwellMs = Date.now() - startedAt.current;
      const payload = JSON.stringify({
        viewId,
        dwellMs,
        scrollPct: maxScrollPct.current,
      });
      const url = `/api/portfolios/${portfolioId}/track`;
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
      } else {
        fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", send);
    window.addEventListener("beforeunload", send);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") send();
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", send);
      window.removeEventListener("beforeunload", send);
      send();
    };
  }, [viewId, portfolioId]);

  return null;
}
