"use client";

import { useState } from "react";

export default function TeamLinkButton() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/team-token");
      if (!res.ok) return;
      const { teamToken } = await res.json();
      const base = typeof window !== "undefined" ? window.location.origin : "";
      const link = `${base}/team/${teamToken}`;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs font-medium text-white/70 hover:text-white border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? "…" : copied ? "Copied!" : "Copy team link"}
    </button>
  );
}
