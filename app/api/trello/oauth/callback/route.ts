import { createHmac } from "crypto";
import OAuth from "oauth-1.0a";
import { NextRequest, NextResponse } from "next/server";

import configs from "@/constants/config";
import type { TrelloIntegrationCredential, TrelloIntegrationMember } from "@/types/interfaces/trello";

const TRELLO_ACCESS_TOKEN_URL = "https://trello.com/1/OAuthGetAccessToken";
const TRELLO_API_BASE = "https://api.trello.com/1";

const trelloKey = process.env.TRELLO_API_KEY;
const trelloSecret = process.env.TRELLO_API_SECRET;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const oauth = new OAuth({
  consumer: { key: trelloKey ?? "", secret: trelloSecret ?? "" },
  signature_method: "HMAC-SHA1",
  hash_function(baseString, key) {
    return createHmac("sha1", key).update(baseString).digest("base64");
  },
});

async function fetchMemberProfile(accessToken: string): Promise<TrelloIntegrationMember> {
  if (!trelloKey) {
    return {};
  }
  const params = new URLSearchParams();
  params.set("key", trelloKey);
  params.set("token", accessToken);
  params.set("fields", "id,username,fullName");

  const res = await fetch(`${TRELLO_API_BASE}/members/me?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Không thể tải thông tin Trello user: ${res.status} ${text}`);
  }
  const data = await res.json();
  return {
    id: data.id,
    username: data.username,
    fullName: data.fullName,
  };
}

export async function GET(req: NextRequest) {
  try {
    if (!trelloKey || !trelloSecret) {
      return NextResponse.json(
        { message: "Thiếu cấu hình Trello (cần TRELLO_API_KEY, TRELLO_API_SECRET)." },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(req.url);
    const oauthToken = searchParams.get("oauth_token");
    const oauthVerifier = searchParams.get("oauth_verifier");

    if (!oauthToken || !oauthVerifier) {
      return NextResponse.redirect(new URL("/", appUrl));
    }

    const cookieToken = req.cookies.get("trello_oauth_token")?.value;
    const cookieSecret = req.cookies.get("trello_oauth_secret")?.value;
    const returnTo = req.cookies.get("trello_return_to")?.value ?? "/";

    if (!cookieToken || !cookieSecret || cookieToken !== oauthToken) {
      throw new Error("Session Trello OAuth không hợp lệ hoặc đã hết hạn.");
    }

    const requestData = {
      url: TRELLO_ACCESS_TOKEN_URL,
      method: "POST",
      data: {
        oauth_verifier: oauthVerifier,
      },
    };

    const authHeader = oauth.toHeader(
      oauth.authorize(requestData, {
        key: oauthToken,
        secret: cookieSecret,
      }),
    );

    const res = await fetch(TRELLO_ACCESS_TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: authHeader.Authorization,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ oauth_verifier: oauthVerifier }).toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Không thể lấy access token Trello: ${res.status} ${text}`);
    }

    const text = await res.text();
    const parsed = Object.fromEntries(new URLSearchParams(text));
    const accessToken = parsed.oauth_token;
    const accessTokenSecret = parsed.oauth_token_secret;

    if (!accessToken) {
      throw new Error("Không nhận được access token Trello.");
    }

    const member = await fetchMemberProfile(accessToken);

    const appAccessToken = req.cookies.get("access_token")?.value;
    if (!appAccessToken) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    const payload: TrelloIntegrationCredential = {
      accessToken,
      tokenSecret: accessTokenSecret,
      member,
    };

    const backendRes = await fetch(`${configs.API_DOMAIN}/api/core/v1/integration/trello`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${appAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: payload.accessToken,
        tokenSecret: payload.tokenSecret,
        memberId: payload.member?.id,
        memberUsername: payload.member?.username,
        memberFullName: payload.member?.fullName,
      }),
    });

    if (!backendRes.ok) {
      const text = await backendRes.text();
      throw new Error(`Không thể lưu kết nối Trello: ${backendRes.status} ${text}`);
    }

    const target = new URL(returnTo, appUrl);
    target.searchParams.set("trelloConnected", "1");

    const response = NextResponse.redirect(target);
    response.cookies.delete("trello_oauth_token");
    response.cookies.delete("trello_oauth_secret");
    response.cookies.delete("trello_return_to");

    return response;
  } catch (error) {
    console.error("[Trello OAuth] callback error", error);
    const target = new URL("/", appUrl);
    target.searchParams.set("trelloConnected", "0");
    if (error instanceof Error) {
      target.searchParams.set("trelloError", error.message);
    }
    const response = NextResponse.redirect(target);
    response.cookies.delete("trello_oauth_token");
    response.cookies.delete("trello_oauth_secret");
    response.cookies.delete("trello_return_to");
    return response;
  }
}


