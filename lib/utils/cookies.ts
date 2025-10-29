import Cookies from "js-cookie";

const isProd = process.env.NODE_ENV === "production";

export function setAccessToken(token: string, days = 7) {
  Cookies.set("access_token", token, {
    expires: days,
    secure: isProd,
    sameSite: "lax",
  });
}

export function setRefreshToken(token: string, days = 30) {
  Cookies.set("refresh_token", token, {
    expires: days,
    secure: isProd,
    sameSite: "lax",
  });
}

export function getAccessToken(): string | undefined {
  return Cookies.get("access_token");
}

export function getRefreshToken(): string | undefined {
  return Cookies.get("refresh_token");
}

export function clearTokens() {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
}
