import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Resend } from "resend";
import { db, usersTable, refreshTokensTable, dailyCheckinsTable, coachMessagesTable, planLogsTable } from "@workspace/db";
import { passwordResetTokensTable } from "@workspace/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY não configurada.");
  return new Resend(key);
}

const router: IRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET ?? "meueu_dev_secret_change_in_production";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_DAYS = 30;

function generateAccessToken(userId: number, email: string, name: string) {
  return jwt.sign({ userId, email, name }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function generateRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}

async function createRefreshToken(userId: number): Promise<string> {
  const token = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(refreshTokensTable).values({ userId, token, expiresAt });
  return token;
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { email, name, password, deviceId } = req.body as {
    email: string;
    name: string;
    password: string;
    deviceId?: string;
  };

  if (!email || !name || !password) {
    res.status(400).json({ error: "Email, nome e senha são obrigatórios." });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
    return;
  }

  try {
    const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim())).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Este email já está cadastrado." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(usersTable).values({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      passwordHash,
      deviceId: deviceId ?? null,
    }).returning({ id: usersTable.id, email: usersTable.email, name: usersTable.name });

    const accessToken = generateAccessToken(user.id, user.email, user.name);
    const refreshToken = await createRefreshToken(user.id);

    res.json({ success: true, accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Erro ao criar conta. Tente novamente." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email e senha são obrigatórios." });
    return;
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim())).limit(1);
    if (!user) {
      res.status(401).json({ error: "Email ou senha incorretos." });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Email ou senha incorretos." });
      return;
    }

    const accessToken = generateAccessToken(user.id, user.email, user.name);
    const refreshToken = await createRefreshToken(user.id);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Erro ao fazer login. Tente novamente." });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body as { refreshToken: string };

  if (!refreshToken) {
    res.status(400).json({ error: "refreshToken é obrigatório." });
    return;
  }

  try {
    const [stored] = await db
      .select({ id: refreshTokensTable.id, userId: refreshTokensTable.userId, expiresAt: refreshTokensTable.expiresAt })
      .from(refreshTokensTable)
      .where(and(eq(refreshTokensTable.token, refreshToken), gt(refreshTokensTable.expiresAt, new Date())))
      .limit(1);

    if (!stored) {
      res.status(401).json({ error: "Token inválido ou expirado." });
      return;
    }

    const [user] = await db.select({ id: usersTable.id, email: usersTable.email, name: usersTable.name })
      .from(usersTable).where(eq(usersTable.id, stored.userId)).limit(1);

    if (!user) {
      res.status(401).json({ error: "Usuário não encontrado." });
      return;
    }

    // Rotate: delete old token, issue new pair
    await db.delete(refreshTokensTable).where(eq(refreshTokensTable.id, stored.id));
    const newAccessToken = generateAccessToken(user.id, user.email, user.name);
    const newRefreshToken = await createRefreshToken(user.id);

    res.json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ error: "Erro ao renovar sessão." });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body as { email?: string };

  // Always return 200 to avoid email enumeration
  res.json({ success: true, message: "Se este email estiver cadastrado, você receberá um link em breve." });

  if (!email) return;

  try {
    const [user] = await db
      .select({ id: usersTable.id, email: usersTable.email, name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) return;

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResetTokensTable).values({
      userId: user.id,
      token,
      expiresAt,
    });

    const resetLink = `https://personal-growth-navigator.replit.app/auth/reset-password?token=${token}`;

    await getResend().emails.send({
      from: "onboarding@resend.dev",
      to: user.email,
      subject: "Redefinir sua senha — Jornada",
      text: `Olá, ${user.name}!

Recebemos uma solicitação para redefinir a senha da sua conta no Jornada.

Clique no link abaixo para criar uma nova senha:
${resetLink}

O link é válido por 1 hora. Se você não solicitou a redefinição, ignore este email — sua senha permanece a mesma.

Equipe Jornada`,
    });
  } catch (err) {
    console.error("Forgot-password error:", err);
    // Silent: user already received 200
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body as { token?: string; newPassword?: string };

  if (!token || !newPassword) {
    res.status(400).json({ error: "Token e nova senha são obrigatórios." });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
    return;
  }

  try {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokensTable)
      .where(
        and(
          eq(passwordResetTokensTable.token, token),
          gt(passwordResetTokensTable.expiresAt, new Date()),
          isNull(passwordResetTokensTable.usedAt)
        )
      )
      .limit(1);

    if (!resetToken) {
      res.status(400).json({ error: "Link inválido ou expirado. Solicite um novo." });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await db.update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.id, resetToken.userId));

    await db.update(passwordResetTokensTable)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokensTable.id, resetToken.id));

    res.json({ success: true, message: "Senha redefinida com sucesso." });
  } catch (err) {
    console.error("Reset-password error:", err);
    res.status(500).json({ error: "Erro ao redefinir senha. Tente novamente." });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) {
    await db.delete(refreshTokensTable).where(eq(refreshTokensTable.token, refreshToken)).catch(() => {});
  }
  res.json({ success: true });
});

// POST /api/auth/migrate — reassigns anonymous deviceId data to the logged-in user
router.post("/migrate", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Não autorizado." });
    return;
  }

  let userId: number;
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { userId: number };
    userId = payload.userId;
  } catch {
    res.status(401).json({ error: "Token inválido." });
    return;
  }

  const { anonymousDeviceId } = req.body as { anonymousDeviceId: string };
  if (!anonymousDeviceId) {
    res.status(400).json({ error: "anonymousDeviceId é obrigatório." });
    return;
  }

  const userDeviceId = `user_${userId}`;

  try {
    // Migrate daily checkins
    await db.update(dailyCheckinsTable).set({ deviceId: userDeviceId }).where(eq(dailyCheckinsTable.deviceId, anonymousDeviceId));
    // Migrate coach messages
    await db.update(coachMessagesTable).set({ deviceId: userDeviceId }).where(eq(coachMessagesTable.deviceId, anonymousDeviceId));

    // Update user's stored deviceId
    await db.update(usersTable).set({ deviceId: userDeviceId }).where(eq(usersTable.id, userId));

    res.json({ success: true, newDeviceId: userDeviceId });
  } catch (err) {
    console.error("Migrate error:", err);
    res.status(500).json({ error: "Erro ao migrar dados." });
  }
});

export default router;
