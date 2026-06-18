import {
  collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp,
  arrayUnion, arrayRemove, Timestamp, writeBatch, increment,
} from "firebase/firestore";
import { db } from "./firebase";
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
  mediaType?: "image" | "video" | null;
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

// ─── Users ───────────────────────────────────────────────────────────────────

export async function createUserProfile(user: User, extra: { username: string; displayName: string }) {
  const profile: UserProfile = {
    uid: user.uid,
    displayName: extra.displayName,
    username: extra.username.toLowerCase(),
    email: user.email,
    photoURL: user.photoURL,
    bio: "",
    online: true,
    lastSeen: null,
    createdAt: serverTimestamp() as Timestamp,
    autoLogoutMinutes: 15,
    theme: "midnight",
  };
  await setDoc(doc(db, "users", user.uid), profile);
  await setDoc(doc(db, "usernames", extra.username.toLowerCase()), { uid: user.uid });
  return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, "users", uid), data);
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "usernames", username.toLowerCase()));
  return !snap.exists();
}

export async function searchUsersByUsername(searchTerm: string): Promise<UserProfile[]> {
  if (!searchTerm || searchTerm.length < 2) return [];
  const term = searchTerm.toLowerCase().replace(/^@/, "");
  const q = query(
    collection(db, "users"),
    where("username", ">=", term),
    where("username", "<=", term + "\uf8ff"),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as UserProfile);
}

// ─── Presence ────────────────────────────────────────────────────────────────

export async function setOnline(uid: string) {
  await updateDoc(doc(db, "users", uid), {
    online: true,
    lastSeen: serverTimestamp(),
  });
}

export async function setOffline(uid: string) {
  await updateDoc(doc(db, "users", uid), {
    online: false,
    lastSeen: serverTimestamp(),
  });
}

// ─── Contact Requests ────────────────────────────────────────────────────────

export async function sendContactRequest(
  fromUser: UserProfile,
  toUid: string
): Promise<void> {
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

export function listenToIncomingRequests(
  uid: string,
  cb: (reqs: ContactRequest[]) => void
) {
  const q = query(
    collection(db, "contactRequests"),
    where("toUid", "==", uid),
    where("status", "==", "pending")
  );
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as ContactRequest))
  );
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
    const chatRef = doc(collection(db, "chats"));
    const fromSnap = await getDoc(doc(db, "users", fromUid));
    const toSnap = await getDoc(doc(db, "users", toUid));
    const from = fromSnap.data() as UserProfile;
    const to = toSnap.data() as UserProfile;

    batch.set(chatRef, {
      participants: [fromUid, toUid],
      participantNames: { [fromUid]: from.displayName, [toUid]: to.displayName },
      participantPhotos: { [fromUid]: from.photoURL, [toUid]: to.photoURL },
      lastMessage: "",
      lastMessageAt: null,
      lastMessageSenderId: "",
      unreadCount: { [fromUid]: 0, [toUid]: 0 },
      isGroup: false,
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
}

// ─── Chats ───────────────────────────────────────────────────────────────────

export function listenToChats(uid: string, cb: (chats: Chat[]) => void) {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", uid),
    orderBy("lastMessageAt", "desc")
  );
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Chat))
  );
}

export async function getChat(chatId: string): Promise<Chat | null> {
  const snap = await getDoc(doc(db, "chats", chatId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Chat) : null;
}

export async function markChatRead(chatId: string, uid: string) {
  await updateDoc(doc(db, "chats", chatId), {
    [`unreadCount.${uid}`]: 0,
  });
}

// ─── Messages ────────────────────────────────────────────────────────────────

export function listenToMessages(chatId: string, cb: (msgs: Message[]) => void) {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("sentAt", "asc"),
    limit(100)
  );
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Message))
  );
}

export async function sendMessage(
  chatId: string,
  sender: UserProfile,
  text: string,
  priority: Message["priority"] = "normal",
  recipientUids: string[]
) {
  const batch = writeBatch(db);
  const msgRef = doc(collection(db, "chats", chatId, "messages"));

  batch.set(msgRef, {
    chatId,
    senderId: sender.uid,
    senderName: sender.displayName,
    text,
    priority,
    sentAt: serverTimestamp(),
    readBy: [sender.uid],
    mediaURL: null,
    mediaType: null,
  });

  const unreadUpdates: Record<string, unknown> = {
    lastMessage: priority !== "normal" ? `[${priority.replace("_", " ")}] ${text}` : text,
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
      senderPhoto: sender.photoURL,
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

export async function markMessageRead(chatId: string, messageId: string, uid: string) {
  await updateDoc(doc(db, "chats", chatId, "messages", messageId), {
    readBy: arrayUnion(uid),
  });
}

// ─── Typing Indicators ───────────────────────────────────────────────────────

export async function setTyping(chatId: string, uid: string, isTyping: boolean) {
  const ref = doc(db, "chats", chatId, "typing", uid);
  if (isTyping) {
    await setDoc(ref, { uid, typingAt: serverTimestamp() });
  } else {
    await deleteDoc(ref);
  }
}

export function listenToTyping(
  chatId: string,
  myUid: string,
  cb: (typingUids: string[]) => void
) {
  return onSnapshot(collection(db, "chats", chatId, "typing"), snap => {
    const uids = snap.docs
      .map(d => d.data().uid as string)
      .filter(uid => uid !== myUid);
    cb(uids);
  });
}

// ─── Emergency Alerts ────────────────────────────────────────────────────────

export function listenToEmergencyAlerts(
  uid: string,
  cb: (alerts: EmergencyAlert[]) => void
) {
  const q = query(
    collection(db, "emergencyAlerts"),
    where("recipientUids", "array-contains", uid),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as EmergencyAlert))
  );
}

export function listenToMyAlerts(
  uid: string,
  cb: (alerts: EmergencyAlert[]) => void
) {
  const q = query(
    collection(db, "emergencyAlerts"),
    where("senderUid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(10)
  );
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as EmergencyAlert))
  );
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
    senderPhoto: sender.photoURL,
    recipientUids,
    message,
    location,
    active: true,
    createdAt: serverTimestamp(),
    resolvedAt: null,
  });
}

// ─── Devices ─────────────────────────────────────────────────────────────────

export interface Device {
  id: string;
  uid: string;
  name: string;
  browser: string;
  os: string;
  lastActive: Timestamp;
  current: boolean;
}

export function listenToDevices(uid: string, cb: (devices: Device[]) => void) {
  const q = query(
    collection(db, "devices"),
    where("uid", "==", uid),
    orderBy("lastActive", "desc")
  );
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Device))
  );
}

export async function registerDevice(uid: string, deviceId: string) {
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
}

export async function removeDevice(deviceId: string) {
  await deleteDoc(doc(db, "devices", deviceId));
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function updateSettings(uid: string, settings: { autoLogoutMinutes?: number; theme?: string }) {
  await updateDoc(doc(db, "users", uid), settings);
}

// ─── Invite Links ────────────────────────────────────────────────────────────

export function generateInviteLink(username: string): string {
  const base = window.location.origin;
  return `${base}/invite/${username}`;
}
