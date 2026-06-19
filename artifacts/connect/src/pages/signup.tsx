import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ArrowRight, Loader2, XCircle, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { registerWithEmail } from "@/lib/auth";
import { checkUsernameAvailable } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

function mapFirebaseError(msg: string): string {
  if (msg.includes("email-already-in-use")) return "This email is already registered. Try signing in instead.";
  if (msg.includes("weak-password")) return "Password is too weak. Use at least 6 characters.";
  if (msg.includes("invalid-email")) return "Please enter a valid email address.";
  if (msg.includes("network-request-failed") || msg.includes("offline")) return "No internet connection. Please check your network and try again.";
  if (msg.includes("too-many-requests")) return "Too many attempts. Please wait a moment and try again.";
  return msg;
}

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [firestoreOffline, setFirestoreOffline] = useState(false);

  const debouncedUsername = useDebounce(username, 600);

  useEffect(() => {
    if (debouncedUsername.length < 3) {
      setUsernameAvailable(null);
      setFirestoreOffline(false);
      return;
    }
    if (!/^[a-z0-9_]+$/.test(debouncedUsername)) {
      setUsernameAvailable(false);
      return;
    }
    setCheckingUsername(true);
    checkUsernameAvailable(debouncedUsername)
      .then(available => {
        setUsernameAvailable(available);
        setFirestoreOffline(false);
      })
      .catch(() => {
        // Firestore not set up yet — allow signup to proceed
        setUsernameAvailable(null);
        setFirestoreOffline(true);
      })
      .finally(() => setCheckingUsername(false));
  }, [debouncedUsername]);

  const usernameValid = username.length >= 3 && /^[a-z0-9_]+$/.test(username);

  // Allow submit when:
  // - username valid AND (available confirmed OR Firestore offline — duplicate checked at write)
  const canSubmit =
    name.trim().length >= 2 &&
    email.includes("@") &&
    password.length >= 6 &&
    usernameValid &&
    usernameAvailable !== false; // false = confirmed taken; null = unknown (allow)

  const handleSignup = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await registerWithEmail(email.trim(), password, name.trim(), username);
      setLocation("/chats");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Please try again.";
      toast({
        title: "Sign-up failed",
        description: mapFirebaseError(msg),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout showBottomNav={false} className="p-6">
      <div className="flex-1 flex flex-col pt-10 max-w-sm mx-auto w-full">
        <Link href="/onboarding" className="text-muted-foreground hover:text-white mb-6 self-start flex items-center gap-1">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full aspect-square max-w-[160px] mx-auto mb-6"
        >
          <div className="absolute inset-0 bg-secondary/30 blur-[50px] rounded-full" />
          <img
            src="/signup-wave.png"
            alt="Create Account"
            className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </motion.div>

        <h1 className="text-3xl font-bold mb-1">Create Account</h1>
        <p className="text-muted-foreground mb-6 text-sm">Join Connect and stay close to your family.</p>

        <div className="space-y-4 flex-1">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs ml-1 uppercase tracking-wide">Full Name</Label>
            <Input
              placeholder="e.g. Alex Magic"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-13 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 px-4 text-base"
            />
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs ml-1 uppercase tracking-wide">Username</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">@</span>
              <Input
                placeholder="choose_a_handle"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                }
                className={`h-13 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 pl-8 pr-28 text-base ${
                  usernameAvailable === true ? "border-success/40" : usernameAvailable === false ? "border-destructive/40" : ""
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                {checkingUsername && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
                {!checkingUsername && usernameAvailable === true && (
                  <span className="flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-lg">
                    <CheckCircle2 className="w-3 h-3" /> Available
                  </span>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <span className="flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-lg">
                    <XCircle className="w-3 h-3" /> Taken
                  </span>
                )}
                {!checkingUsername && firestoreOffline && username.length >= 3 && (
                  <span className="text-xs text-muted-foreground px-2">✓ ok</span>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground ml-1">Lowercase letters, numbers and _ only</p>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs ml-1 uppercase tracking-wide">Email</Label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-13 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 px-4 text-base"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs ml-1 uppercase tracking-wide">Password</Label>
            <Input
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-13 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 px-4 text-base"
            />
          </div>
        </div>

        <Button
          onClick={handleSignup}
          disabled={!canSubmit || loading}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold text-base glowing-primary border-none mt-6"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>Create Account <ArrowRight className="w-5 h-5 ml-2" /></>
          )}
        </Button>

        <p className="mt-4 text-center text-sm text-muted-foreground pb-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AppLayout>
  );
}
