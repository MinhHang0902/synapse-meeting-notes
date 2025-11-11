import { NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";

const LIVEKIT_URL = process.env.LIVEKIT_URL ?? process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY ?? "";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET ?? "";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload không hợp lệ." }, { status: 400 });
  }

  const projectId = Number((body as { projectId?: number })?.projectId);
  if (!Number.isFinite(projectId) || projectId <= 0) {
    return NextResponse.json({ error: "projectId không hợp lệ." }, { status: 400 });
  }

  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return NextResponse.json(
      { error: "LiveKit chưa được cấu hình." },
      { status: 500 }
    );
  }

  const roomService = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
  const roomName = `project-${projectId}`;

  try {
    await roomService.deleteRoom(roomName);
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
      return NextResponse.json({ success: true });
    }

    console.error("Không thể kết thúc phòng LiveKit:", error);
    return NextResponse.json({ error: "Không thể kết thúc phòng." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

