import { NextRequest, NextResponse } from "next/server";

import type { TrelloExportRequest, TrelloExportResponse } from "@/types/interfaces/trello";
import { fetchTrelloCredential, requireAppAccessToken } from "../_utils";

const TRELLO_API_BASE = "https://api.trello.com/1";

const trelloKey = process.env.TRELLO_API_KEY;

function validateRequestBody(body: TrelloExportRequest): asserts body is TrelloExportRequest {
  if (!body) {
    throw new Error("Payload trống");
  }
  if (!body.meetingTitle || typeof body.meetingTitle !== "string") {
    throw new Error("Thiếu meetingTitle");
  }
  if (!body.listId || typeof body.listId !== "string") {
    throw new Error("Thiếu listId");
  }
  if (!Array.isArray(body.actionItems)) {
    throw new Error("actionItems phải là mảng");
  }
}

async function createTrelloCard({
  title,
  description,
  dueDate,
  listId,
  accessToken,
}: {
  title: string;
  description: string;
  dueDate?: string;
  listId: string;
  accessToken: string;
}) {
  if (!trelloKey) {
    throw new Error("Thiếu cấu hình Trello (TRELLO_API_KEY)");
  }

  const params = new URLSearchParams();
  params.set("key", trelloKey);
  params.set("token", accessToken);
  params.set("idList", listId);
  params.set("name", title.slice(0, 256));
  params.set("desc", description.slice(0, 16384)); // Trello giới hạn 16384 ký tự
  params.set("pos", "bottom");

  if (dueDate && !Number.isNaN(new Date(dueDate).getTime())) {
    params.set("due", new Date(dueDate).toISOString());
  }

  const res = await fetch(`${TRELLO_API_BASE}/cards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Trello trả về ${res.status}: ${errorText}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!trelloKey) {
      return NextResponse.json(
        { message: "Thiếu cấu hình Trello (cần TRELLO_API_KEY)." },
        { status: 500 },
      );
    }

    const body = (await req.json()) as TrelloExportRequest;
    validateRequestBody(body);

    const cleanActionItems = body.actionItems
      .map((item) => ({
        description: item.description?.trim() ?? "",
        assignee: item.assignee?.trim() ?? "",
        dueDate: item.dueDate ?? "",
      }))
      .filter((item) => item.description.length > 0);

    if (cleanActionItems.length === 0) {
      return NextResponse.json(
        { message: "Không có action item hợp lệ để tạo card Trello." },
        { status: 400 },
      );
    }

    const appAccessToken = requireAppAccessToken();
    const credential = await fetchTrelloCredential(appAccessToken);
    if (!credential) {
      return NextResponse.json(
        { message: "Tài khoản chưa kết nối Trello." },
        { status: 404 },
      );
    }

    let createdCount = 0;
    for (const actionItem of cleanActionItems) {
      const cardName = actionItem.assignee
        ? `${actionItem.assignee} – ${actionItem.description}`
        : actionItem.description;
      const noteLines = [
        `Meeting: ${body.meetingTitle}`,
        actionItem.assignee ? `Assignee: ${actionItem.assignee}` : null,
        actionItem.dueDate ? `Due date: ${actionItem.dueDate}` : null,
      ].filter(Boolean);

      await createTrelloCard({
        title: cardName,
        description: noteLines.join("\n"),
        dueDate: actionItem.dueDate,
        listId: body.listId,
        accessToken: credential.accessToken,
      });

      createdCount += 1;
    }

    const response: TrelloExportResponse = { cardsCreated: createdCount };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[Trello Export] error", error);
    if (error instanceof Error && error.message === "APP_UNAUTHORIZED") {
      return NextResponse.json({ message: "Phiên đăng nhập đã hết hạn." }, { status: 401 });
    }
    const message =
      error instanceof Error ? error.message : "Xuất Trello thất bại do lỗi không xác định";
    return NextResponse.json({ message }, { status: 500 });
  }
}

