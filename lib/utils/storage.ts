export function setSessionItemWithExpiry(key: string, value: any, ttlSeconds: number) {
    const item = { value, expiry: Date.now() + ttlSeconds * 1000 };
    sessionStorage.setItem(key, JSON.stringify(item));
}
export function getSessionItemWithExpiry<T = any>(key: string): T | null {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    try {
        const item = JSON.parse(raw);
        if (Date.now() > item.expiry) {
            sessionStorage.removeItem(key);
            return null;
        }
        return item.value as T;
    } catch {
        return null;
    }
}