import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, devicesTable } from "@workspace/db";
import {
  GetDevicesResponse,
  LogoutDeviceParams,
  LogoutDeviceResponse,
  LogoutAllDevicesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const DEMO_USER_ID = 1;

function parseId(raw: string | string[]): number {
  const val = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(val, 10);
}

async function ensureDevices() {
  const existing = await db.select().from(devicesTable).where(eq(devicesTable.userId, DEMO_USER_ID));
  if (existing.length > 0) return existing;
  await db.insert(devicesTable).values([
    { userId: DEMO_USER_ID, deviceType: "laptop", deviceName: "Library Computer", browser: "Chrome 120", isCurrent: true, isActive: true, lastSeen: new Date() },
    { userId: DEMO_USER_ID, deviceType: "android", deviceName: "Samsung Galaxy A54", browser: "Chrome Mobile", isCurrent: false, isActive: true, lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { userId: DEMO_USER_ID, deviceType: "desktop", deviceName: "Computer Lab PC", browser: "Firefox 121", isCurrent: false, isActive: true, lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  ]);
  return db.select().from(devicesTable).where(eq(devicesTable.userId, DEMO_USER_ID));
}

router.get("/devices", async (req, res): Promise<void> => {
  const devices = await ensureDevices();
  res.json(GetDevicesResponse.parse(devices.filter(d => d.isActive).map(d => ({
    id: d.id,
    deviceType: d.deviceType,
    deviceName: d.deviceName,
    browser: d.browser,
    lastSeen: d.lastSeen.toISOString(),
    isCurrent: d.isCurrent,
  }))));
});

router.post("/devices/:deviceId/logout", async (req, res): Promise<void> => {
  const params = LogoutDeviceParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const id = parseId(req.params.deviceId);
  const [device] = await db.update(devicesTable)
    .set({ isActive: false })
    .where(and(eq(devicesTable.id, id), eq(devicesTable.userId, DEMO_USER_ID)))
    .returning();
  if (!device) { res.status(404).json({ error: "Device not found" }); return; }
  res.json(LogoutDeviceResponse.parse({
    id: device.id,
    deviceType: device.deviceType,
    deviceName: device.deviceName,
    browser: device.browser,
    lastSeen: device.lastSeen.toISOString(),
    isCurrent: device.isCurrent,
  }));
});

router.post("/devices/logout-all", async (req, res): Promise<void> => {
  await db.update(devicesTable)
    .set({ isActive: false, isCurrent: false })
    .where(eq(devicesTable.userId, DEMO_USER_ID));
  res.json(LogoutAllDevicesResponse.parse({ success: true }));
});

export default router;
