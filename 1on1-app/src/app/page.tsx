export const dynamic = "force-dynamic";

import { employeesContainer, meetingsContainer } from "@/lib/cosmos";
import type { Employee, Meeting } from "@/types";
import EmployeeCard from "@/components/EmployeeCard";
import AddEmployeeForm from "@/components/AddEmployeeForm";

async function getEmployeesWithLastMeeting(): Promise<{ employee: Employee; lastMeeting: Meeting | null }[]> {
  const { resources: employees } = await employeesContainer.items
    .readAll<Employee>()
    .fetchAll();

  return Promise.all(
    employees.map(async (employee) => {
      const { resources: meetings } = await meetingsContainer.items
        .query<Meeting>({
          query: "SELECT TOP 1 * FROM c WHERE c.employeeId = @eid ORDER BY c.meetingDate DESC",
          parameters: [{ name: "@eid", value: employee.id }],
        })
        .fetchAll();
      return { employee, lastMeeting: meetings[0] ?? null };
    })
  );
}

export default async function DashboardPage() {
  const data = await getEmployeesWithLastMeeting();

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">1:1 Meetings</h1>
      </div>
      <div className="mb-8 p-5 bg-white rounded-xl border border-gray-200">
        <h2 className="text-sm font-semibold text-gray-600 mb-4">Add Employee</h2>
        <AddEmployeeForm />
      </div>
      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">No employees yet. Add one above.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(({ employee, lastMeeting }) => (
            <EmployeeCard key={employee.id} employee={employee} lastMeeting={lastMeeting} />
          ))}
        </div>
      )}
    </main>
  );
}
