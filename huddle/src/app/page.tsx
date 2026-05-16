export const dynamic = "force-dynamic";

import { employeesContainer, meetingsContainer } from "@/lib/cosmos";
import type { Employee, Meeting } from "@/types";
import Link from "next/link";
import EmployeeCard from "@/components/EmployeeCard";
import AddEmployeeForm from "@/components/AddEmployeeForm";

async function getEmployeesWithMeetings(): Promise<{ employee: Employee; lastMeeting: Meeting | null; nextMeeting: Meeting | null }[]> {
  const { resources: employees } = await employeesContainer.items
    .readAll<Employee>()
    .fetchAll();

  const today = new Date().toISOString().split("T")[0];

  return Promise.all(
    employees.map(async (employee) => {
      const [{ resources: last }, { resources: next }] = await Promise.all([
        meetingsContainer.items.query<Meeting>({
          query: "SELECT TOP 1 * FROM c WHERE c.employeeId = @eid ORDER BY c.meetingDate DESC",
          parameters: [{ name: "@eid", value: employee.id }],
        }).fetchAll(),
        meetingsContainer.items.query<Meeting>({
          query: "SELECT TOP 1 * FROM c WHERE c.employeeId = @eid AND NOT IS_DEFINED(c.completedAt) AND c.meetingDate >= @today ORDER BY c.meetingDate ASC",
          parameters: [{ name: "@eid", value: employee.id }, { name: "@today", value: today }],
        }).fetchAll(),
      ]);
      return { employee, lastMeeting: last[0] ?? null, nextMeeting: next[0] ?? null };
    })
  );
}

export default async function DashboardPage() {
  const data = await getEmployeesWithMeetings();

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Huddle</h1>
        <Link href="/health" className="text-sm text-gray-500 hover:text-gray-900">Team Health →</Link>
      </div>
      <div className="mb-8 p-5 bg-white rounded-xl border border-gray-200">
        <h2 className="text-sm font-semibold text-gray-600 mb-4">Add Employee</h2>
        <AddEmployeeForm />
      </div>
      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">No employees yet. Add one above.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(({ employee, lastMeeting, nextMeeting }) => (
            <EmployeeCard key={employee.id} employee={employee} lastMeeting={lastMeeting} nextMeeting={nextMeeting} />
          ))}
        </div>
      )}
    </main>
  );
}
