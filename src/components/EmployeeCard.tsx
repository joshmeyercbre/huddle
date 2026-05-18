"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Employee, Meeting } from "@/types";

interface Props {
  employee: Employee;
  lastMeeting: Meeting | null;
}

export default function EmployeeCard({ employee, lastMeeting }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const employeeUrl = `${baseUrl}/huddle/${employee.token}`;

  const today = new Date().toISOString().slice(0, 10);
  const hasMeetingToday = lastMeeting?.meetingDate === today;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(employeeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  async function scheduleToday() {
    setScheduling(true);
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee.id, meetingDate: today }),
      });
      if (res.ok || res.status === 409) {
        router.push(`/huddle/${employee.token}`);
      }
    } finally {
      setScheduling(false);
    }
  }

  const statusBadge = lastMeeting?.managerShared
    ? { label: "Reviewed", className: "text-gray-400" }
    : lastMeeting?.submitted
    ? { label: "Ready", className: "text-cbre-mint font-semibold" }
    : lastMeeting
    ? { label: "In progress", className: "text-gray-400" }
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3 hover:border-cbre-mint transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/employee/${employee.id}`} className="font-semibold text-cbre-green hover:underline">
            {employee.name}
          </Link>
          <p className="text-xs font-mono text-gray-400 mt-0.5">#{employee.id.slice(0, 8)}</p>
          <p className="text-sm text-gray-500 capitalize mt-0.5">{employee.cadence}</p>
        </div>
        <button
          onClick={copyLink}
          className="text-xs text-gray-400 hover:text-cbre-green px-2 py-1 rounded border border-gray-200 hover:border-cbre-mint transition-colors"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {lastMeeting
            ? `Last: ${new Date(lastMeeting.meetingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
            : "No meetings yet"}
        </span>
        {statusBadge && (
          <span className={`text-xs ${statusBadge.className}`}>{statusBadge.label}</span>
        )}
      </div>

      {hasMeetingToday ? (
        <Link
          href={`/huddle/${employee.token}`}
          className="w-full text-center bg-cbre-green text-white text-sm font-medium rounded-lg py-2 hover:bg-cbre-mint hover:text-cbre-green transition-colors"
        >
          Open Huddle
        </Link>
      ) : (
        <button
          onClick={scheduleToday}
          disabled={scheduling}
          className="w-full text-center bg-cbre-green text-white text-sm font-medium rounded-lg py-2 hover:bg-cbre-mint hover:text-cbre-green transition-colors disabled:opacity-50"
        >
          {scheduling ? "Scheduling…" : "Schedule & Open"}
        </button>
      )}
    </div>
  );
}
