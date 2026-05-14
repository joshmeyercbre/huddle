import { actionItemsContainer } from "@/lib/cosmos";
import type { ActionItem } from "@/types";

export async function carryOverIncompleteItems(
  previousMeetingId: string,
  newMeetingId: string,
  employeeId: string
): Promise<void> {
  const { resources } = await actionItemsContainer.items
    .query<ActionItem>({
      query: "SELECT * FROM c WHERE c.meetingId = @mid AND c.completed = false",
      parameters: [{ name: "@mid", value: previousMeetingId }],
    })
    .fetchAll();

  await Promise.all(
    resources.map((item) =>
      actionItemsContainer.items.create<ActionItem>({
        id: crypto.randomUUID(),
        meetingId: newMeetingId,
        employeeId,
        text: item.text,
        assignee: item.assignee,
        completed: false,
        carriedOver: true,
        createdAt: new Date().toISOString(),
      })
    )
  );
}
