"use client";
import { useState } from "react";
import Link from "next/link";
import type { Employee, Meeting } from "@/types";

interface Props {
  employee: Employee;
  lastMeeting: Meeting | null;
}

export default function EmployeeCard({ employee, lastMeeting }: Props) {
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const employeeUrl = `${baseUrl}/1on1/${employee.token}`;

  async function startMeeting() {
    setStarting(true);
    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: employee.id,
        meetingDate: new Date().toISOString().slice(0, 10),
      }),
    });
    setStarting(false);
    if (res.ok) window.location.reload();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(employeeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silent fail
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/employee/${employee.id}`} className="font-semibold text-gray-900 hover:underline">
            {employee.name}
          </Link>
          <p className="text-sm text-gray-500 capitalize">{employee.cadence}</p>
        </div>
        <button
          onClick={copyLink}
          className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded border border-gray-200 hover:border-gray-400 transition"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
      <p className="text-sm text-gray-500">
        {lastMeeting
          ? `Last meeting: ${new Date(lastMeeting.meetingDate).toLocaleDateString()}`
          : "No meetings yet"}
      </p>
      <button
        onClick={startMeeting}
        disabled={starting}
        className="mt-1 w-full bg-gray-900 text-white text-sm font-medium rounded-lg py-2 hover:bg-gray-700 transition disabled:opacity-50"
      >
        {starting ? "Starting…" : "Start Meeting"}
      </button>
    </div>
  );
}
