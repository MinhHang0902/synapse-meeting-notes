export interface TrelloExportActionItem {
  description: string;
  assignee?: string;
  dueDate?: string;
}

export interface TrelloExportRequest {
  meetingTitle: string;
  actionItems: TrelloExportActionItem[];
  listId: string;
  boardId?: string;
}

export interface TrelloExportResponse {
  cardsCreated: number;
}

export interface TrelloList {
  id: string;
  name: string;
}

export interface TrelloBoard {
  id: string;
  name: string;
  url: string;
}

export interface TrelloIntegrationMember {
  id?: string | null;
  username?: string | null;
  fullName?: string | null;
}

export interface TrelloIntegrationStatus {
  connected: boolean;
  member?: TrelloIntegrationMember;
  connectedAt?: string;
}

export interface TrelloIntegrationCredential {
  accessToken: string;
  tokenSecret?: string | null;
  member?: TrelloIntegrationMember;
}



