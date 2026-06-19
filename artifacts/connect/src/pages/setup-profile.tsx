import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ArrowRight, Loader2, XCircle, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { createUserProfile, checkUsernameAvailable } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function SetupProfilePage() {
  const [, setLocation] = useLocation();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  const debouncedUsername = useDebounce(username, 600);

  // Pre-fill display name from Firebase Auth user
  useEffect(() => {
    const u = auth.currentUser;
    if (u?.displayName) setDisplayName(u.displayName);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) setLocation("/onboarding");
  }, [loading, user, setLocation]);

  // If profile already created, send to chats
  useEffect(() => {
    if (!loading && profile) setLocation("/chats");
  }, [loading, profile, setLocation]);

  // Real-time username availability check
  useEffect(() => {
    const u = debouncedUsername;
    if (u.length < 3) { setUsernameAvailable(null); return; }
    if (!/^[a-z0-9_]+$/.test(u)) { setUsernameAvailable(false); return; }
    setCheckingUsername(true);
    checkUsernameAvailable(u)
      .then(setUsernameAvailable)
      .catch(() => setUsernameAvailable(null))
      .finally(() => setCheckingUsername(false));
  }, [debouncedUsername]);

  const usernameValid = username.length >= 3 && /^[a-z0-9_]+$/.test(username);
  const canSubmit = displayName.trim().length >= 2 && usernameValid && usernameAvailable !== false && !checkingUsername;

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;
    setSaving(true);
    try {
      await createUserProfile(user, { username, displayName: displayName.trim() });
      setLocation("/chats");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create profile.";
      if (msg.includes("already-exists") || msg.includes("already exist")) {
        toast({ title: "Username already taken", description: "Please choose a different username.", variant: "destructive" });
        setUsernameAvailable(false);
      } else {
        toast({ title: "Error", description: msg, variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <AppLayout showBottomNav={false} className="p-6">
      <div className="flex-1 flex flex-col pt-12 max-w-sm mx-auto w-full">

        {/* Hero icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white glowing-primary mb-6 shadow-xl"
        >
          <Sparkles className="w-10 h-10" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold mb-2"
        >
          Almost there! 🎉
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-muted-foreground mb-8 text-sm leading-relaxed"
        >
          Set your display name and pick a unique @username — your family will use it to find and connect with you.
        </motion.p>

        <div className="space-y-5 flex-1">

          {/* Display Name */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide ml-1">Display Name</Label>
            <Input
              placeholder="Your full name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-14 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 px-4 text-base"
            />
            <p className="text-xs text-muted-foreground ml-1">This is how your family will see you</p>
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide ml-1">Username</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg">@</span>
              <Input
                placeholder="choose_your_handle"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                }
                className={`h-14 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 pl-8 pr-28 text-base transition-colors ${
                  usernameAvailable === true
                    ? "border-success/40 focus-visible:ring-success/40"
                    : usernameAvailable === false
                    ? "border-destructive/40 focus-visible:ring-destructive/40"
                    : ""
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <AnimatePresence mode="wait">
                  {checkingUsername && (
                    <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </motion.div>
                  )}
                  {!checkingUsername && usernameAvailable === true && (
                    <motion.span
                      key="available"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-lg"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Available
                    </motion.span>
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <motion.span
                      key="taken"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-lg"
                    >
                      <XCircle className="w-3 h-3" /> Taken
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <p className="text-xs text-muted-foreground ml-1">3–20 characters · lowercase, numbers, and _ only</p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || saving}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold text-base glowing-primary border-none mt-8"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>Let's Go! <ArrowRight className="w-5 h-5 ml-2" /></>
          )}
        </Button>
      </div>
    </AppLayout>
  );
}
