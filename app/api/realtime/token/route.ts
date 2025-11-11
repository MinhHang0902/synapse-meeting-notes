import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { randomUUID } from "crypto";

import configs from "@/constants/config";
import type { RealtimeTokenRequest, RealtimeTokenResponse } from "@/types/interfaces/realtime";

export const runtime = "nodejs";

const LIVEKIT_URL = process.env.LIVEKIT_URL ?? process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY ?? "";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET ?? "";

const normalizeApiDomain = (domain?: string | null) => {
  if (!domain) return "";
  return domain.endsWith("/") ? domain.slice(0, -1) : domain;
};

const getProjectMembers = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.project_membersAndRoles)) return payload.project_membersAndRoles;
  if (Array.isArray(payload.data)) {
    return getProjectMembers(payload.data);
  }
  if (payload.project && Array.isArray(payload.project.project_membersAndRoles)) {
    return payload.project.project_membersAndRoles;
  }
  return [];
};

const getActiveParticipants = async (roomName: string) => {
  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return [];
  }

  const roomService = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
  try {
    const participants = await roomService.listParticipants(roomName);
    return participants;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("404") || message.includes("not found")) {
      return [];
    }
    throw error;
  }
};

export async function POST(req: Request) {
  let body: RealtimeTokenRequest;
  try {
    body = (await req.json()) as RealtimeTokenRequest;
  } catch {
    return NextResponse.json({ error: "Payload không hợp lệ." }, { status: 400 });
  }

  if (!body?.projectId) {
    return NextResponse.json({ error: "projectId là bắt buộc." }, { status: 400 });
  }

  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return NextResponse.json(
      { error: "LiveKit chưa được cấu hình. Vui lòng kiểm tra biến môi trường." },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const appAccessToken = cookieStore.get("access_token")?.value;

  if (!appAccessToken) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  }

  const apiDomain = normalizeApiDomain(configs.API_DOMAIN);
  if (!apiDomain) {
    return NextResponse.json({ error: "Chưa cấu hình API backend." }, { status: 500 });
  }

  const [userRes, projectRes] = await Promise.all([
    fetch(`${apiDomain}/api/core/v1/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${appAccessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }),
    fetch(`${apiDomain}/api/core/v1/projects/${body.projectId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${appAccessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }),
  ]);

  if (userRes.status === 401) {
    return NextResponse.json({ error: "Phiên đăng nhập đã hết hạn." }, { status: 401 });
  }

  if (!userRes.ok) {
    const details = await userRes.text();
    return NextResponse.json(
      { error: "Không thể lấy thông tin người dùng.", details },
      { status: userRes.status }
    );
  }

  if (projectRes.status === 404) {
    return NextResponse.json({ error: "Không tìm thấy dự án." }, { status: 404 });
  }

  if (!projectRes.ok) {
    const details = await projectRes.text();
    return NextResponse.json(
      { error: "Không thể lấy thông tin dự án.", details },
      { status: projectRes.status }
    );
  }

  const userPayload = await userRes.json();
  const userData = userPayload?.data ?? userPayload;

  if (!userData?.user_id) {
    return NextResponse.json({ error: "Thiếu thông tin tài khoản." }, { status: 500 });
  }

  const projectPayload = await projectRes.json();
  const projectData = projectPayload?.data ?? projectPayload;
  const members = getProjectMembers(projectData);

  const isMember = members.some((member: any) => {
    if (!member) return false;
    if (typeof member.user_id === "number") {
      return member.user_id === userData.user_id;
    }
    if (typeof member.user?.user_id === "number") {
      return member.user.user_id === userData.user_id;
    }
    return false;
  });

  if (!isMember) {
    return NextResponse.json(
      { error: "Bạn không có quyền tham gia phòng họp của dự án này." },
      { status: 403 }
    );
  }

  const roomName = body.roomName?.trim() || `project-${body.projectId}`;
  const participantName = body.participantName?.trim() || userData.name || userData.email || `${userData.user_id}`;
  const identity = `${userData.user_id}-${randomUUID()}`;

  const accessToken = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
    name: participantName,
    metadata: JSON.stringify({
      name: userData.name ?? null,
      email: userData.email ?? null,
      projectId: body.projectId,
      roomName,
      userId: userData.user_id,
    }),
  });

  accessToken.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  const token = await accessToken.toJwt();

  let activeParticipantIdentities: string[] = [];
  let hostIdentity: string | null = null;
  try {
    const participants = await getActiveParticipants(roomName);
    activeParticipantIdentities = participants
      .map((participant) => participant.identity)
      .filter((value): value is string => Boolean(value));
    hostIdentity = activeParticipantIdentities[0] ?? null;
  } catch (error) {
    console.error("Không thể lấy danh sách participant:", error);
  }

  const isHostCandidate = activeParticipantIdentities.length === 0;

  const payload: RealtimeTokenResponse = {
    token,
    url: LIVEKIT_URL,
    identity,
    metadata: {
      name: userData.name ?? null,
      email: userData.email ?? null,
      projectId: body.projectId,
      roomName,
      userId: userData.user_id,
    },
    isHostCandidate,
    activeParticipantCount: activeParticipantIdentities.length,
    activeParticipantIdentities,
    hostIdentity,
  };

  return NextResponse.json(payload);
}

