export function getApiUrl(): string {
  const raw = process.env.EXPO_PUBLIC_DOMAIN ?? "";
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
}
