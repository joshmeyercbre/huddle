"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Retro, RetroItem, Priority } from "@/types";
import { getFormat } from "@/lib/retro-formats";

const POLL_INTERVAL = 8000;

const PRIORITY_CYCLE: (Priority | undefined)[] = [undefined, "high", "medium", "low"];
const PRIORITY_STYLE: Record<Priority, { label: string; classes: string }> = {
  high:   { label: "High", classes: "bg-rose-100 text-rose-700 border-rose-200" },
  medium: { label: "Med",  classes: "bg-amber-100 text-amber-700 border-amber-200" },
  low:    { label: "Low",  classes: "bg-blue-100 text-blue-600 border-blue-200" },
};
const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

const STORAGE_KEY    = "retro_author_name";
const VOTES_KEY_PREFIX = "retro_votes_";
const TIMER_PRESETS  = [5, 10, 15, 20];

function fmtTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Deterministic positions/timings seeded by index to avoid hydration mismatch
const CONFETTI_TOPS = [12, 28, 5, 35, 18, 40, 8, 25];
const CONFETTI_DURATIONS = [0.5, 0.6, 0.55, 0.7, 0.52, 0.65, 0.58, 0.62];

function ConfettiBurst() {
  const pieces = ["🟩", "🟦", "🟨", "⬜"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i} className="absolute text-[8px]" style={{
          left: `${10 + i * 11}%`,
          top: `${CONFETTI_TOPS[i]}%`,
          animation: `confetti-fall ${CONFETTI_DURATIONS[i]}s ease-out ${i * 0.05}s forwards`,
        }}>
          {pieces[i % pieces.length]}
        </span>
      ))}
    </div>
  );
}

// ── Timer badge ───────────────────────────────────────────────────────────────

interface TimerProps {
  timerEndsAt: string | null;
  timerDurationMs: number | null;
  now: number;
  onStart: (minutes: number) => void;
  onReset: () => void;
}

