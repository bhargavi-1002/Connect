import { Router, type IRouter } from "express";
import { eq, ilike } from "drizzle-orm";
import { db, usersTable, userSettingsTable } from "@workspace/db";
import {
  GetMeResponse,
  UpdateMeBody,
  UpdateMeResponse,
  CheckUsernameQueryParams,
  CheckUsernameResponse,
  SearchUsersQueryParams,
  SearchUsersResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const DEMO_USER_UID = "demo-user-001";

async function ensureDemoUser() {
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.uid, DEMO_USER_UID));
  if (existing) return existing;
  const [user] = await db.insert(usersTable).values({
    uid: DEMO_USER_UID,
    username: "sree_07",
    displayName: "Sree",
    bio: "Residential student at City College",
    isOnline: true,
    inviteLink: "connect.app/sree",
  }).returning();
  await db.insert(userSettingsTable).values({ userId: user.id }).onConflictDoNothing();
  return user;
}

router.get("/users/me", async (req, res): Promise<void> => {
  const user = await ensureDemoUser();
  res.json(GetMeResponse.parse({
    ...user,
    bio: user.bio ?? null,
    avatarUrl: user.avatarUrl ?? null,
  }));
});

router.patch("/users/me", async (req, res): Promise<void> => {
  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const user = await ensureDemoUser();
  const [updated] = await db.update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, user.id))
    .returning();
  res.json(UpdateMeResponse.parse({
    ...updated,
    bio: updated.bio ?? null,
    avatarUrl: updated.avatarUrl ?? null,
  }));
});

router.get("/users/check-username", async (req, res): Promise<void> => {
  const parsed = CheckUsernameQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username } = parsed.data;
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  res.json(CheckUsernameResponse.parse({ username, available: !existing }));
});

router.get("/users/search", async (req, res): Promise<void> => {
  const parsed = SearchUsersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { q } = parsed.data;
  const users = await db.select().from(usersTable)
    .where(ilike(usersTable.username, `%${q}%`))
    .limit(10);
  res.json(SearchUsersResponse.parse(users.map(u => ({
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl ?? null,
    isOnline: u.isOnline,
  }))));
});

export default router;
