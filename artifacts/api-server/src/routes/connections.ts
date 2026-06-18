import { Router, type IRouter } from "express";
import { eq, or, and } from "drizzle-orm";
import { db, usersTable, connectionsTable } from "@workspace/db";
import {
  GetConnectionsResponse,
  SendConnectionRequestBody,
  GetConnectionRequestsResponse,
  AcceptConnectionParams,
  AcceptConnectionResponse,
  RejectConnectionParams,
  RejectConnectionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const DEMO_USER_ID = 1;

function parseId(raw: string | string[]): number {
  const val = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(val, 10);
}

async function formatConnection(conn: typeof connectionsTable.$inferSelect, currentUserId: number) {
  const otherId = conn.requesterId === currentUserId ? conn.receiverId : conn.requesterId;
  const [other] = await db.select().from(usersTable).where(eq(usersTable.id, otherId));
  return {
    id: conn.id,
    status: conn.status,
    user: {
      id: other.id,
      username: other.username,
      displayName: other.displayName,
      avatarUrl: other.avatarUrl ?? null,
      isOnline: other.isOnline,
    },
    createdAt: conn.createdAt.toISOString(),
  };
}

router.get("/connections", async (req, res): Promise<void> => {
  const conns = await db.select().from(connectionsTable).where(
    and(
      or(
        eq(connectionsTable.requesterId, DEMO_USER_ID),
        eq(connectionsTable.receiverId, DEMO_USER_ID),
      ),
      eq(connectionsTable.status, "accepted"),
    )
  );
  const formatted = await Promise.all(conns.map(c => formatConnection(c, DEMO_USER_ID)));
  res.json(GetConnectionsResponse.parse(formatted));
});

router.post("/connections", async (req, res): Promise<void> => {
  const parsed = SendConnectionRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [target] = await db.select().from(usersTable).where(eq(usersTable.username, parsed.data.username));
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const [conn] = await db.insert(connectionsTable).values({
    requesterId: DEMO_USER_ID,
    receiverId: target.id,
    status: "pending",
  }).returning();
  const formatted = await formatConnection(conn, DEMO_USER_ID);
  res.status(201).json(formatted);
});

router.get("/connections/requests", async (req, res): Promise<void> => {
  const received = await db.select().from(connectionsTable).where(
    and(eq(connectionsTable.receiverId, DEMO_USER_ID), eq(connectionsTable.status, "pending"))
  );
  const sent = await db.select().from(connectionsTable).where(
    and(eq(connectionsTable.requesterId, DEMO_USER_ID), eq(connectionsTable.status, "pending"))
  );
  const [formattedReceived, formattedSent] = await Promise.all([
    Promise.all(received.map(c => formatConnection(c, DEMO_USER_ID))),
    Promise.all(sent.map(c => formatConnection(c, DEMO_USER_ID))),
  ]);
  res.json(GetConnectionRequestsResponse.parse({ received: formattedReceived, sent: formattedSent }));
});

router.post("/connections/:connectionId/accept", async (req, res): Promise<void> => {
  const params = AcceptConnectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const id = parseId(req.params.connectionId);
  const [conn] = await db.update(connectionsTable)
    .set({ status: "accepted" })
    .where(eq(connectionsTable.id, id))
    .returning();
  if (!conn) { res.status(404).json({ error: "Not found" }); return; }
  const formatted = await formatConnection(conn, DEMO_USER_ID);
  res.json(AcceptConnectionResponse.parse(formatted));
});

router.post("/connections/:connectionId/reject", async (req, res): Promise<void> => {
  const params = RejectConnectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const id = parseId(req.params.connectionId);
  const [conn] = await db.update(connectionsTable)
    .set({ status: "rejected" })
    .where(eq(connectionsTable.id, id))
    .returning();
  if (!conn) { res.status(404).json({ error: "Not found" }); return; }
  const formatted = await formatConnection(conn, DEMO_USER_ID);
  res.json(RejectConnectionResponse.parse(formatted));
});

export default router;
