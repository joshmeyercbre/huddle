export const dynamic = "force-dynamic";

import Link from "next/link";
import { employeesContainer, meetingsContainer, actionItemsContainer } from "@/lib/cosmos";
import type { Employee, Meeting, ActionItem } from "@/types";

const CADENCE_DAYS = { weekly: 7, biweekly: 14 };

type Status = "on-track" | "due-soon" | "overdue" | "new";

interface EmployeeHealth {
  employee: Employee;
  lastMeeting: Meeting | null;
  daysSinceLast: number | null;
  daysUntilDue: number | null;
  status: Status;
  openItems: number;
  hasUpcoming: boolean;
}

function computeStatus(employee: Employee, lastMeeting: Meeting | null, todayStr: string): {
  status: Status;
  daysSinceLast: number | null;
  daysUntilDue: number | null;
  hasUpcoming: boolean;
} {
  if (!lastMeeting) return { status: "new", daysSinceLast: null, daysUntilDue: null, hasUpcoming: false };

  const hasUpcoming = lastMeeting.meetingDate > todayStr;
  if (hasUpcoming) return { status: "on-track", daysSinceLast: null, daysUntilDue: null, hasUpcoming: true };

  const today = new Date(todayStr);
  const last = new Date(lastMeeting.meetingDate);
  const daysSinceLast = Math.floor((today.getTime() - last.getTime()) / 86_400_000);
  const cadence = CADENCE_DAYS[employee.cadence];
  const daysUntilDue = cadence - daysSinceLast;

  let status: Status = "on-track";
  if (daysSinceLast >= cadence) status = "overdue";
  else if (daysUntilDue <= 2) status = "due-soon";

  return { status, daysSinceLast, daysUntilDue, hasUpcoming };
}

async function getHealthData(): Promise<EmployeeHealth[]> {
  const todayStr = new Date().toISOString().split("T")[0];

  const { resources: employees } = await employeesContainer.items.readAll<Employee>().fetchAll();

  const { resources: allOpenItems } = await actionItemsContainer.items
    .query<ActionItem>("SELECT * FROM c WHERE c.completed = false")
    .fetchAll();

  const openByEmployee = new Map<string, number>();
  for (const item of allOpenItems) {
    openByEmployee.set(item.employeeId, (openByEmployee.get(item.employeeId) ?? 0) + 1);
  }

  return Promise.all(
    employees.map(async (employee) => {
      const { resources: meetings } = await meetingsContainer.items
        .query<Meeting>({
          query: "SELECT TOP 1 * FROM c WHERE c.employeeId = @eid ORDER BY c.meetingDate DESC",
          parameters: [{ name: "@eid", value: employee.id }],
        })
        .fetchAll();

      const lastMeeting = meetings[0] ?? null;
      const { status, daysSinceLast, daysUntilDue, hasUpcoming } = computeStatus(employee, lastMeeting, todayStr);

      return {
        employee,
        lastMeeting,
        daysSinceLast,
        daysUntilDue,
        status,
        openItems: openByEmployee.get(employee.id) ?? 0,
        hasUpcoming,
      };
    })
  );
}

const STATUS_CONFIG: Record<Status, { label: string; dot: string; row: string }> = {
  "on-track": { label: "On track", dot: "bg-green-500", row: "" },
  "due-soon": { label: "Due soon", dot: "bg-yellow-400", row: "bg-yellow-50" },
  "overdue":  { label: "Overdue",  dot: "bg-red-500",   row: "bg-red-50" },
  "new":      { label: "New",      dot: "bg-gray-300",  row: "" },
};

function StatusBadge({ status }: { status: Status }) {
  const { label, dot } = STATUS_CONFIG[status];
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full inline-block ${dot}`} />
      <span className="text-sm text-gray-700">{label}</span>
    </span>
  );
}

export default async function HealthPage() {
  const data = await getHealthData();

  const counts = { "on-track": 0, "due-soon": 0, overdue: 0, new: 0 };
  for (const { status } of data) counts[status]++;

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Team Health</h1>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {(["on-track", "due-soon", "overdue", "new"] as Status[]).map((s) => (
          <div key={s} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{counts[s]}</p>
            <StatusBadge status={s} />
          </div>
        ))}
      </div>

      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">No employees yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last meeting</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Next due</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Open items</th>
              </tr>
            </thead>
            <tbody>
              {data
                .sort((a, b) => {
                  const order: Record<Status, number> = { overdue: 0, "due-soon": 1, new: 2, "on-track": 3 };
                  return order[a.status] - order[b.status];
                })
                .map(({ employee, lastMeeting, daysSinceLast, daysUntilDue, status, openItems, hasUpcoming }) => (
                  <tr key={employee.id} className={`border-b border-gray-50 last:border-0 ${STATUS_CONFIG[status].row}`}>
                    <td className="px-5 py-3.5">
                      <Link href={`/employee/${employee.id}`} className="font-medium text-gray-900 hover:underline">
                        {employee.name}
                      </Link>
                      <span className="ml-2 text-xs text-gray-400 capitalize">{employee.cadence}</span>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={status} /></td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {lastMeeting && !hasUpcoming
                        ? `${new Date(lastMeeting.meetingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} (${daysSinceLast}d ago)`
                        : lastMeeting ? new Date(lastMeeting.meetingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : <span className="text-gray-400">Never</span>}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {hasUpcoming
                        ? <span className="text-green-700 text-xs font-medium">Scheduled</span>
                        : status === "overdue"
                        ? <span className="text-red-600 font-medium">{Math.abs(daysUntilDue!)}d overdue</span>
                        : status === "due-soon"
                        ? <span className="text-yellow-700">{daysUntilDue}d</span>
                        : status === "new"
                        ? <span className="text-gray-400">—</span>
                        : <span className="text-gray-500">{daysUntilDue}d</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      {openItems > 0
                        ? <span className={`font-medium ${openItems >= 5 ? "text-red-600" : "text-gray-700"}`}>{openItems}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
