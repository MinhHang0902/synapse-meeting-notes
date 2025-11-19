// lib/api/meeting.ts
import {
  MeetingMinutesRequest,
  MeetingMinutesResponse,
  UpdateMeetingMinuteRequest,
  ProcessMeetingMinuteRequest,
  SendMeetingMinuteEmailRequest,
  SendMeetingMinuteEmailResponse,
  GetOneMeetingMinuteResponse,
  GetMeetingMinuteFileResponse,
} from "@/types/interfaces/meeting";
import { sendGet, sendPost, sendDelete, sendPut, axiosInstance } from "./axios";
import { buildProcessFormData } from "./form-data";

export const MeetingsApi = {
  getAll: async (
    query?: MeetingMinutesRequest & {
      pageIndex?: number;
      pageSize?: number;
      sortKey?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<MeetingMinutesResponse> => {
    const qs = new URLSearchParams();
    if (query?.search) qs.set("search", query.search);
    if (query?.project_id) qs.set("project_id", String(query.project_id));
    if (query?.pageIndex) qs.set("pageIndex", String(query.pageIndex));
    if (query?.pageSize) qs.set("pageSize", String(query.pageSize));
    if (query?.sortKey) qs.set("sortKey", String(query.sortKey));
    if (query?.sortOrder) qs.set("sortOrder", String(query.sortOrder));

    const url = `/api/core/v1/meeting-minutes${qs.toString() ? `?${qs.toString()}` : ""}`;
    const res = await sendGet(url);
    return res.data as MeetingMinutesResponse;
  },

  detail: async (minuteId: number): Promise<GetOneMeetingMinuteResponse> => {
    const res = await sendGet(`/api/core/v1/meeting-minutes/${minuteId}`);
    return res.data as GetOneMeetingMinuteResponse;
  },

  update: async (
    minuteId: number,
    data: UpdateMeetingMinuteRequest
  ): Promise<GetOneMeetingMinuteResponse> => {
    const res = await sendPut(`/api/core/v1/meeting-minutes/${minuteId}`, data);
    return res.data as GetOneMeetingMinuteResponse;
  },

  remove: async (minuteId: number): Promise<void> => {
    await sendDelete(`/api/core/v1/meeting-minutes/${minuteId}`);
  },

  process: async (
    data: ProcessMeetingMinuteRequest,
    project_id: string,
    signal?: AbortSignal
  ): Promise<GetOneMeetingMinuteResponse> => {
    const formData = buildProcessFormData(data);
    const res = await axiosInstance.post(
      `/api/core/v1/meeting-minutes/process/${project_id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        signal,
      }
    );
    return res.data.data as GetOneMeetingMinuteResponse;
  },

  sendEmail: async (
    minuteId: number,
    data: SendMeetingMinuteEmailRequest
  ): Promise<SendMeetingMinuteEmailResponse> => {
    if (data.attachment) {
      console.log('[SendEmail API] Sending with file:', {
        fileName: data.attachment.name,
        fileSize: data.attachment.size,
        fileType: data.attachment.type,
      });
      const formData = new FormData();
      // formData.append('recipientEmails', JSON.stringify(data.recipientEmails));
      formData.append('subject', data.subject);
      formData.append('message', data.message);
      formData.append('attachment', data.attachment);
      const res = await axiosInstance.post(
        `/api/core/v1/meeting-minutes/${minuteId}/send-email`,
        formData
      );
      return res.data as SendMeetingMinuteEmailResponse;
    } else {
      const { attachment, ...jsonData } = data;
      const res = await sendPost(
        `/api/core/v1/meeting-minutes/${minuteId}/send-email`,
        jsonData
      );
      return res.data as SendMeetingMinuteEmailResponse;
    }
  },

  getDownloadUrl: async (
    minuteId: number
  ): Promise<GetMeetingMinuteFileResponse> => {
    const res = await sendGet(`/api/core/v1/meeting-minutes/${minuteId}/file`);
    return res.data as GetMeetingMinuteFileResponse;
  },

};
