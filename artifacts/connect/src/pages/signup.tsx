import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ArrowRight, Loader2, XCircle } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { registerWithEmail } from "@/lib/auth";
import { checkUsernameAvailable } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

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

  const debouncedUsername = useDebounce(username, 500);

  const handleUsernameChange = async (val: string) => {
    setUsername(val);
    if (val.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    const available = await checkUsernameAvailable(val);
    setUsernameAvailable(available);
    setCheckingUsername(false);
  };

  const canSubmit = name && email && password.length >= 6 && usernameAvailable === true;

  const handleSignup = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await registerWithEmail(email, password, name, username);
      setLocation("/chats");
    } catch (err: unknown) {
      toast({
        title: "Sign-up failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout showBottomNav={false} className="p-6">
      <div className="flex-1 flex flex-col pt-12 max-w-sm mx-auto w-full">
        <Link href="/onboarding" className="text-muted-foreground hover:text-white mb-6 self-start flex items-center">
          <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full aspect-square max-w-[180px] mx-auto mb-8"
        >
          <div className="absolute inset-0 bg-secondary/30 blur-[50px] rounded-full" />
          <img
            src="/signup-wave.png"
            alt="Create Account"
            className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
          />
        </motion.div>

        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-muted-foreground mb-8">Join the magic and connect with your family.</p>

        <div className="space-y-5 flex-1">
          <div className="space-y-2">
            <Label className="text-muted-foreground ml-1">Full Name</Label>
            <Input
              placeholder="e.g. Alex Magic"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 px-4 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground ml-1">Username</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                placeholder="choose_a_handle"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value.toLowerCase().replace(/\s/g, "_"))}
                className={`h-14 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 pl-8 pr-24 text-base ${usernameAvailable === true ? "border-success/50" : usernameAvailable === false ? "border-destructive/50" : ""}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                {checkingUsername && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                {!checkingUsername && usernameAvailable === true && (
                  <span className="flex items-center text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-md">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Available
                  </span>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <span className="flex items-center text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-md">
                    <XCircle className="w-3 h-3 mr-1" /> Taken
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground ml-1">Email</Label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 px-4 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground ml-1">Password</Label>
            <Input
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 px-4 text-base"
            />
          </div>
        </div>

        <Button
          onClick={handleSignup}
          disabled={!canSubmit || loading}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold text-base glowing-primary border-none mt-8"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5 ml-2" /></>}
        </Button>

        <p className="mt-4 text-center text-sm text-muted-foreground pb-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </AppLayout>
  );
}
