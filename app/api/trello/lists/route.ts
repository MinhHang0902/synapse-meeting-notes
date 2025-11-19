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
          message: "Missing Trello configuration (TRELLO_API_KEY required).",
        },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(req.url);
    const boardId = searchParams.get("boardId");

    if (!boardId) {
      return NextResponse.json({ message: "Missing boardId in request." }, { status: 400 });
    }

    const appAccessToken = requireAppAccessToken();
    const credential = await fetchTrelloCredential(appAccessToken);
    if (!credential) {
      return NextResponse.json(
        { message: "Account not connected to Trello." },
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
      throw new Error(`Unable to fetch list from Trello: ${res.status} ${text}`);
    }

    const lists = (await res.json()) as TrelloList[];

    return NextResponse.json({ lists }, { status: 200 });
  } catch (error) {
    console.error("[Trello Lists] error", error);
    if (error instanceof Error && error.message === "APP_UNAUTHORIZED") {
      return NextResponse.json({ message: "Session has expired." }, { status: 401 });
    }
    const message =
      error instanceof Error ? error.message : "Unable to fetch Trello list.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
