import { DefaultListResponse } from "./common";

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

//GET: /meeting-minutes
export interface MeetingMinutesRequest {
  search?: string;
  project_id?: string;
}

export interface MeetingMinutesResponse extends DefaultListResponse {
  data: MeetingMinutesData[];
}

export interface MeetingMinutesData {
  title: string;
  minute_id: number;
  status: string;
  project: {
    project_id: number;
    project_name: string;
  }
  createdBy: {
    user_id: number;
  }
  created_at: Date;
  updated_at: Date;
}


//GET: /meeting-minutes/{minuteId}
export interface MeetingMinuteByIdResponse {
  minute_id: number;
  project_id: number;
  title: string;
  agenda: string[];
  status: string;
  fileUrl: string;
  source: string
  meeting_link: string;
  location: string;
  schedule_start: Date;
  schedule_end: Date;
  actual_start: Date;
  actual_end: Date;
  created_by: number;
  version: number;
  content: string;
  format: string;
  publish_by: number;
  published_at: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  project: {
    project_id: number;
    project_name: string;
  };
  createdBy: {
    user_id: number;
    name: string;
    email: string;
  }
}

//PUT: /meeting-minutes/{minuteId} 
export interface UpdateMeetingMinuteRequest {
  title: string;
  status: string;
  actual_start: string; // ISO-8601 string
  attendeeIds: number[];
  agenda: string[];
  meeting_summary: string;
  decisions: string[];
  action_items: {
    id?: number; // provided to update existing action items, not provided to create new ones
    description: string;
    assigneeId: number;
    due_date: string; // ISO-8601 string
    status: string;
    completed_at?: string; // ISO-8601 string
  }[];
}

export interface ActionItem {
  action_id: number;
  description: string;
  assignee_user_id: number;
  due_date: Date;
  status: string;
  completed_at?: Date;
  assignee: {
    user_id: number;
    name: string;
    email: string;
  }
}

interface Project {
  project_id: number;
  project_name: string;
}

interface User {
  user_id: number;
  name: string;
  email: string;
}

interface Transcript {
  transcript_id: number;
  source: string;
  language: string;
  raw_text: string;
  segments?: TranscriptSegment[];
}

interface TranscriptSegment {
  segment_id: number;
  transcript_id: number;
  content: string;
  start_ms?: number;
  end_ms?: number;
}

// Dùng chung hết cho detail, create, update
export interface GetOneMeetingMinuteResponse {
  minute_id: number;
  project_id: number;
  title: string;
  agenda: string[];
  status: string;
  fileUrl: string;
  source: string;
  meeting_link: string;
  location: string;
  schedule_start: Date;
  schedule_end: Date;
  actual_start: Date;
  actual_end: Date;
  created_by: number;
  version: number;
  content: string;
  meeting_summary?: string; // Summary từ AI service
  format: string;
  publish_by: number;
  published_at: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  project: Project;
  createdBy: User;
  participants: Participant[];
  transcripts: Transcript[];
  decisions: Decision[];
  actionItems: ActionItem[];
}

export interface Participant {
  minute_id: number;
  user: User;
}

export interface Decision {
  decision_id: number;
  statement: string;
  decided_at: Date;
}

//DELTE: /meeting-minutes/{minuteId} No need request, No need response

//POST: /meeting-minutes/process NOT DONE
export interface ProcessMeetingMinuteRequest {
  files: File | Blob | (File | Blob)[];
  language?: string;
  project_id: number;
  source?: string;
  meeting_link?: string;
  location?: string;
  actual_start: Date;
  actual_end: Date;
}

//POST: /meeting-minutes/{meetingId}/send-email DONE
export interface SendMeetingMinuteEmailRequest {
  recipientEmails: string[];
  subject: string;
  message: string;
}

export interface SendMeetingMinuteEmailResponse {
  message: string;
}