import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, usersTable, emergencyAlertsTable } from "@workspace/db";
import {
  GetEmergencyAlertsResponse,
  SendEmergencyAlertBody,
} from "@workspace/api-zod";

const router: IRouter = Router();
const DEMO_USER_ID = 1;

router.get("/emergency/alerts", async (req, res): Promise<void> => {
  const alerts = await db.select().from(emergencyAlertsTable)
    .where(eq(emergencyAlertsTable.toUserId, DEMO_USER_ID))
    .orderBy(desc(emergencyAlertsTable.sentAt))
    .limit(20);
  const formatted = await Promise.all(alerts.map(async (a) => {
    const [from] = await db.select().from(usersTable).where(eq(usersTable.id, a.fromUserId));
    return {
      id: a.id,
      fromUser: {
        id: from.id,
        username: from.username,
        displayName: from.displayName,
        avatarUrl: from.avatarUrl ?? null,
        isOnline: from.isOnline,
      },
      message: a.message,
      sentAt: a.sentAt.toISOString(),
      isResolved: a.isResolved,
    };
  }));
  res.json(GetEmergencyAlertsResponse.parse(formatted));
});

router.post("/emergency/alerts", async (req, res): Promise<void> => {
  const parsed = SendEmergencyAlertBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [target] = await db.select().from(usersTable).where(eq(usersTable.username, parsed.data.targetUsername));
  if (!target) { res.status(404).json({ error: "Target user not found" }); return; }
  const [alert] = await db.insert(emergencyAlertsTable).values({
    fromUserId: DEMO_USER_ID,
    toUserId: target.id,
    message: parsed.data.message,
    isResolved: false,
  }).returning();
  const [from] = await db.select().from(usersTable).where(eq(usersTable.id, DEMO_USER_ID));
  res.status(201).json({
    id: alert.id,
    fromUser: {
      id: from.id,
      username: from.username,
      displayName: from.displayName,
      avatarUrl: from.avatarUrl ?? null,
      isOnline: from.isOnline,
    },
    message: alert.message,
    sentAt: alert.sentAt.toISOString(),
    isResolved: alert.isResolved,
  });
});

export default router;
