export interface Speaker {
  name: string;
  color: string;
}

export interface TranscriptLine {
  speaker: string;
  text: string;
  actionItem?: string;
  time?: string;
}

export interface Attendee {
  name: string;
  role: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  dueDate: string;
}
