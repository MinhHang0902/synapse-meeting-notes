import { NextRequest, NextResponse } from "next/server";

import type { TrelloBoard } from "@/types/interfaces/trello";
import { fetchTrelloCredential, requireAppAccessToken } from "../_utils";

const TRELLO_API_BASE = "https://api.trello.com/1";

const trelloKey = process.env.TRELLO_API_KEY;

export async function GET(_req: NextRequest) {
  try {
    if (!trelloKey) {
      return NextResponse.json(
        { message: "Thiếu cấu hình Trello (cần TRELLO_API_KEY)." },
        { status: 500 },
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

    const params = new URLSearchParams();
    params.set("key", trelloKey);
    params.set("token", credential.accessToken);
    params.set("fields", "name,url");
    params.set("filter", "open");

    const res = await fetch(`${TRELLO_API_BASE}/members/me/boards?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Không thể lấy danh sách board từ Trello: ${res.status} ${text}`);
    }

    const boards = (await res.json()) as TrelloBoard[];

    return NextResponse.json({ boards }, { status: 200 });
  } catch (error) {
    console.error("[Trello Boards] error", error);
    if (error instanceof Error && error.message === "APP_UNAUTHORIZED") {
      return NextResponse.json({ message: "Phiên đăng nhập đã hết hạn." }, { status: 401 });
    }
    const message =
      error instanceof Error ? error.message : "Không thể lấy danh sách board Trello.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

