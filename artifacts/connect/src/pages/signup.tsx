import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { registerWithEmail } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

function mapError(msg: string): string {
  if (msg.includes("email-already-in-use")) return "This email is already registered. Try signing in instead.";
  if (msg.includes("weak-password")) return "Password must be at least 6 characters.";
  if (msg.includes("invalid-email")) return "Please enter a valid email address.";
  if (msg.includes("network-request-failed") || msg.includes("offline")) return "No internet. Please check your connection.";
  if (msg.includes("too-many-requests")) return "Too many attempts. Please wait and try again.";
  return msg;
}

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = name.trim().length >= 2 && email.includes("@") && password.length >= 6;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await registerWithEmail(email.trim(), password, name.trim());
      // After creating Firebase Auth account, send to profile setup (choose username)
      setLocation("/setup-profile");
    } catch (err: unknown) {
      toast({
        title: "Sign-up failed",
        description: mapError(err instanceof Error ? err.message : "Please try again."),
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
          className="relative w-full max-w-[150px] mx-auto mb-6"
        >
          <div className="absolute inset-0 bg-secondary/30 blur-[50px] rounded-full" />
          <img
            src="/signup-wave.png"
            alt="Sign up"
            className="w-full aspect-square object-contain relative z-10 drop-shadow-2xl"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </motion.div>

        <h1 className="text-3xl font-bold mb-1">Create Account</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Step 1 of 2 — we'll set your @username next.
        </p>

        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          <div className="h-1.5 w-8 rounded-full bg-primary" />
          <div className="h-1.5 w-8 rounded-full bg-white/20" />
        </div>

        <form onSubmit={handleSignup} className="space-y-4 flex-1">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide ml-1">Full Name</Label>
            <Input
              placeholder="e.g. Alex Magic"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 px-4 text-base"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide ml-1">Email Address</Label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 px-4 text-base"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide ml-1">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 pr-12 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold text-base glowing-primary border-none mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Continue <ArrowRight className="w-5 h-5 ml-2" /></>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground pb-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </AppLayout>
  );
}
