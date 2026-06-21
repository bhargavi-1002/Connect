import {
  collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp,
  arrayUnion, Timestamp, writeBatch, increment,
} from "firebase/firestore";
import {
  ref, uploadBytesResumable, getDownloadURL,
} from "firebase/storage";
import { db, storage } from "./firebase";
import type { User } from "firebase/auth";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  email: string | null;
  photoURL: string | null;
  bio: string;
  online: boolean;
  lastSeen: Timestamp | null;
  createdAt: Timestamp;
  fcmToken?: string;
  autoLogoutMinutes: number;
  theme: string;
  chatWallpaper: string;
}

export interface ContactRequest {
  id: string;
  fromUid: string;
  fromUsername: string;
  fromDisplayName: string;
  fromPhotoURL: string | null;
  toUid: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Timestamp;
}

export interface Chat {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string | null>;
  lastMessage: string;
  lastMessageAt: Timestamp | null;
  lastMessageSenderId: string;
  unreadCount: Record<string, number>;
  isGroup: boolean;
  groupName?: string;
  groupPhoto?: string | null;
  createdAt: Timestamp;
  pinnedBy?: Record<string, boolean>;
  archivedBy?: Record<string, boolean>;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  priority: "normal" | "good_news" | "important" | "urgent" | "emergency";
  sentAt: Timestamp;
  readBy: string[];
  mediaURL?: string | null;
  mediaType?: "image" | "video" | "audio" | "file" | "location" | null;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  duration?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  thumbnailURL?: string | null;
}

export interface EmergencyAlert {
  id: string;
  senderUid: string;
  senderName: string;
  senderUsername: string;
  senderPhoto: string | null;
  recipientUids: string[];
  message: string;
  location: string;
  active: boolean;
  createdAt: Timestamp;
  resolvedAt: Timestamp | null;
}

export interface Device {
  id: string;
  uid: string;
  name: string;
  browser: string;
  os: string;
  lastActive: Timestamp;
  current: boolean;
}

