const BONUS_QUESTIONS = [
  "What's one thing that energized you this week?",
  "Is there anything about your work right now that feels unclear or uncertain?",
  "What would make your work 10% easier?",
  "What's a skill you'd like to develop over the next few months?",
  "Is there anything you felt went unrecognized lately?",
  "What's the most interesting problem you've worked on recently?",
  "How are you feeling about your workload — too much, too little, or about right?",
  "What's one thing I could do differently to better support you?",
  "Is there anyone on the team you'd like to work more closely with?",
  "What part of your job feels most meaningful to you right now?",
  "Is there a recent decision you'd like more context on?",
  "What are you most looking forward to in the next few weeks?",
  "Where do you feel most confident in your work right now?",
  "Is there anything you've been hesitant to bring up?",
  "What's a win from the past month you're proud of?",
  "How are you feeling about the direction of the team?",
  "Is there a process or tool that's been slowing you down?",
  "What kind of work do you wish you had more of?",
  "How are you doing outside of work — anything affecting your focus?",
  "What feedback have you received recently that stuck with you?",
  "Is there a project you'd love to take on that you haven't had a chance to yet?",
  "What's something you've learned in the last month?",
  "Do you feel like you have the right amount of autonomy in your work?",
  "What would you change about how we work as a team?",
  "Is there someone whose work you'd like to recognize?",
  "What does a great week look like for you right now?",
];

function isoWeekNumber(dateStr: string): number {
  const d = new Date(dateStr);
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getBonusQuestion(meetingDate: string): string {
  const week = isoWeekNumber(meetingDate);
  return BONUS_QUESTIONS[(week - 1) % BONUS_QUESTIONS.length];
}
