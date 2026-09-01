"use client";

import { useEffect, useState } from "react";

export default function LaunchSplash() {
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const expandTimer = window.setTimeout(() => setExpanded(true), 120);
    const hideTimer = window.setTimeout(() => setVisible(false), 1450);
    return () => {
      window.clearTimeout(expandTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="launch-splash" aria-hidden="true">
      <div className={`launch-splash-inner ${expanded ? "is-expanded" : ""}`}>
        <img src="/icon.svg" alt="" className="launch-splash-logo" />
        <div className="launch-splash-copy">
          <div className="launch-splash-title">ADV <span>SIMPLES</span></div>
          <div className="launch-splash-subtitle">Seu escritório sob controle</div>
          <div className="launch-splash-line" />
        </div>
      </div>
    </div>
  );
}
