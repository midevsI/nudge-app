"use client";

import React from "react";

export default function TopLevelLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    try {
      if (typeof window !== "undefined" && window.top && window.top !== window) {
        // Navigate the top-level window to exit any iframe
        window.top.location.href = href;
      } else if (typeof window !== "undefined") {
        window.location.href = href;
      }
    } catch (_) {
      if (typeof window !== "undefined") window.location.href = href;
    }
  }

  return (
    // Provide a normal href for fallback and SEO; onClick forces top navigation
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
