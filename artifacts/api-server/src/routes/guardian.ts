// Guardian Monitoring — WhatsApp alert endpoints
import { Router, type IRouter } from "express";
import { sendWhatsAppAlert } from "../lib/whatsapp.js";

const router: IRouter = Router();

type AlertPayload = {
  type: "inactivity" | "streak_broken" | "low_mood" | "custom";
  userId?: string;
  deviceId?: string;
  message?: string;
  phone?: string;
};

const ALERT_TEMPLATES: Record<string, (data: AlertPayload) => string> = {
  inactivity: (d) =>
    `⚠️ MeuEu Guardian\n\nO usuário ${d.deviceId ?? d.userId ?? "desconhecido"} não realizou check-in nas últimas 24h.\n\nPor favor, verifique se está tudo bem.`,
  streak_broken: (d) =>
    `💔 MeuEu Guardian\n\nA sequência de progresso do usuário ${d.deviceId ?? d.userId ?? "desconhecido"} foi interrompida.\n\nEncoraje-o a retomar a jornada!`,
  low_mood: (d) =>
    `😔 MeuEu Guardian\n\nO usuário ${d.deviceId ?? d.userId ?? "desconhecido"} registrou humor muito baixo hoje.\n\nConsidere entrar em contato para oferecer apoio.`,
  custom: (d) => d.message ?? "Alerta do MeuEu Guardian",
};

// POST /api/guardian/alert
router.post("/alert", async (req, res) => {
  const payload = req.body as AlertPayload;

  if (!payload.type) {
    res.status(400).json({ error: "type is required" });
    return;
  }

  const templateFn = ALERT_TEMPLATES[payload.type];
  if (!templateFn) {
    res.status(400).json({ error: `Unknown alert type: ${payload.type}` });
    return;
  }

  const message = templateFn(payload);

  try {
    await sendWhatsAppAlert(message, payload.phone);
    res.json({ ok: true, message });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[guardian] WhatsApp send failed:", errMsg);
    res.status(502).json({ error: errMsg });
  }
});

// POST /api/guardian/test — smoke test to verify credentials
router.post("/test", async (req, res) => {
  const phone = (req.body as { phone?: string }).phone;
  try {
    await sendWhatsAppAlert(
      "✅ MeuEu Guardian — conexão Z-API funcionando corretamente!",
      phone,
    );
    res.json({ ok: true });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: errMsg });
  }
});

export default router;
