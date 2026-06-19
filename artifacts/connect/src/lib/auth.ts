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
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { getUserProfile } from "./firestore";

// ─── Google Sign-In ──────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<{ isNew: boolean }> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const existing = await getUserProfile(result.user.uid);
  return { isNew: !existing };
}

// ─── Phone / OTP ─────────────────────────────────────────────────────────────

let confirmationResult: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

export function clearRecaptcha() {
  try {
    recaptchaVerifier?.clear();
    recaptchaVerifier = null;
  } catch { /* ignore */ }
  const el = document.getElementById("recaptcha-container");
  if (el) el.innerHTML = "";
}

export async function sendOTP(phone: string, containerId: string): Promise<void> {
  clearRecaptcha();
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
  confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
}

export async function verifyOTP(otp: string): Promise<{ isNew: boolean }> {
  if (!confirmationResult) throw new Error("No OTP session. Please request a new OTP.");
  const result = await confirmationResult.confirm(otp);
  const existing = await getUserProfile(result.user.uid);
  return { isNew: !existing };
}

// ─── Email / Password ────────────────────────────────────────────────────────

/** Creates only the Firebase Auth user. Firestore profile is created separately in setup-profile. */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  return result.user;
}

/** Login with either a @username or an email address + password. */
export async function loginWithUsernameOrEmail(usernameOrEmail: string, password: string) {
  let email = usernameOrEmail.trim();

  // Treat as username if it starts with @ OR contains no @ (no domain part)
  const isUsername = email.startsWith("@") || !email.includes("@");
  if (isUsername) {
    const username = email.replace(/^@/, "").toLowerCase();
    const snap = await getDoc(doc(db, "usernames", username));
    if (!snap.exists()) {
      throw new Error("Username not found. Please check and try again.");
    }
    const data = snap.data() as { uid: string; email?: string };
    if (!data.email) {
      throw new Error("This account was created with Google or Phone. Please use that sign-in method.");
    }
    email = data.email;
  }

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
