// Z-API WhatsApp integration
const ZAPI_INSTANCE_ID = process.env["ZAPI_INSTANCE_ID"];
const ZAPI_TOKEN = process.env["ZAPI_TOKEN"];
const ALERT_PHONE = process.env["ALERT_PHONE"];

function getZapiUrl(): string {
  if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) {
    throw new Error("ZAPI_INSTANCE_ID and ZAPI_TOKEN env vars are required");
  }
  return `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-text`;
}

export async function sendWhatsAppAlert(message: string, phone?: string): Promise<void> {
  const to = phone ?? ALERT_PHONE;
  if (!to) {
    throw new Error("ALERT_PHONE env var is required or pass phone explicitly");
  }

  const url = getZapiUrl();
  const body = JSON.stringify({ phone: to, message });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Z-API error ${res.status}: ${text}`);
  }
}
