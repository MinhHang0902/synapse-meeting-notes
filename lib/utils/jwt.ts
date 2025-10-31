export function decodeJwt<T = any>(token: string): T | null {
    try {
        // JWT format: header.payload.signature
        const payload = token.split(".")[1];
        if (!payload) return null;
        const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        return json as T;
    } catch {
        return null;
    }
}

export function isTokenExpired(token: string, skewSeconds = 30) {
    const payload = decodeJwt<{ exp?: number }>(token);
    if (!payload?.exp) return true;
    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp <= nowSec + skewSeconds;
}