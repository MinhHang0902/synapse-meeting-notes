import { NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";

const LIVEKIT_URL = process.env.LIVEKIT_URL ?? process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY ?? "";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET ?? "";

const getRoomParticipants = async (roomName: string) => {
  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return [];
  }

  const roomService = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
  try {
    const participants = await roomService.listParticipants(roomName);
    return participants;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? Number((error as { status?: number }).status)
        : undefined;
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: string }).code).toLowerCase()
        : "";

    if (
      message.includes("404") ||
      message.includes("not found") ||
      status === 404 ||
      code === "not_found"
    ) {
      return [];
    }
    throw error;
  }
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const projectIdParam = url.searchParams.get("projectId");

  const projectId = Number(projectIdParam);
  if (!Number.isFinite(projectId) || projectId <= 0) {
    return NextResponse.json({ error: "projectId không hợp lệ." }, { status: 400 });
  }

  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return NextResponse.json(
      { error: "LiveKit chưa được cấu hình." },
      { status: 500 }
    );
  }

  const roomName = `project-${projectId}`;

  try {
    const participants = await getRoomParticipants(roomName);
    const activeParticipantIdentities = participants
      .map((participant) => participant.identity)
      .filter((value): value is string => Boolean(value));

    return NextResponse.json({
      meetingActive: activeParticipantIdentities.length > 0,
      activeParticipantCount: activeParticipantIdentities.length,
      hostIdentity: activeParticipantIdentities[0] ?? null,
    });
  } catch (error) {
    console.error("Không thể lấy trạng thái phòng LiveKit:", error);
    return NextResponse.json(
      { error: "Không thể lấy trạng thái cuộc họp." },
      { status: 500 }
    );
  }
}

