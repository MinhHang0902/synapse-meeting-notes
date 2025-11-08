import axios from "axios";
import type {
  TrelloIntegrationCredential,
  TrelloIntegrationStatus,
} from "@/types/interfaces/trello";
import { sendDelete, sendGet, sendPost } from "./axios";

export const TrelloIntegrationApi = {
  async getStatus(): Promise<TrelloIntegrationStatus> {
    try {
      const res = await sendGet("/api/core/v1/integration/trello/status");
      return res.data as TrelloIntegrationStatus;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return { connected: false };
      }
      throw error;
    }
  },

  async getCredential(): Promise<TrelloIntegrationCredential> {
    const res = await sendGet("/api/core/v1/integration/trello/credential");
    return res.data as TrelloIntegrationCredential;
  },

  async upsert(payload: {
    accessToken: string;
    tokenSecret?: string;
    memberId?: string;
    memberUsername?: string;
    memberFullName?: string;
  }) {
    await sendPost("/api/core/v1/integration/trello", payload);
  },

  async disconnect() {
    await sendDelete("/api/core/v1/integration/trello");
  },
};


