export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { employeesContainer, meetingsContainer, actionItemsContainer } from "@/lib/cosmos";
import { getManagerIdFromHeader, parsePrincipal } from "@/lib/auth";
import type { Employee, Meeting, ActionItem } from "@/types";
import Link from "next/link";
import EmployeeCard from "@/components/EmployeeCard";
import AddEmployeeForm from "@/components/AddEmployeeForm";
import TeamActionsPanel from "@/components/TeamActionsPanel";

interface EmployeeData {
  employee: Employee;
  lastMeeting: Meeting | null;
  actionItems: ActionItem[];
}

async function getDashboardData(managerId: string): Promise<EmployeeData[]> {
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
          query: "SELECT * FROM c WHERE c.meetingId = @mid AND c.completed = false ORDER BY c.createdAt ASC",
          parameters: [{ name: "@mid", value: lastMeeting.id }],
        })
        .fetchAll();

      return { employee, lastMeeting, actionItems };
    })
  );
}

export default async function DashboardPage() {
  const principalHeader = headers().get("x-ms-client-principal");
  const managerId = getManagerIdFromHeader(principalHeader);
  const data = await getDashboardData(managerId);

  const allActions = data.flatMap(({ employee, actionItems }) =>
    actionItems.map((item) => ({ item, employee }))
  );

  const readyForReview = data.filter(d => d.lastMeeting?.submitted && !d.lastMeeting?.managerShared);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-cbre-green px-6 py-4 flex items-center gap-3">
        <div className="w-2 h-8 bg-cbre-mint rounded-sm" />
        <div className="flex items-center gap-6 flex-1">
          <h1 className="text-xl font-bold text-white tracking-tight">Huddle</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-6 py-10 flex-1 space-y-8">
        {readyForReview.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-cbre-green mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cbre-mint animate-pulse" />
              Ready for Review
              <span className="text-gray-400 font-normal">{readyForReview.length}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {readyForReview.map(({ employee, lastMeeting }) => (
                <div key={employee.id} className="bg-cbre-green rounded-xl p-5 flex flex-col gap-3">
                  <div>
                    <p className="font-semibold text-white">{employee.name}</p>
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
        )}

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

        {allActions.length > 0 && (
          <TeamActionsPanel
            initial={allActions.map(({ item, employee }) => ({
              item,
              employeeName: employee.name,
              employeeToken: employee.token,
            }))}
          />
        )}
      </main>
    </div>
  );
}
