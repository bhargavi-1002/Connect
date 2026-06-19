import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { signInWithGoogle } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const { isNew } = await signInWithGoogle();
      // New users → set up their username first
      setLocation(isNew ? "/setup-profile" : "/chats");
    } catch (err: unknown) {
      toast({
        title: "Google sign-in failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout showBottomNav={false} className="justify-center p-6">
      <div id="recaptcha-container" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center max-w-sm mx-auto w-full"
      >
        {/* Hero image */}
        <div className="relative w-full aspect-square max-w-[260px] mb-8">
          <div className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full" />
          <img
            src="/onboarding-cloud.png"
            alt="Connect"
            className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
            }}
          />
        </div>

        <h1 className="text-3xl font-bold mb-2 tracking-tight">Welcome to Connect</h1>
        <p className="text-muted-foreground mb-10 text-[15px] leading-relaxed">
          Stay close to your family — even from afar.
          <br />
          <span className="text-primary/80">No phone required to get started.</span>
        </p>

        <div className="flex flex-col gap-3 w-full">
          {/* Google */}
          <Button
            onClick={handleGoogle}
            disabled={loading}
            variant="outline"
            className="w-full h-14 rounded-2xl glass-card border-white/10 hover:bg-white/5 font-medium text-base"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </Button>

          {/* Phone OTP */}
          <Link href="/verify" className="w-full">
            <Button
              variant="outline"
              className="w-full h-14 rounded-2xl glass-card border-white/10 hover:bg-white/5 font-medium text-base"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              Continue with Mobile OTP
            </Button>
          </Link>

          {/* Username / Email login */}
          <Link href="/login" className="w-full">
            <Button
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold text-base glowing-primary border-none"
              disabled={loading}
            >
              <User className="w-5 h-5 mr-2" />
              Login with Username
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </AppLayout>
  );
}
