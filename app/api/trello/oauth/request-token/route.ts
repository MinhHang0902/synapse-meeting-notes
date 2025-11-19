import { createHmac } from "crypto";
import OAuth from "oauth-1.0a";
import { NextRequest, NextResponse } from "next/server";

const TRELLO_REQUEST_TOKEN_URL = "https://trello.com/1/OAuthGetRequestToken";
const TRELLO_AUTHORIZE_URL = "https://trello.com/1/OAuthAuthorizeToken";

const trelloKey = process.env.TRELLO_API_KEY;
const trelloSecret = process.env.TRELLO_API_SECRET;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const trelloAppName = process.env.TRELLO_APP_NAME ?? "Synapse Meeting Notes";

const oauth = new OAuth({
  consumer: { key: trelloKey ?? "", secret: trelloSecret ?? "" },
  signature_method: "HMAC-SHA1",
  hash_function(baseString, key) {
    return createHmac("sha1", key).update(baseString).digest("base64");
  },
});

export async function GET(req: NextRequest) {
  try {
    if (!trelloKey || !trelloSecret) {
      return NextResponse.json(
        { message: "Missing Trello configuration (TRELLO_API_KEY, TRELLO_API_SECRET required)." },
        { status: 500 },
      );
    }

    const callbackUrl = new URL("/api/trello/oauth/callback", appUrl).toString();

    const returnUrlParam = req.nextUrl.searchParams.get("returnUrl");
    let sanitizedReturnUrl = "/";
    if (returnUrlParam) {
      try {
        const parsed = new URL(returnUrlParam, appUrl);
        sanitizedReturnUrl = `${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        sanitizedReturnUrl = "/";
      }
    } else if (req.headers.get("referer")) {
      try {
        const parsed = new URL(req.headers.get("referer") as string);
        sanitizedReturnUrl = `${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        sanitizedReturnUrl = "/";
      }
    }

    const bodyParams = {
      oauth_callback: callbackUrl,
    };

    const authHeader = oauth.toHeader(
      oauth.authorize(
        {
          url: TRELLO_REQUEST_TOKEN_URL,
          method: "POST",
          data: bodyParams,
        },
        undefined,
      ),
    );

    const res = await fetch(TRELLO_REQUEST_TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: authHeader.Authorization,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(bodyParams).toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Unable to initialize Trello OAuth: ${res.status} ${text}`);
    }

    const text = await res.text();
    const parsed = Object.fromEntries(new URLSearchParams(text));
    const requestToken = parsed.oauth_token;
    const requestTokenSecret = parsed.oauth_token_secret;

    if (!requestToken || !requestTokenSecret) {
      throw new Error("Did not receive request token from Trello.");
    }

    const redirectParams = new URLSearchParams({
      oauth_token: requestToken,
      name: trelloAppName,
      scope: "read,write",
      expiration: "never",
    });
    const redirectUrl = `${TRELLO_AUTHORIZE_URL}?${redirectParams.toString()}`;

    const response = NextResponse.json({ redirectUrl });
    response.cookies.set("trello_oauth_token", requestToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10,
    });
    response.cookies.set("trello_oauth_secret", requestTokenSecret, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10,
    });
    response.cookies.set("trello_return_to", sanitizedReturnUrl, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10,
    });

    return response;
  } catch (error) {
    console.error("[Trello OAuth] request-token error", error);
    if (error instanceof Error) {
      console.error("[Trello OAuth] request-token stack", error.stack);
    }
    const message =
      error instanceof Error ? error.message : "Unable to initialize Trello OAuth session.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
