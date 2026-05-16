import sgMail from "@sendgrid/mail";
import type { Employee, Meeting, ActionItem, MeetingSections, Topic, TopicTag } from "@/types";

const TAG_LABELS: Record<TopicTag, string> = {
  feedback: "Feedback", decision: "Decision", fyi: "FYI", career: "Career",
};

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

const SECTION_LABELS: Partial<Record<keyof MeetingSections, string>> = {
  winOfWeek: "Win of the week",
  workingOn: "What are you working on?",
  blockers: "Blockers & follow-ups",
  winsThisQuarter: "Wins this quarter",
  goalsReview: "Goals review",
  careerDevelopment: "Career development",
  nextQuarterPriorities: "Next quarter priorities",
  howIsItGoing: "How's it going?",
  whatIsWorkingWell: "What's working well?",
  whatIsUnclear: "What's unclear?",
  whatDoYouNeed: "What do you need?",
};

export async function sendMeetingSummary(
  employee: Employee,
  meeting: Meeting,
  actionItems: ActionItem[]
): Promise<void> {
  if (!init()) return;
  const managerEmail = process.env.MANAGER_EMAIL;
  const recipients = [managerEmail, employee.email].filter(Boolean) as string[];
  if (recipients.length === 0) return;

  const date = new Date(meeting.meetingDate).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const sectionRows: string[] = [];

  if (meeting.sections.whatsOnYourMind.length > 0) {
    const topicItems = meeting.sections.whatsOnYourMind.map((t) => {
      const topic: Topic = typeof t === "string" ? { text: t } : t;
      const tag = topic.tag ? ` <em style="color:#6b7280">[${TAG_LABELS[topic.tag]}]</em>` : "";
      return `<li>${topic.text}${tag}</li>`;
    }).join("");
    sectionRows.push(`<p><strong>What's on your mind?</strong></p><ul>${topicItems}</ul>`);
  }

  for (const [key, label] of Object.entries(SECTION_LABELS)) {
    const value = meeting.sections[key as keyof MeetingSections];
    if (typeof value === "string" && value.trim()) {
      sectionRows.push(`<p><strong>${label}</strong></p><p>${value}</p>`);
    }
  }

  const itemRows = actionItems
    .map((i) => `<li>${i.completed ? "✓" : "☐"} ${i.text} <em>(${i.assignee === "manager" ? "Manager" : employee.name})</em></li>`)
    .join("");

  const prepUrl = `${baseUrl()}/huddle/${employee.token}`;
  const html = `<h2>1-on-1 summary — ${employee.name}</h2>
<p>${date}</p>
${sectionRows.join("")}
${actionItems.length > 0 ? `<p><strong>Action items</strong></p><ul>${itemRows}</ul>` : ""}
<hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
<p style="color:#6b7280;font-size:14px">Thought of something to cover next time? <a href="${prepUrl}" style="color:#4f46e5">Add a topic →</a></p>`;

  await sgMail.send({
    to: recipients,
    from: from(),
    subject: `1-on-1 summary — ${employee.name} — ${date}`,
    html,
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
