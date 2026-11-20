"use client";

import { useEffect } from "react";
import { announceMaquetteOpen } from "@/lib/maquette-channel";
import type { DaId } from "@/lib/types";

interface MaquetteChromeProps {
  slug: string;
  da: DaId;
  businessName: string;
  /** Inside the app (iframe preview): no banner, and the visit is not counted as an open */
  embed: boolean;
}

/**
 * What Pignon adds around a mockup opened by its public link: the "unofficial demo" banner
 * (a mockup must never pass for the shop's real site) and the ping that raises the open alert in the app.
 */
export function MaquetteChrome({ slug, da, businessName, embed }: MaquetteChromeProps) {
  useEffect(() => {
    if (!embed) announceMaquetteOpen(slug, da);
  }, [slug, da, embed]);

  if (embed) return null;

  return (
    <>
      <div aria-hidden="true" style={{ height: 44 }} />
      <aside
        style={{
          position: "fixed",
          insetInline: 0,
          bottom: 0,
          zIndex: 2147483000,
          minHeight: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "8px 16px",
          background: "#0f1b3d",
          color: "#f3f5fb",
          font: "500 13px/1.35 system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style={{ flexShrink: 0 }}>
          <path
            fill="#ffc94d"
            d="M10.86 2.9a1.8 1.8 0 0 1 2.28 0l7.2 5.9c.42.34.66.85.66 1.39V19.4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9.21c0-.54.24-1.05.66-1.39l7.2-5.9Z"
          />
          <rect x="9" y="11.6" width="6" height="6" rx="1.3" fill="#0f1b3d" />
        </svg>
        <span>
          Maquette de démonstration préparée pour {businessName}. Ce n&apos;est pas son site officiel.
        </span>
      </aside>
    </>
  );
}