// ─── Safe wrapper — never throws ─────────────────────────────────────────────

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function createUserProfile(
  user: User,
  extra: { username: string; displayName: string }
): Promise<void> {
  const username = extra.username.toLowerCase().replace(/\s/g, "_");
  const profile: Omit<UserProfile, "id"> = {
    uid: user.uid,
    displayName: extra.displayName,
    username,
    email: user.email,
    photoURL: user.photoURL,
    bio: "",
    online: true,
    lastSeen: null,
    createdAt: serverTimestamp() as Timestamp,
    autoLogoutMinutes: 15,
    theme: "midnight",
    chatWallpaper: "none",
  };
  await setDoc(doc(db, "users", user.uid), profile);
  // usernames doc stores uid + email so username-based login can look up email
  await setDoc(doc(db, "usernames", username), {
    uid: user.uid,
    email: user.email ?? "",
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  return safe(async () => {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  }, null);
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  try {
    await updateDoc(doc(db, "users", uid), data as Record<string, unknown>);
  } catch { /* ignore */ }
}

/** Returns true if the username is available (not taken). Falls back to true if Firestore is offline. */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  return safe(async () => {
    const snap = await getDoc(doc(db, "usernames", username.toLowerCase()));
    return !snap.exists();
  }, true);
}

export async function searchUsersByUsername(searchTerm: string): Promise<UserProfile[]> {
  if (!searchTerm || searchTerm.length < 2) return [];
  const term = searchTerm.toLowerCase().replace(/^@/, "");
  return safe(async () => {
    const q = query(
      collection(db, "users"),
      where("username", ">=", term),
      where("username", "<=", term + "\uf8ff"),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as UserProfile);
  }, []);
}

// ─── Presence ────────────────────────────────────────────────────────────────

export async function setOnline(uid: string) {
  try {
    await updateDoc(doc(db, "users", uid), { online: true, lastSeen: serverTimestamp() });
  } catch { /* ignore */ }
}

export async function setOffline(uid: string) {
  try {
    await updateDoc(doc(db, "users", uid), { online: false, lastSeen: serverTimestamp() });
  } catch { /* ignore */ }
}

// ─── Contact Requests ────────────────────────────────────────────────────────

export async function sendContactRequest(fromUser: UserProfile, toUid: string): Promise<void> {
  const reqRef = doc(collection(db, "contactRequests"));
  await setDoc(reqRef, {
    fromUid: fromUser.uid,
    fromUsername: fromUser.username,
    fromDisplayName: fromUser.displayName,
    fromPhotoURL: fromUser.photoURL,
    toUid,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export function listenToIncomingRequests(uid: string, cb: (reqs: ContactRequest[]) => void) {
  try {
    const q = query(
      collection(db, "contactRequests"),
      where("toUid", "==", uid),
      where("status", "==", "pending")
    );
    return onSnapshot(q,
      snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as ContactRequest)),
      () => cb([])
    );
  } catch {
    cb([]);
    return () => {};
  }
}

export async function respondToRequest(
  requestId: string,
  fromUid: string,
  toUid: string,
  accept: boolean
) {
  const batch = writeBatch(db);
  batch.update(doc(db, "contactRequests", requestId), {
    status: accept ? "accepted" : "rejected",
  });

  if (accept) {
    // Check if a 1-on-1 chat already exists between these two users
    const existingQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", fromUid)
    );
    const existingSnap = await getDocs(existingQuery);
    const chatExists = existingSnap.docs.some(d => {
      const data = d.data();
      return !data.isGroup && data.participants?.includes(toUid);
    });

    if (!chatExists) {
      const chatRef = doc(collection(db, "chats"));
      const [fromSnap, toSnap] = await Promise.all([
        getDoc(doc(db, "users", fromUid)),
        getDoc(doc(db, "users", toUid)),
      ]);
      const from = fromSnap.data() as UserProfile;
      const to = toSnap.data() as UserProfile;

      batch.set(chatRef, {
        participants: [fromUid, toUid],
        participantNames: { [fromUid]: from.displayName, [toUid]: to.displayName },
        participantPhotos: { [fromUid]: from.photoURL ?? null, [toUid]: to.photoURL ?? null },
        lastMessage: "",
        lastMessageAt: serverTimestamp(),
        lastMessageSenderId: "",
        unreadCount: { [fromUid]: 0, [toUid]: 0 },
        isGroup: false,
        createdAt: serverTimestamp(),
      });
    }
  }

  await batch.commit();
}

// ─── Chats ───────────────────────────────────────────────────────────────────

export function listenToChats(uid: string, cb: (chats: Chat[]) => void) {
  try {
    // No orderBy — avoids Firestore composite index requirement and null-field exclusion.
    // Docs where lastMessageAt=null (new chats) would be silently dropped by orderBy.
    // Sort client-side instead so every chat is always visible.
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", uid)
    );
    return onSnapshot(q, snap => {
      const chats = snap.docs
        .map(d => ({ id: d.id, ...d.data() }) as Chat)
        .sort((a, b) => {
          const aMs = a.lastMessageAt?.toDate?.()?.getTime() ?? a.createdAt?.toDate?.()?.getTime() ?? 0;
          const bMs = b.lastMessageAt?.toDate?.()?.getTime() ?? b.createdAt?.toDate?.()?.getTime() ?? 0;
          return bMs - aMs;
        });
      cb(chats);
    }, () => cb([]));
  } catch {
    cb([]);
    return () => {};
  }
}

export async function getChat(chatId: string): Promise<Chat | null> {
  return safe(async () => {
    const snap = await getDoc(doc(db, "chats", chatId));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Chat) : null;
  }, null);
}

export async function markChatRead(chatId: string, uid: string) {
  try {
    await updateDoc(doc(db, "chats", chatId), { [`unreadCount.${uid}`]: 0 });
  } catch { /* ignore */ }
}

export async function pinChat(chatId: string, uid: string) {
  try {
    await updateDoc(doc(db, "chats", chatId), { [`pinnedBy.${uid}`]: true });
  } catch { /* ignore */ }
}

export async function unpinChat(chatId: string, uid: string) {
  try {
    await updateDoc(doc(db, "chats", chatId), { [`pinnedBy.${uid}`]: false });
  } catch { /* ignore */ }
}

export async function archiveChat(chatId: string, uid: string) {
  try {
    await updateDoc(doc(db, "chats", chatId), { [`archivedBy.${uid}`]: true });
  } catch { /* ignore */ }
}

export async function unarchiveChat(chatId: string, uid: string) {
  try {
    await updateDoc(doc(db, "chats", chatId), { [`archivedBy.${uid}`]: false });
  } catch { /* ignore */ }
}

