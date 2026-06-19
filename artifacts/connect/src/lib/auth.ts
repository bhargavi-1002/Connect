import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "./firebase";
import { createUserProfile, checkUsernameAvailable, getUserProfile } from "./firestore";

// ─── Google Sign-In ──────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const existing = await getUserProfile(user.uid);
  if (!existing) {
    const baseUsername = (user.displayName || "user")
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20) || "user";
    let username = baseUsername;
    let counter = 1;
    while (!(await checkUsernameAvailable(username))) {
      username = `${baseUsername}${counter++}`;
    }
    await createUserProfile(user, { username, displayName: user.displayName || "User" });
    return { user, isNew: true, username };
  }
  return { user, isNew: false, username: existing.username };
}

// ─── Phone / OTP ─────────────────────────────────────────────────────────────

let confirmationResult: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

export function clearRecaptcha() {
  try {
    recaptchaVerifier?.clear();
    recaptchaVerifier = null;
  } catch { /* ignore */ }
  // Remove the rendered widget DOM if present
  const el = document.getElementById("recaptcha-container");
  if (el) el.innerHTML = "";
}

export async function sendOTP(phone: string, containerId: string): Promise<void> {
  clearRecaptcha();
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
  confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
}

export async function verifyOTP(otp: string) {
  if (!confirmationResult) throw new Error("No OTP session. Please request a new OTP.");
  const result = await confirmationResult.confirm(otp);
  const user = result.user;
  const existing = await getUserProfile(user.uid);
  return { user, isNew: !existing };
}

// ─── Email / Password ────────────────────────────────────────────────────────

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
  username: string
) {
  // Create Firebase Auth user first (always works regardless of Firestore)
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;
  await updateProfile(user, { displayName });

  // Create Firestore profile (non-blocking — fails gracefully if Firestore not ready)
  await createUserProfile(user, { username, displayName });

  return user;
}

export async function loginWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function logout() {
  try {
    if (auth.currentUser) {
      const { setOffline } = await import("./firestore");
      await setOffline(auth.currentUser.uid);
    }
  } catch { /* ignore */ }
  await signOut(auth);
}
