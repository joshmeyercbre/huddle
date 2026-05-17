"use client";

import { useState } from "react";

export default function CopyButtonClient({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-cbre-mint hover:text-cbre-green transition-colors"
    >
      {copied ? "Copied!" : "Copy Link"}
    </button>
  );
}
