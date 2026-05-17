"use client";
import { useState } from "react";
import Link from "next/link";
import type { Employee, Meeting } from "@/types";

interface Props {
  employee: Employee;
  lastMeeting: Meeting | null;
}

export default function EmployeeCard({ employee, lastMeeting }: Props) {
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const employeeUrl = `${baseUrl}/huddle/${employee.token}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(employeeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silent fail
    }
  }

  async function newMeeting() {
    setCreating(true);
    await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: employee.id, meetingDate: new Date().toISOString().slice(0, 10) }),
    });
    setCreating(false);
    setCreated(true);
    setTimeout(() => setCreated(false), 3000);
  }

  const hasActiveMeeting = lastMeeting && !lastMeeting.managerShared;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3 hover:border-cbre-mint transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/employee/${employee.id}`} className="font-semibold text-cbre-green hover:underline">
            {employee.name}
          </Link>
          <p className="text-xs font-mono text-gray-400">#{employee.id.slice(0, 8)}</p>
          <p className="text-sm text-gray-500 capitalize">{employee.cadence}</p>
        </div>
        <button
          onClick={copyLink}
          className="text-xs text-gray-400 hover:text-cbre-green px-2 py-1 rounded border border-gray-200 hover:border-cbre-mint transition-colors"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>

      <p className="text-sm text-gray-500">
        {lastMeeting
          ? `Last meeting: ${new Date(lastMeeting.meetingDate).toLocaleDateString()}`
          : "No meetings yet"}
      </p>

      <div className="flex gap-2">
        <Link
          href={`/huddle/${employee.token}`}
          className="flex-1 text-center bg-cbre-green text-white text-sm font-medium rounded-lg py-2 hover:bg-cbre-mint hover:text-cbre-green transition-colors"
        >
          Open Huddle
        </Link>
        {!hasActiveMeeting && (
          <button
            onClick={newMeeting}
            disabled={creating || created}
            className="text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:border-cbre-mint hover:text-cbre-green transition-colors disabled:opacity-50"
          >
            {created ? "Created ✓" : creating ? "…" : "New Meeting"}
          </button>
        )}
      </div>
    </div>
  );
}
