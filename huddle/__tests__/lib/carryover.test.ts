jest.mock("@/lib/cosmos", () => ({
  actionItemsContainer: {
    items: {
      query: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { carryOverIncompleteItems } from "@/lib/carryover";
import { actionItemsContainer } from "@/lib/cosmos";

const mockQuery = actionItemsContainer.items.query as jest.Mock;
const mockCreate = actionItemsContainer.items.create as jest.Mock;

beforeEach(() => jest.clearAllMocks());

it("copies incomplete items with carriedOver=true", async () => {
  const incompleteItems = [
    { id: "old-1", meetingId: "prev", employeeId: "emp", text: "Chase IT", assignee: "manager", completed: false, carriedOver: false, createdAt: "2026-01-01" },
  ];
  mockQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: incompleteItems }) });
  mockCreate.mockResolvedValue({});

  await carryOverIncompleteItems("prev-meeting-id", "new-meeting-id", "emp-id");

  expect(mockCreate).toHaveBeenCalledTimes(1);
  const created = mockCreate.mock.calls[0][0];
  expect(created.carriedOver).toBe(true);
  expect(created.completed).toBe(false);
  expect(created.meetingId).toBe("new-meeting-id");
  expect(created.text).toBe("Chase IT");
});

it("does nothing when there are no incomplete items", async () => {
  mockQuery.mockReturnValue({ fetchAll: jest.fn().mockResolvedValue({ resources: [] }) });
  await carryOverIncompleteItems("prev", "new", "emp");
  expect(mockCreate).not.toHaveBeenCalled();
});