function TimerBadge({ timerEndsAt, timerDurationMs, now, onStart, onReset }: TimerProps) {
  const remaining   = timerEndsAt ? new Date(timerEndsAt).getTime() - now : null;
  const isExpired   = remaining !== null && remaining <= 0;
  const isUrgent    = remaining !== null && remaining > 0 && remaining < 60_000;
  const isWarning   = remaining !== null && remaining > 0 && remaining < 180_000;
  const progressPct = (remaining !== null && timerDurationMs && !isExpired)
    ? Math.max(0, (remaining / timerDurationMs) * 100) : 0;

  if (!timerEndsAt) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400 shrink-0">⏱</span>
        {TIMER_PRESETS.map((m) => (
          <button key={m} onClick={() => onStart(m)}
            className="text-xs px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 hover:border-cbre-mint hover:text-cbre-green hover:bg-cbre-mint-light transition-all">
            {m}m
          </button>
        ))}
      </div>
    );
  }

  const badgeBase = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold tabular-nums border transition-all";
  const badgeStyle = isExpired
    ? `${badgeBase} bg-rose-100 border-rose-300 text-rose-600 animate-pulse`
    : isUrgent
    ? `${badgeBase} bg-rose-50 border-rose-200 text-rose-600 animate-pulse`
    : isWarning
    ? `${badgeBase} bg-amber-50 border-amber-200 text-amber-700`
    : `${badgeBase} bg-cbre-mint-light border-cbre-mint text-cbre-green`;

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center gap-0.5">
        <span className={badgeStyle}>
          ⏱ {isExpired ? "Time's up!" : fmtTime(remaining!)}
        </span>
        {!isExpired && timerDurationMs && (
          <div className="w-full h-0.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${isUrgent ? "bg-rose-500" : isWarning ? "bg-amber-400" : "bg-cbre-green"}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>
      <button onClick={onReset} className="text-gray-300 hover:text-gray-500 transition-colors text-sm leading-none" title="Reset timer">✕</button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  retro: Retro;
  initialItems: RetroItem[];
}

export default function RetroBoard({ retro, initialItems }: Props) {
  const format = getFormat(retro.format);

  const [items, setItems]       = useState<RetroItem[]>(initialItems);
  const [newIds, setNewIds]     = useState<Set<string>>(new Set());
  const [burstIds, setBurstIds] = useState<Set<string>>(new Set());
  const [votingId, setVotingId] = useState<string | null>(null);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [drafts, setDrafts]     = useState<Record<string, string>>(
    () => Object.fromEntries(format.columns.map((c) => [c.key, ""]))
  );
  const [submitting, setSubmitting] = useState<string | null>(null);

  const [authorName, setAuthorName] = useState("");
  const [nameInput, setNameInput]   = useState("");
  const [nameSet, setNameSet]       = useState(false);

  const [timerEndsAt, setTimerEndsAt]       = useState<string | null>(retro.timerEndsAt ?? null);
  const [timerDurationMs, setTimerDurationMs] = useState<number | null>(retro.timerDurationMs ?? null);
  const [now, setNow] = useState(() => Date.now());

  const mutating = useRef(false);
  const votesKey = `${VOTES_KEY_PREFIX}${retro.id}`;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { setAuthorName(saved); setNameInput(saved); setNameSet(true); }
    const savedVotes = localStorage.getItem(votesKey);
    if (savedVotes) { try { setVotedIds(new Set(JSON.parse(savedVotes))); } catch {} }
  }, [votesKey]);

  // second ticker for countdown
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // poll: items + timer state
  const poll = useCallback(async () => {
    if (mutating.current || document.hidden) return;
    try {
      const res = await fetch(`/api/board/${retro.token}`);
      if (!res.ok) return;
      const data: { items: RetroItem[]; timerEndsAt: string | null; timerDurationMs: number | null } = await res.json();
      setItems(data.items.sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      setTimerEndsAt(data.timerEndsAt);
      setTimerDurationMs(data.timerDurationMs);
    } catch {}
  }, [retro.token]);

  useEffect(() => {
    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [poll]);

  // ── timer controls ──────────────────────────────────────────────────────
  async function startTimer(minutes: number) {
    const durationMs = minutes * 60 * 1000;
    const endsAt     = new Date(Date.now() + durationMs).toISOString();
    mutating.current = true;
    try {
      const res = await fetch(`/api/board/${retro.token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timerEndsAt: endsAt, timerDurationMs: durationMs }),
      });
      if (res.ok) { setTimerEndsAt(endsAt); setTimerDurationMs(durationMs); }
    } finally { mutating.current = false; }
  }

  async function resetTimer() {
    mutating.current = true;
    try {
      const res = await fetch(`/api/board/${retro.token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timerEndsAt: null, timerDurationMs: null }),
      });
      if (res.ok) { setTimerEndsAt(null); setTimerDurationMs(null); }
    } finally { mutating.current = false; }
  }

  // ── item mutations ──────────────────────────────────────────────────────
  function saveName() {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    localStorage.setItem(STORAGE_KEY, trimmed);
    setAuthorName(trimmed);
    setNameSet(true);
  }

  async function addItem(category: string) {
    const text = drafts[category].trim();
    if (!text || !authorName) return;
    setSubmitting(category);
    mutating.current = true;
    try {
      const res = await fetch("/api/retro-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retroId: retro.id, category, text, authorName }),
      });
      if (res.ok) {
        const item: RetroItem = await res.json();
        setItems((prev) => [...prev, item]);
        setNewIds((prev) => new Set(prev).add(item.id));
        setTimeout(() => setNewIds((prev) => { const n = new Set(prev); n.delete(item.id); return n; }), 600);
        setDrafts((prev) => ({ ...prev, [category]: "" }));
      }
    } finally { setSubmitting(null); mutating.current = false; }
  }

  async function vote(itemId: string, delta: 1 | -1) {
    if (delta === 1 && votedIds.has(itemId)) return;
    if (delta === -1 && !votedIds.has(itemId)) return;
    setVotingId(itemId);
    setTimeout(() => setVotingId(null), 400);
    mutating.current = true;
    try {
      const res = await fetch(`/api/retro-items/${itemId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });
      if (res.ok) {
        const updated: RetroItem = await res.json();
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        setVotedIds((prev) => {
          const next = new Set(prev);
          if (delta === 1) next.add(itemId); else next.delete(itemId);
          localStorage.setItem(votesKey, JSON.stringify(Array.from(next)));
          return next;
        });
      }
    } finally { mutating.current = false; }
  }

  async function toggleAction(item: RetroItem) {
    const marking = !item.isAction;
    mutating.current = true;
    try {
      const res = await fetch(`/api/retro-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAction: marking }),
      });
      if (res.ok) {
        const updated: RetroItem = await res.json();
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        if (marking) {
          setBurstIds((prev) => new Set(prev).add(item.id));
          setTimeout(() => setBurstIds((prev) => { const n = new Set(prev); n.delete(item.id); return n; }), 800);
        }
      }
    } finally { mutating.current = false; }
  }

  async function toggleCompleted(item: RetroItem) {
    mutating.current = true;
    try {
      const res = await fetch(`/api/retro-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedAction: !item.completedAction }),
      });
      if (res.ok) {
        const updated: RetroItem = await res.json();
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      }
    } finally { mutating.current = false; }
  }

  async function setActionPriority(item: RetroItem, priority: Priority | undefined) {
    mutating.current = true;
    try {
      const res = await fetch(`/api/retro-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: priority ?? null }),
      });
      if (res.ok) setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, priority } : i)));
    } finally { mutating.current = false; }
  }

  const rawActions  = items.filter((i) => i.isAction);
  const actionItems = [...rawActions].sort((a, b) =>
    (a.priority !== undefined ? PRIORITY_ORDER[a.priority] : 99) -
    (b.priority !== undefined ? PRIORITY_ORDER[b.priority] : 99)
  );
  const showActions = actionItems.length > 0;

  // ── name gate ───────────────────────────────────────────────────────────
  if (!nameSet) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 w-full max-w-sm text-center animate-fade-up">
          <div className="w-12 h-12 bg-cbre-mint-light rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👋</span>
          </div>
          <h2 className="text-lg font-semibold text-cbre-green mb-1">Welcome to the Retro</h2>
          <p className="text-sm text-gray-500 mb-6">What should we call you?</p>
          <input
            type="text"
            placeholder="Your name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-cbre-mint"
            autoFocus
          />
          <button
            onClick={saveName}
            disabled={!nameInput.trim()}
            className="w-full bg-cbre-green text-white text-sm font-medium py-2 rounded-lg hover:bg-cbre-mint hover:text-cbre-green transition-colors disabled:opacity-50"
          >
            Join Retro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* identity + timer bar */}
      <div className="flex items-center justify-between gap-4 animate-fade-up">
        <p className="text-sm text-gray-500 shrink-0">
          Posting as <span className="font-medium text-cbre-green">{authorName}</span>
          <button onClick={() => setNameSet(false)} className="ml-2 text-xs text-gray-400 underline hover:text-gray-600">change</button>
        </p>
        <TimerBadge
          timerEndsAt={timerEndsAt}
          timerDurationMs={timerDurationMs}
          now={now}
          onStart={startTimer}
          onReset={resetTimer}
        />
        <p className="text-xs text-gray-400 shrink-0">{items.length} item{items.length !== 1 ? "s" : ""}</p>
      </div>

      {/* columns — fixed height, scroll within */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {format.columns.map(({ key, label, color, dot }, colIdx) => {
          const colItems = items.filter((i) => i.category === key).sort((a, b) => b.votes - a.votes);
          return (
            <div key={key} className={`rounded-xl border ${color} flex flex-col animate-slide-up`} style={{ animationDelay: `${colIdx * 80}ms` }}>
              {/* column header */}
              <div className={`flex items-center gap-2 px-4 py-3 border-b ${color} shrink-0`}>
                <div className={`w-2 h-2 rounded-full ${dot}`} />
                <span className="font-semibold text-sm text-gray-800">{label}</span>
                <span className="ml-auto text-xs text-gray-500 bg-white/60 px-2 py-0.5 rounded-full">{colItems.length}</span>
              </div>

              {/* scrollable card area */}
              <div className="flex-1 p-3 space-y-2 overflow-y-auto min-h-[120px] max-h-[480px]"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db transparent" }}
              >
                {colItems.map((item) => {
                  const hasVoted = votedIds.has(item.id);
                  const isNew    = newIds.has(item.id);
                  const hasBurst = burstIds.has(item.id);
                  const isVoting = votingId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`relative bg-white rounded-xl border shadow-sm p-4 transition-all duration-300 ${isNew ? "animate-slide-up" : ""} ${item.isAction ? "border-cbre-mint ring-1 ring-cbre-mint animate-shimmer-in" : "border-gray-100"}`}
                    >
                      {hasBurst && <ConfettiBurst />}
                      <div className="flex items-start gap-2 mb-3">
                        <p className="text-sm text-gray-800 leading-relaxed flex-1">{item.text}</p>
                        {item.isAction && (
                          <span className="shrink-0 text-xs font-semibold bg-cbre-mint text-cbre-green px-2 py-1 rounded-full animate-confetti-pop">Action</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-gray-400 truncate">{item.authorName}</span>
                          <button
                            onClick={() => toggleAction(item)}
                            className={`shrink-0 text-xs px-2.5 py-1 rounded-full border transition-all duration-200 ${item.isAction ? "border-cbre-mint text-cbre-green bg-cbre-mint-light hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600" : "border-gray-200 text-gray-400 hover:border-cbre-mint hover:text-cbre-green hover:bg-cbre-mint-light hover:scale-105"}`}
                          >
                            {item.isAction ? "✓ Action" : "+ Action"}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {hasVoted && (
                            <button onClick={() => vote(item.id, -1)} className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-base" title="Remove vote">−</button>
                          )}
                          <button
                            onClick={() => vote(item.id, 1)}
                            disabled={hasVoted}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-semibold text-sm transition-colors ${isVoting ? "animate-vote-bounce" : ""} ${hasVoted ? "bg-cbre-mint text-cbre-green cursor-default" : "bg-gray-100 text-gray-600 hover:bg-cbre-mint-light hover:text-cbre-green active:scale-95"}`}
                          >
                            <span className="text-base leading-none">👍</span>
                            <span>{item.votes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {colItems.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">No items yet</p>
                )}
              </div>

              {/* add input — pinned at bottom */}
              {retro.status === "open" && (
                <div className="p-3 border-t border-white/60 shrink-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add an item…"
                      value={drafts[key]}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [key]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && addItem(key)}
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cbre-mint bg-white"
                    />
                    <button
                      onClick={() => addItem(key)}
                      disabled={!drafts[key].trim() || submitting === key}
                      className="text-sm bg-cbre-green text-white px-3 py-1.5 rounded-lg hover:bg-cbre-mint hover:text-cbre-green transition-colors disabled:opacity-40"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* sprint actions */}
      {showActions && (
        <div className="bg-white rounded-xl border border-cbre-mint shadow-sm overflow-hidden animate-slide-up">
          <div className="bg-cbre-green px-5 py-3 flex items-center gap-3">
            <span className="text-sm font-semibold text-white">Sprint Actions</span>
            <span className="text-xs bg-cbre-mint text-cbre-green font-semibold px-2 py-0.5 rounded-full">
              {actionItems.filter((i) => !i.completedAction).length} open
            </span>
            {actionItems.some((i) => i.completedAction) && (
              <span className="text-xs text-white/50">{actionItems.filter((i) => i.completedAction).length} done</span>
            )}
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db transparent" }}>
            {actionItems.map((item, i) => {
              const cat = format.columns.find((c) => c.key === item.category);
              const cyclePriority = () => {
                const idx = PRIORITY_CYCLE.indexOf(item.priority);
                setActionPriority(item, PRIORITY_CYCLE[(idx + 1) % PRIORITY_CYCLE.length]);
              };
              return (
                <div key={item.id} className="px-5 py-3 flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <input type="checkbox" checked={!!item.completedAction} onChange={() => toggleCompleted(item)} className="rounded border-gray-300 accent-cbre-green shrink-0 cursor-pointer" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${item.completedAction ? "line-through text-gray-400" : "text-gray-800"}`}>{item.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.authorName} · {cat?.label}</p>
                  </div>
                  {item.priority ? (
                    <button onClick={cyclePriority} className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium transition-colors ${PRIORITY_STYLE[item.priority].classes}`}>{PRIORITY_STYLE[item.priority].label}</button>
                  ) : (
                    <button onClick={cyclePriority} className="shrink-0 text-xs px-2 py-0.5 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors">Priority</button>
                  )}
                  <button onClick={() => toggleAction(item)} className="text-xs text-gray-400 hover:text-rose-500 transition-colors shrink-0 hover:scale-110" title="Remove action">✕</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