// ─── Messages ────────────────────────────────────────────────────────────────

export function listenToMessages(chatId: string, cb: (msgs: Message[]) => void) {
  try {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("sentAt", "asc"),
      limit(100)
    );
    return onSnapshot(q,
      snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Message)),
      () => cb([])
    );
  } catch {
    cb([]);
    return () => {};
  }
}

export async function sendMessage(
  chatId: string,
  sender: UserProfile,
  text: string,
  priority: Message["priority"] = "normal",
  recipientUids: string[],
  options?: {
    mediaURL?: string | null;
    mediaType?: Message["mediaType"];
    fileName?: string | null;
    mimeType?: string | null;
    fileSize?: number | null;
    duration?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    thumbnailURL?: string | null;
  }
) {
  const batch = writeBatch(db);
  const msgRef = doc(collection(db, "chats", chatId, "messages"));

  const displayText = options?.mediaType === "location"
    ? "📍 Location"
    : options?.mediaType === "audio"
    ? "🎵 Audio message"
    : options?.mediaType === "file"
    ? `📎 ${options.fileName || "File"}`
    : options?.mediaType === "image"
    ? "📷 Photo"
    : options?.mediaType === "video"
    ? "🎬 Video"
    : text;

  batch.set(msgRef, {
    chatId,
    senderId: sender.uid,
    senderName: sender.displayName,
    text,
    priority,
    sentAt: serverTimestamp(),
    readBy: [sender.uid],
    mediaURL: options?.mediaURL ?? null,
    mediaType: options?.mediaType ?? null,
    fileName: options?.fileName ?? null,
    mimeType: options?.mimeType ?? null,
    fileSize: options?.fileSize ?? null,
    duration: options?.duration ?? null,
    latitude: options?.latitude ?? null,
    longitude: options?.longitude ?? null,
    thumbnailURL: options?.thumbnailURL ?? null,
  });

  const unreadUpdates: Record<string, unknown> = {
    lastMessage: priority !== "normal" ? `[${priority.replace("_", " ")}] ${displayText}` : displayText,
    lastMessageAt: serverTimestamp(),
    lastMessageSenderId: sender.uid,
  };
  recipientUids
    .filter(uid => uid !== sender.uid)
    .forEach(uid => {
      unreadUpdates[`unreadCount.${uid}`] = increment(1);
    });

  batch.update(doc(db, "chats", chatId), unreadUpdates);

  if (priority === "emergency") {
    const alertRef = doc(collection(db, "emergencyAlerts"));
    batch.set(alertRef, {
      senderUid: sender.uid,
      senderName: sender.displayName,
      senderUsername: sender.username,
      senderPhoto: sender.photoURL ?? null,
      recipientUids: recipientUids.filter(u => u !== sender.uid),
      message: text,
      location: "",
      active: true,
      createdAt: serverTimestamp(),
      resolvedAt: null,
    });
  }

  await batch.commit();
}

