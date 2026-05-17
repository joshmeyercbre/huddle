export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { employeesContainer, meetingsContainer, actionItemsContainer, retrosContainer, retroItemsContainer } from "@/lib/cosmos";
import { getManagerIdFromHeader } from "@/lib/auth";
import type { Employee, Meeting, ActionItem, Retro, RetroItem } from "@/types";
import Link from "next/link";
import EmployeeCard from "@/components/EmployeeCard";
import AddEmployeeForm from "@/components/AddEmployeeForm";
import TeamActionsPanel from "@/components/TeamActionsPanel";
import RetroActionsPanel from "@/components/RetroActionsPanel";
import TeamLinkButton from "@/components/TeamLinkButton";

interface EmployeeData {
  employee: Employee;
  lastMeeting: Meeting | null;
  actionItems: ActionItem[];
}

async function getDashboardData(): Promise<EmployeeData[]> {
  const managerId = getManagerIdFromHeader(headers().get("x-ms-client-principal"));

  const { resources: employees } = await employeesContainer.items
    .query<Employee>({
      query: "SELECT * FROM c WHERE c.managerId = @mid",
      parameters: [{ name: "@mid", value: managerId }],
    })
    .fetchAll();

  return Promise.all(
    employees.map(async (employee) => {
      const { resources: meetings } = await meetingsContainer.items
        .query<Meeting>({
          query: "SELECT TOP 1 * FROM c WHERE c.employeeId = @eid ORDER BY c.meetingDate DESC",
          parameters: [{ name: "@eid", value: employee.id }],
        })
        .fetchAll();

      const lastMeeting = meetings[0] ?? null;

      if (!lastMeeting) return { employee, lastMeeting: null, actionItems: [] };

      const { resources: actionItems } = await actionItemsContainer.items
        .query<ActionItem>({
          query: "SELECT * FROM c WHERE c.meetingId = @mid ORDER BY c.createdAt ASC",
          parameters: [{ name: "@mid", value: lastMeeting.id }],
        })
        .fetchAll();

      return { employee, lastMeeting, actionItems };
    })
  );
}

async function getRetroActions(managerId: string): Promise<{ item: RetroItem; retro: Retro }[]> {
  const { resources: retros } = await retrosContainer.items
    .query<Retro>({
      query: "SELECT * FROM c WHERE c.managerId = @mid ORDER BY c.createdAt DESC",
      parameters: [{ name: "@mid", value: managerId }],
    })
    .fetchAll();

  const nested = await Promise.all(
    retros.map(async (retro) => {
      const { resources: items } = await retroItemsContainer.items
        .query<RetroItem>({
          query: "SELECT * FROM c WHERE c.retroId = @rid AND c.isAction = true ORDER BY c.createdAt ASC",
          parameters: [{ name: "@rid", value: retro.id }],
        })
        .fetchAll();
      return items.map((item) => ({ item, retro }));
    })
  );

  return nested.flat();
}

export default async function DashboardPage() {
  const managerId = getManagerIdFromHeader(headers().get("x-ms-client-principal"));
  const [data, retroActions] = await Promise.all([
    getDashboardData(),
    getRetroActions(managerId),
  ]);

  const allActions = data.flatMap(({ employee, actionItems }) =>
    actionItems.map((item) => ({ item, employee }))
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-cbre-green px-6 py-4 flex items-center gap-3">
        <div className="w-2 h-8 bg-cbre-mint rounded-sm" />
        <div className="flex items-center gap-6 flex-1">
          <h1 className="text-xl font-bold text-white tracking-tight">Huddle</h1>
          <span className="text-white/40">|</span>
          <Link href="/retro" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Retrospectives</Link>
        </div>
        <TeamLinkButton />
      </header>

      <main className="max-w-5xl mx-auto w-full px-6 py-10 flex-1 space-y-8">
        {/* Ready for review */}
        {(() => {
          const ready = data.filter(d => d.lastMeeting?.submitted && !d.lastMeeting?.managerShared);
          if (ready.length === 0) return null;
          return (
            <div>
              <h2 className="text-sm font-semibold text-cbre-green mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cbre-mint animate-pulse" />
                Ready for Review
                <span className="text-gray-400 font-normal">{ready.length}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ready.map(({ employee, lastMeeting }) => (
                  <div key={employee.id} className="bg-cbre-green rounded-xl p-5 flex flex-col gap-3">
                    <div>
                      <p className="font-semibold text-white">{employee.name}</p>
                      <p className="text-xs font-mono text-cbre-mint/60">#{employee.id.slice(0, 8)}</p>
                      <p className="text-xs text-cbre-mint mt-1">
                        Submitted {lastMeeting ? new Date(lastMeeting.meetingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                      </p>
                    </div>
                    <Link
                      href={`/huddle/${employee.token}`}
                      className="w-full text-center bg-cbre-mint text-cbre-green text-sm font-semibold rounded-lg py-2 hover:bg-white transition-colors"
                    >
                      Begin Review →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* team section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">
              Your Team
              {data.length > 0 && <span className="ml-2 text-gray-400 font-normal">{data.length}</span>}
            </h2>
            <AddEmployeeForm />
          </div>

          {data.length === 0 ? (
            <p className="text-gray-400 text-sm">No team members yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.map(({ employee, lastMeeting }) => (
                <EmployeeCard key={employee.id} employee={employee} lastMeeting={lastMeeting} />
              ))}
            </div>
          )}
        </div>

        <TeamActionsPanel initial={allActions.map(({ item, employee }) => ({ item, employeeName: employee.name, employeeToken: employee.token }))} />
        <RetroActionsPanel initial={retroActions} />
      </main>
    </div>
  );
}

