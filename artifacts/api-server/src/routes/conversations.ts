import { Router, type IRouter } from "express";
import { eq, or, and, desc } from "drizzle-orm";
import { db, usersTable, conversationsTable, messagesTable } from "@workspace/db";
import {
  GetConversationsResponse,
  GetConversationParams,
  GetConversationResponse,
  ListMessagesParams,
  ListMessagesQueryParams,
  ListMessagesResponse,
  SendMessageParams,
  SendMessageBody,
} from "@workspace/api-zod";

const router: IRouter = Router();
const DEMO_USER_ID = 1;

function parseId(raw: string | string[]): number {
  const val = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(val, 10);
}

async function formatConversation(conv: typeof conversationsTable.$inferSelect, currentUserId: number) {
  const otherId = conv.user1Id === currentUserId ? conv.user2Id : conv.user1Id;
  const [other] = await db.select().from(usersTable).where(eq(usersTable.id, otherId));
  const [lastMsg] = await db.select().from(messagesTable)
    .where(eq(messagesTable.conversationId, conv.id))
    .orderBy(desc(messagesTable.sentAt))
    .limit(1);
  const unread = await db.select().from(messagesTable).where(
    and(
      eq(messagesTable.conversationId, conv.id),
      eq(messagesTable.isRead, false),
    )
  );
  const isPinned = conv.user1Id === currentUserId ? conv.isPinnedByUser1 : conv.isPinnedByUser2;
  return {
    id: conv.id,
    participant: {
      id: other.id,
      username: other.username,
      displayName: other.displayName,
      avatarUrl: other.avatarUrl ?? null,
      isOnline: other.isOnline,
    },
    lastMessage: lastMsg ? {
      text: lastMsg.text ?? "",
      priority: lastMsg.priority,
      sentAt: lastMsg.sentAt.toISOString(),
    } : null,
    unreadCount: unread.length,
    isPinned,
    wallpaper: (conv.user1Id === currentUserId ? conv.wallpaperByUser1 : conv.wallpaperByUser2) ?? null,
  };
}

router.get("/conversations", async (req, res): Promise<void> => {
  const convs = await db.select().from(conversationsTable).where(
    or(
      eq(conversationsTable.user1Id, DEMO_USER_ID),
      eq(conversationsTable.user2Id, DEMO_USER_ID),
    )
  );
  const formatted = await Promise.all(convs.map(c => formatConversation(c, DEMO_USER_ID)));
  res.json(GetConversationsResponse.parse(formatted));
});

router.get("/conversations/:conversationId", async (req, res): Promise<void> => {
  const params = GetConversationParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const id = parseId(req.params.conversationId);
  const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id));
  if (!conv) { res.status(404).json({ error: "Not found" }); return; }
  const formatted = await formatConversation(conv, DEMO_USER_ID);
  res.json(GetConversationResponse.parse(formatted));
});

router.get("/conversations/:conversationId/messages", async (req, res): Promise<void> => {
  const params = ListMessagesParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const qp = ListMessagesQueryParams.safeParse(req.query);
  const id = parseId(req.params.conversationId);
  const limit = qp.success && qp.data.limit ? qp.data.limit : 50;
  const msgs = await db.select().from(messagesTable)
    .where(eq(messagesTable.conversationId, id))
    .orderBy(desc(messagesTable.sentAt))
    .limit(limit);
  res.json(ListMessagesResponse.parse(msgs.map(m => ({
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    text: m.text ?? null,
    imageUrl: m.imageUrl ?? null,
    priority: m.priority,
    isRead: m.isRead,
    replyToId: m.replyToId ?? null,
    sentAt: m.sentAt.toISOString(),
  }))));
});

router.post("/conversations/:conversationId/messages", async (req, res): Promise<void> => {
  const params = SendMessageParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const body = SendMessageBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const id = parseId(req.params.conversationId);
  const [msg] = await db.insert(messagesTable).values({
    conversationId: id,
    senderId: DEMO_USER_ID,
    text: body.data.text ?? null,
    imageUrl: body.data.imageUrl ?? null,
    priority: body.data.priority,
    replyToId: body.data.replyToId ?? null,
  }).returning();
  res.status(201).json({
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    text: msg.text ?? null,
    imageUrl: msg.imageUrl ?? null,
    priority: msg.priority,
    isRead: msg.isRead,
    replyToId: msg.replyToId ?? null,
    sentAt: msg.sentAt.toISOString(),
  });
});

export default router;
