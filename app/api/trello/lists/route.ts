import { NextRequest, NextResponse } from "next/server";

import type { TrelloList } from "@/types/interfaces/trello";
import { fetchTrelloCredential, requireAppAccessToken } from "../_utils";

const TRELLO_API_BASE = "https://api.trello.com/1";

const trelloKey = process.env.TRELLO_API_KEY;

export async function GET(req: NextRequest) {
  try {
    if (!trelloKey) {
      return NextResponse.json(
        {
          message: "Thiếu cấu hình Trello (cần TRELLO_API_KEY).",
        },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(req.url);
    const boardId = searchParams.get("boardId");

    if (!boardId) {
      return NextResponse.json({ message: "Thiếu boardId trong request." }, { status: 400 });
    }

    const appAccessToken = requireAppAccessToken();
    const credential = await fetchTrelloCredential(appAccessToken);
    if (!credential) {
      return NextResponse.json(
        { message: "Tài khoản chưa kết nối Trello." },
        { status: 404 },
      );
    }

    const params = new URLSearchParams();
    params.set("key", trelloKey);
    params.set("token", credential.accessToken);

    const res = await fetch(`${TRELLO_API_BASE}/boards/${boardId}/lists?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Không thể lấy danh sách list từ Trello: ${res.status} ${text}`);
    }

    const lists = (await res.json()) as TrelloList[];

    return NextResponse.json({ lists }, { status: 200 });
  } catch (error) {
    console.error("[Trello Lists] error", error);
    if (error instanceof Error && error.message === "APP_UNAUTHORIZED") {
      return NextResponse.json({ message: "Phiên đăng nhập đã hết hạn." }, { status: 401 });
    }
    const message =
      error instanceof Error ? error.message : "Không thể lấy danh sách list Trello.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

