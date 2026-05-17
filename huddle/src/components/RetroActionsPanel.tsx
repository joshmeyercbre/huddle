"use client";

import { useState } from "react";
import type { RetroItem, Retro, Priority } from "@/types";

const PAGE_SIZE = 5;

const PRIORITY_CYCLE: (Priority | undefined)[] = [undefined, "high", "medium", "low"];

const PRIORITY_STYLE: Record<Priority, { label: string; classes: string }> = {
  high:   { label: "High", classes: "bg-rose-100 text-rose-700 border-rose-200" },
  medium: { label: "Med",  classes: "bg-amber-100 text-amber-700 border-amber-200" },
  low:    { label: "Low",  classes: "bg-blue-100 text-blue-600 border-blue-200" },
};

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function sortByPriority<T extends { priority?: Priority }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const pa = a.priority !== undefined ? PRIORITY_ORDER[a.priority] : 99;
    const pb = b.priority !== undefined ? PRIORITY_ORDER[b.priority] : 99;
    return pa - pb;
  });
}

interface Entry {
  item: RetroItem;
  retro: Retro;
}

function PriorityBadge({ priority, onChange }: { priority?: Priority; onChange: (p: Priority | undefined) => void }) {
  function cycle() {
    const idx = PRIORITY_CYCLE.indexOf(priority);
    onChange(PRIORITY_CYCLE[(idx + 1) % PRIORITY_CYCLE.length]);
  }

  if (!priority) {
    return (
      <button onClick={cycle} title="Set priority"
        className="shrink-0 text-xs px-2 py-0.5 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors">
        Priority
      </button>
    );
  }

  const { label, classes } = PRIORITY_STYLE[priority];
  return (
    <button onClick={cycle} title="Change priority"
      className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium transition-colors ${classes}`}>
      {label}
    </button>
  );
}

export default function RetroActionsPanel({ initial }: { initial: Entry[] }) {
  const [entries, setEntries] = useState<Entry[]>(initial);
  const [openPage, setOpenPage] = useState(1);
  const [donePage, setDonePage] = useState(1);

  async function toggle(id: string, current: boolean) {
    const res = await fetch(`/api/retro-items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedAction: !current }),
    });
    if (res.ok) {
      setEntries((prev) =>
        prev.map((e) => e.item.id === id ? { ...e, item: { ...e.item, completedAction: !current } } : e)
      );
    }
  }

  async function setPriority(id: string, priority: Priority | undefined) {
    const res = await fetch(`/api/retro-items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: priority ?? null }),
    });
    if (res.ok) {
      setEntries((prev) =>
        prev.map((e) => e.item.id === id ? { ...e, item: { ...e.item, priority } } : e)
      );
    }
  }

  const open = sortByPriority(entries.filter(({ item }) => !item.completedAction));
  const done = entries.filter(({ item }) => item.completedAction);

  const visibleOpen = open.slice(0, openPage * PAGE_SIZE);
  const visibleDone = done.slice(0, donePage * PAGE_SIZE);

  if (entries.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-cbre-green px-5 py-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Retro Actions</h2>
        <div className="flex items-center gap-3 text-xs text-cbre-mint">
          <span>{open.length} open</span>
          <span>·</span>
          <span>{done.length} done</span>
        </div>
      </div>

      {open.length > 0 && (
        <>
          <div className="divide-y divide-gray-100">
            {visibleOpen.map(({ item, retro }) => (
              <Row
                key={item.id}
                item={item}
                retro={retro}
                onToggle={() => toggle(item.id, !!item.completedAction)}
                onPriority={(p) => setPriority(item.id, p)}
              />
            ))}
          </div>
          {visibleOpen.length < open.length && (
            <button
              onClick={() => setOpenPage((p) => p + 1)}
              className="w-full py-2 text-xs text-cbre-green font-medium hover:bg-gray-50 transition-colors border-t border-gray-100"
            >
              Show {Math.min(PAGE_SIZE, open.length - visibleOpen.length)} more ({open.length - visibleOpen.length} remaining)
            </button>
          )}
        </>
      )}

      {done.length > 0 && (
        <>
          <div className="px-5 py-2 bg-gray-50 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Completed</p>
          </div>
          <div className="divide-y divide-gray-100">
            {visibleDone.map(({ item, retro }) => (
              <Row
                key={item.id}
                item={item}
                retro={retro}
                onToggle={() => toggle(item.id, !!item.completedAction)}
                onPriority={(p) => setPriority(item.id, p)}
              />
            ))}
          </div>
          {visibleDone.length < done.length && (
            <button
              onClick={() => setDonePage((p) => p + 1)}
              className="w-full py-2 text-xs text-gray-400 hover:bg-gray-50 transition-colors border-t border-gray-100"
            >
              Show {Math.min(PAGE_SIZE, done.length - visibleDone.length)} more
            </button>
          )}
        </>
      )}
    </div>
  );
}

function Row({
  item,
  retro,
  onToggle,
  onPriority,
}: {
  item: RetroItem;
  retro: Retro;
  onToggle: () => void;
  onPriority: (p: Priority | undefined) => void;
}) {
  return (
    <div className="px-5 py-3 flex items-center gap-3">
      <input
        type="checkbox"
        checked={!!item.completedAction}
        onChange={onToggle}
        className="rounded border-gray-300 accent-cbre-green shrink-0 cursor-pointer"
      />
      <span className={`flex-1 text-sm ${item.completedAction ? "line-through text-gray-400" : "text-gray-800"}`}>
        {item.text}
      </span>
      <PriorityBadge priority={item.priority} onChange={onPriority} />
      <span className="text-xs font-medium text-cbre-green bg-cbre-green-light px-2 py-0.5 rounded-full shrink-0">
        {retro.sprintName}
      </span>
    </div>
  );
}
