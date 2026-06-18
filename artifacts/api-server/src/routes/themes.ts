import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, userSettingsTable } from "@workspace/db";
import {
  GetThemesResponse,
  GetSettingsResponse,
  UpdateSettingsBody,
  UpdateSettingsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const DEMO_USER_ID = 1;

const THEMES = [
  { id: "midnight", name: "Midnight", previewGradient: "linear-gradient(135deg, #070B25, #1a1040)", isActive: false },
  { id: "galaxy", name: "Galaxy", previewGradient: "linear-gradient(135deg, #0a0a2e, #4a0080)", isActive: false },
  { id: "sunset", name: "Sunset", previewGradient: "linear-gradient(135deg, #ff6b35, #f7c59f)", isActive: false },
  { id: "ocean", name: "Ocean", previewGradient: "linear-gradient(135deg, #006994, #00c8e0)", isActive: false },
  { id: "forest", name: "Forest", previewGradient: "linear-gradient(135deg, #1a4731, #4ade80)", isActive: false },
  { id: "lavender", name: "Lavender", previewGradient: "linear-gradient(135deg, #6b48ff, #c084fc)", isActive: false },
  { id: "candy", name: "Candy", previewGradient: "linear-gradient(135deg, #ff6eb4, #ffd93d)", isActive: false },
  { id: "bubblegum", name: "Bubblegum", previewGradient: "linear-gradient(135deg, #ff85a2, #c084fc)", isActive: false },
];

async function getSettings() {
  const [settings] = await db.select().from(userSettingsTable).where(eq(userSettingsTable.userId, DEMO_USER_ID));
  if (!settings) {
    const [created] = await db.insert(userSettingsTable).values({ userId: DEMO_USER_ID }).returning();
    return created;
  }
  return settings;
}

router.get("/themes", async (req, res): Promise<void> => {
  const settings = await getSettings();
  const themes = THEMES.map(t => ({ ...t, isActive: t.id === settings.activeTheme }));
  res.json(GetThemesResponse.parse(themes));
});

router.get("/settings", async (req, res): Promise<void> => {
  const settings = await getSettings();
  res.json(GetSettingsResponse.parse({
    activeTheme: settings.activeTheme,
    autoLogoutEnabled: settings.autoLogoutEnabled,
    autoLogoutMinutes: settings.autoLogoutMinutes,
    notificationsEnabled: settings.notificationsEnabled,
    emergencyEmailEnabled: settings.emergencyEmailEnabled,
    emergencySmsEnabled: settings.emergencySmsEnabled,
  }));
});

router.patch("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const settings = await getSettings();
  const [updated] = await db.update(userSettingsTable)
    .set(parsed.data)
    .where(eq(userSettingsTable.id, settings.id))
    .returning();
  res.json(UpdateSettingsResponse.parse({
    activeTheme: updated.activeTheme,
    autoLogoutEnabled: updated.autoLogoutEnabled,
    autoLogoutMinutes: updated.autoLogoutMinutes,
    notificationsEnabled: updated.notificationsEnabled,
    emergencyEmailEnabled: updated.emergencyEmailEnabled,
    emergencySmsEnabled: updated.emergencySmsEnabled,
  }));
});

export default router;
