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
      .slice(0, 20);
    let username = baseUsername;
    let counter = 1;
    while (!(await checkUsernameAvailable(username))) {
      username = `${baseUsername}${counter++}`;
    }
    await createUserProfile(user, {
      username,
      displayName: user.displayName || "User",
    });
    return { user, isNew: true, username };
  }
  return { user, isNew: false, username: existing.username };
}

// ─── Phone / OTP ─────────────────────────────────────────────────────────────

let confirmationResult: ConfirmationResult | null = null;

export function setupRecaptcha(containerId: string) {
  if ((window as Window & { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier) {
    (window as Window & { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier!.clear();
  }
  const verifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
  (window as Window & { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier = verifier;
  return verifier;
}

export async function sendOTP(phone: string, containerId: string): Promise<void> {
  const verifier = setupRecaptcha(containerId);
  confirmationResult = await signInWithPhoneNumber(auth, phone, verifier);
}

export async function verifyOTP(otp: string) {
  if (!confirmationResult) throw new Error("No OTP session. Please request OTP first.");
  const result = await confirmationResult.confirm(otp);
  const user = result.user;

  const existing = await getUserProfile(user.uid);
  if (!existing) {
    return { user, isNew: true };
  }
  return { user, isNew: false };
}

// ─── Email / Password ────────────────────────────────────────────────────────

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
  username: string
) {
  const available = await checkUsernameAvailable(username);
  if (!available) throw new Error("Username already taken.");

  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;
  await updateProfile(user, { displayName });
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
  if (auth.currentUser) {
    const { setOffline } = await import("./firestore");
    await setOffline(auth.currentUser.uid);
  }
  await signOut(auth);
}
