import { createContext, useContext, useEffect, useState, useRef } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  getUserProfile, setOnline, setOffline, registerDevice,
  type UserProfile,
} from "@/lib/firestore";
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
    try {
      const p = await getUserProfile(auth.currentUser.uid);
      setProfile(p);
    } catch { /* ignore */ }
  };

  const resetAutoLogout = (minutes: number) => {
    if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current);
    if (minutes <= 0) return;
    autoLogoutTimer.current = setTimeout(() => {
      logout().catch(() => {});
    }, minutes * 60 * 1000);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // All Firestore calls are wrapped — they never throw
        setOnline(u.uid);
        registerDevice(u.uid, deviceId.current);
        const p = await getUserProfile(u.uid);
        setProfile(p);
        if (p) resetAutoLogout(p.autoLogoutMinutes);
      } else {
        setProfile(null);
        if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current);
      }
      setLoading(false);
    });

    const handleVisibilityChange = () => {
      if (document.hidden && auth.currentUser) {
        setOffline(auth.currentUser.uid);
      } else if (!document.hidden && auth.currentUser) {
        setOnline(auth.currentUser.uid);
      }
    };

    const handleActivity = () => {
      if (profile) resetAutoLogout(profile.autoLogoutMinutes);
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

  useEffect(() => {
    if (profile) resetAutoLogout(profile.autoLogoutMinutes);
  }, [profile?.autoLogoutMinutes]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
