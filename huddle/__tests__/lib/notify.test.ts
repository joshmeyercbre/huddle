const mockSend = jest.fn().mockResolvedValue([{}, {}]);
const mockSetApiKey = jest.fn();

jest.mock("@sendgrid/mail", () => ({
  __esModule: true,
  default: { setApiKey: mockSetApiKey, send: mockSend },
}));

import { sendEmployeeNotification, sendManagerDigest } from "@/lib/notify";
import type { Employee } from "@/types";

const emp: Employee = {
  id: "e1", name: "Alice", token: "tok-abc", cadence: "weekly",
  email: "alice@co.com", notifyDaysBefore: 1, createdAt: "2026-01-01",
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.SENDGRID_API_KEY = "SG.test";
  process.env.FROM_EMAIL = "noreply@co.com";
  process.env.MANAGER_EMAIL = "mgr@co.com";
  process.env.NEXT_PUBLIC_BASE_URL = "https://app.co.com";
});

describe("sendEmployeeNotification", () => {
  it("sends email with employee link", async () => {
    await sendEmployeeNotification(emp, "2026-05-16");
    expect(mockSetApiKey).toHaveBeenCalledWith("SG.test");
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "alice@co.com",
        from: "noreply@co.com",
        html: expect.stringContaining("/huddle/tok-abc"),
      })
    );
  });

  it("skips send when employee has no email", async () => {
    await sendEmployeeNotification({ ...emp, email: undefined }, "2026-05-16");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("skips send when SENDGRID_API_KEY is missing", async () => {
    delete process.env.SENDGRID_API_KEY;
    await sendEmployeeNotification(emp, "2026-05-16");
    expect(mockSend).not.toHaveBeenCalled();
  });
});

describe("sendManagerDigest", () => {
  it("sends digest with all employee names and dates", async () => {
    const emp2: Employee = { ...emp, id: "e2", name: "Bob", email: "bob@co.com" };
    await sendManagerDigest([
      { employee: emp, meetingDate: "2026-05-16" },
      { employee: emp2, meetingDate: "2026-05-16" },
    ]);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "mgr@co.com",
        html: expect.stringContaining("Alice"),
      })
    );
    const call = mockSend.mock.calls[0][0];
    expect(call.html).toContain("Bob");
    expect(call.subject).toContain("2");
  });

  it("skips send when entries list is empty", async () => {
    await sendManagerDigest([]);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("skips send when MANAGER_EMAIL is missing", async () => {
    delete process.env.MANAGER_EMAIL;
    await sendManagerDigest([{ employee: emp, meetingDate: "2026-05-16" }]);
    expect(mockSend).not.toHaveBeenCalled();
  });
});
