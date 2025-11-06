// lib/api/meeting.ts
import {
  MeetingMinutesRequest,
  MeetingMinutesResponse,
  UpdateMeetingMinuteRequest,
  ProcessMeetingMinuteRequest,
  SendMeetingMinuteEmailRequest,
  SendMeetingMinuteEmailResponse,
  GetOneMeetingMinuteResponse,
} from "@/types/interfaces/meeting";
import { sendGet, sendPost, sendDelete, sendPut, axiosInstance } from "./axios";
import { buildProcessFormData } from "./form-data";

/** Chuẩn như UsersApi, prefix base: /api/core/v1 */
export const MeetingsApi = {
  /** GET /meeting-minutes */
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

  /** GET /meeting-minutes/:minuteId */
  detail: async (minuteId: number): Promise<GetOneMeetingMinuteResponse> => {
    const res = await sendGet(`/api/core/v1/meeting-minutes/${minuteId}`);
    return res.data as GetOneMeetingMinuteResponse;
  },

  /** PUT /meeting-minutes/:minuteId */
  update: async (
    minuteId: number,
    data: UpdateMeetingMinuteRequest
  ): Promise<GetOneMeetingMinuteResponse> => {
    const res = await sendPut(`/api/core/v1/meeting-minutes/${minuteId}`, data);
    return res.data as GetOneMeetingMinuteResponse;
  },

  /** DELETE /meeting-minutes/:minuteId */
  remove: async (minuteId: number): Promise<void> => {
    await sendDelete(`/api/core/v1/meeting-minutes/${minuteId}`);
  },

  /** POST /meeting-minutes/process */
  process: async (
    data: ProcessMeetingMinuteRequest,
    signal?: AbortSignal
  ): Promise<GetOneMeetingMinuteResponse> => {
    const formData = buildProcessFormData(data);
    const res = await axiosInstance.post(
      "/api/core/v1/meeting-minutes/process",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        signal,
      }
    );
    return res.data.data as GetOneMeetingMinuteResponse;
  },

  /** POST /meeting-minutes/:minuteId/send-email */
  sendEmail: async (
    minuteId: number,
    data: SendMeetingMinuteEmailRequest
  ): Promise<SendMeetingMinuteEmailResponse> => {
    const res = await sendPost(
      `/api/core/v1/meeting-minutes/${minuteId}/send-email`,
      data
    );
    return res.data as SendMeetingMinuteEmailResponse;
  },

  /** GET /meeting-minutes/:minuteId/file → { url } */
  getDownloadUrl: async (
    minuteId: number
  ): Promise<{ url: string }> => {
    const res = await sendGet(`/api/core/v1/meeting-minutes/${minuteId}/file`);
    return res.data as { url: string };
  },
};