export async function uploadFile(
  file: File,
  chatId: string,
  uid: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const path = `chat-media/${chatId}/${uid}_${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      snap => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
    );
  });
}

export async function markMessageRead(chatId: string, messageId: string, uid: string) {
  try {
    await updateDoc(doc(db, "chats", chatId, "messages", messageId), {
      readBy: arrayUnion(uid),
    });
  } catch { /* ignore */ }
}

// ─── Typing ──────────────────────────────────────────────────────────────────

export async function setTyping(chatId: string, uid: string, isTyping: boolean) {
  try {
    const ref = doc(db, "chats", chatId, "typing", uid);
    if (isTyping) {
      await setDoc(ref, { uid, typingAt: serverTimestamp() });
    } else {
      await deleteDoc(ref);
    }
  } catch { /* ignore */ }
}

export function listenToTyping(chatId: string, myUid: string, cb: (typingUids: string[]) => void) {
  try {
    return onSnapshot(collection(db, "chats", chatId, "typing"), snap => {
      const uids = snap.docs.map(d => d.data().uid as string).filter(uid => uid !== myUid);
      cb(uids);
    }, () => cb([]));
  } catch {
    cb([]);
    return () => {};
  }
}

// ─── Emergency Alerts ────────────────────────────────────────────────────────

export function listenToEmergencyAlerts(uid: string, cb: (alerts: EmergencyAlert[]) => void) {
  try {
    const q = query(
      collection(db, "emergencyAlerts"),
      where("recipientUids", "array-contains", uid),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    return onSnapshot(q,
      snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as EmergencyAlert)),
      () => cb([])
    );
  } catch {
    cb([]);
    return () => {};
  }
}

export function listenToMyAlerts(uid: string, cb: (alerts: EmergencyAlert[]) => void) {
  try {
    const q = query(
      collection(db, "emergencyAlerts"),
      where("senderUid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    return onSnapshot(q,
      snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as EmergencyAlert)),
      () => cb([])
    );
  } catch {
    cb([]);
    return () => {};
  }
}

export async function resolveAlert(alertId: string) {
  await updateDoc(doc(db, "emergencyAlerts", alertId), {
    active: false,
    resolvedAt: serverTimestamp(),
  });
}

export async function sendEmergencyAlert(
  sender: UserProfile,
  message: string,
  location: string,
  recipientUids: string[]
) {
  await addDoc(collection(db, "emergencyAlerts"), {
    senderUid: sender.uid,
    senderName: sender.displayName,
    senderUsername: sender.username,
    senderPhoto: sender.photoURL ?? null,
    recipientUids,
    message,
    location,
    active: true,
    createdAt: serverTimestamp(),
    resolvedAt: null,
  });
}

// ─── Devices ─────────────────────────────────────────────────────────────────

export function listenToDevices(uid: string, cb: (devices: Device[]) => void) {
  try {
    const q = query(
      collection(db, "devices"),
      where("uid", "==", uid),
      orderBy("lastActive", "desc")
    );
    return onSnapshot(q,
      snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Device)),
      () => cb([])
    );
  } catch {
    cb([]);
    return () => {};
  }
}

export async function registerDevice(uid: string, deviceId: string) {
  try {
    const ua = navigator.userAgent;
    const browser = ua.includes("Chrome") ? "Chrome" : ua.includes("Firefox") ? "Firefox" : ua.includes("Safari") ? "Safari" : "Browser";
    const os = ua.includes("Win") ? "Windows" : ua.includes("Mac") ? "macOS" : ua.includes("Linux") ? "Linux" : ua.includes("Android") ? "Android" : ua.includes("iPhone") || ua.includes("iPad") ? "iOS" : "Unknown";
    await setDoc(doc(db, "devices", deviceId), {
      uid,
      name: `${browser} on ${os}`,
      browser,
      os,
      lastActive: serverTimestamp(),
      current: true,
    });
  } catch { /* ignore */ }
}

export async function removeDevice(deviceId: string) {
  await deleteDoc(doc(db, "devices", deviceId));
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function updateSettings(uid: string, settings: Partial<Pick<UserProfile, "autoLogoutMinutes" | "theme" | "chatWallpaper">>) {
  try {
    await updateDoc(doc(db, "users", uid), settings);
  } catch { /* ignore */ }
}

// ─── Group Chats ─────────────────────────────────────────────────────────────

export async function createGroupChat(
  creatorUid: string,
  participantUids: string[],
  groupName: string,
  groupPhoto?: string | null
): Promise<string> {
  const allParticipants = [creatorUid, ...participantUids.filter(u => u !== creatorUid)];
  const profileSnaps = await Promise.all(
    allParticipants.map(uid => getDoc(doc(db, "users", uid)))
  );
  const names: Record<string, string> = {};
  const photos: Record<string, string | null> = {};
  const unread: Record<string, number> = {};
  profileSnaps.forEach(snap => {
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      names[snap.id] = data.displayName;
      photos[snap.id] = data.photoURL ?? null;
      unread[snap.id] = 0;
    }
  });

  const chatRef = doc(collection(db, "chats"));
  await setDoc(chatRef, {
    participants: allParticipants,
    participantNames: names,
    participantPhotos: photos,
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    lastMessageSenderId: "",
    unreadCount: unread,
    isGroup: true,
    groupName,
    groupPhoto: groupPhoto ?? null,
    createdAt: serverTimestamp(),
  });

  return chatRef.id;
}

// ─── Invite ──────────────────────────────────────────────────────────────────

export function generateInviteLink(username: string): string {
  const base = window.location.origin;
  const basePath = import.meta.env.BASE_URL || "/";
  return `${base}${basePath}invite/${username}`;
}
