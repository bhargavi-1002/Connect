import { createContext, useContext, useEffect, useState, useRef } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  getUserProfile, setOnline, setOffline, registerDevice,
  type UserProfile,
} from "@/lib/firestore";
import { applyTheme } from "@/lib/themes";
import { logout } from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const autoLogoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deviceId = useRef<string>(
    localStorage.getItem("connect_device_id") || (() => {
      const id = crypto.randomUUID();
      localStorage.setItem("connect_device_id", id);
      return id;
    })()
  );

  const refreshProfile = async () => {
    if (!auth.currentUser) return;
    const p = await getUserProfile(auth.currentUser.uid);
    setProfile(p);
    if (p) applyTheme(p.theme || "midnight");
  };

  const resetAutoLogout = (minutes: number) => {
    if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current);
    if (minutes <= 0) return;
    autoLogoutTimer.current = setTimeout(() => {
      logout().catch(() => {});
    }, minutes * 60 * 1000);
  };

  useEffect(() => {
    // Apply default theme immediately on load
    applyTheme("midnight");

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setOnline(u.uid);
        registerDevice(u.uid, deviceId.current);
        const p = await getUserProfile(u.uid);
        setProfile(p);
        if (p) {
          applyTheme(p.theme || "midnight");
          resetAutoLogout(p.autoLogoutMinutes ?? 15);
        }
      } else {
        setProfile(null);
        applyTheme("midnight");
        if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current);
      }
      setLoading(false);
    });

    const handleVisibilityChange = () => {
      if (!auth.currentUser) return;
      if (document.hidden) setOffline(auth.currentUser.uid);
      else setOnline(auth.currentUser.uid);
    };

    let activityProfile = profile;
    const handleActivity = () => {
      if (activityProfile) resetAutoLogout(activityProfile.autoLogoutMinutes ?? 15);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("mousemove", handleActivity);
    document.addEventListener("keydown", handleActivity);
    document.addEventListener("touchstart", handleActivity);

    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("mousemove", handleActivity);
      document.removeEventListener("keydown", handleActivity);
      document.removeEventListener("touchstart", handleActivity);
      if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current);
    };
  }, []);

  // Re-apply theme and reset timer when profile changes
  useEffect(() => {
    if (profile) {
      applyTheme(profile.theme || "midnight");
      resetAutoLogout(profile.autoLogoutMinutes ?? 15);
    }
  }, [profile?.theme, profile?.autoLogoutMinutes]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
