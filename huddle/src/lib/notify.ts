import sgMail from "@sendgrid/mail";
import type { Employee } from "@/types";

function init() {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) return false;
  sgMail.setApiKey(key);
  return true;
}

const from = () => process.env.FROM_EMAIL ?? "";
const baseUrl = () => process.env.NEXT_PUBLIC_BASE_URL ?? "";

export async function sendEmployeeNotification(employee: Employee, meetingDate: string): Promise<void> {
  if (!init() || !employee.email) return;

  const today = new Date().toISOString().split("T")[0];
  const when = meetingDate === today ? "today" : "tomorrow";

  await sgMail.send({
    to: employee.email,
    from: from(),
    subject: `Your 1-on-1 is ${when} — time to prepare`,
    html: `<p>Hi ${employee.name},</p>
<p>Your 1-on-1 is scheduled for <strong>${meetingDate}</strong>.</p>
<p><a href="${baseUrl()}/huddle/${employee.token}">Open your prep page</a> to add topics and review action items before the meeting.</p>`,
  });
}

export async function sendManagerDigest(
  entries: { employee: Employee; meetingDate: string }[]
): Promise<void> {
  if (!init() || entries.length === 0) return;
  const managerEmail = process.env.MANAGER_EMAIL;
  if (!managerEmail) return;

  const rows = entries
    .map(({ employee, meetingDate }) => `<li>${employee.name} — ${meetingDate}</li>`)
    .join("");

  const count = entries.length;
  await sgMail.send({
    to: managerEmail,
    from: from(),
    subject: `${count} 1-on-1${count > 1 ? "s" : ""} scheduled`,
    html: `<p>The following 1-on-1 meetings have been scheduled:</p><ul>${rows}</ul>`,
  });
}
