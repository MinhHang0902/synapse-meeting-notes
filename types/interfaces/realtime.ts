export interface RealtimeTokenRequest {
  projectId: number;
  roomName?: string;
  participantName?: string;
}

export interface RealtimeTokenMetadata {
  name?: string | null;
  email?: string | null;
  projectId: number;
  roomName: string;
  userId: number;
}

export interface RealtimeTokenResponse {
  token: string;
  url: string;
  identity: string;
  metadata: RealtimeTokenMetadata;
  isHostCandidate: boolean;
  activeParticipantCount: number;
  activeParticipantIdentities: string[];
  hostIdentity?: string | null;
}

export interface RealtimeRecordingAsset {
  blob: Blob;
  url: string;
  mimeType: string;
  originalMimeType?: string;
  size: number;
  durationMs: number;
  startedAt: Date | null;
  createdAt: Date;
  fileName: string;
}

