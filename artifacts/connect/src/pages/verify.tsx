import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Phone, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { sendOTP, verifyOTP, clearRecaptcha } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

function mapOtpError(msg: string): string {
  if (msg.includes("invalid-phone-number")) return "Invalid phone number. Use international format, e.g. +91 98765 43210";
  if (msg.includes("too-many-requests")) return "Too many OTP requests. Please wait a few minutes before trying again.";
  if (msg.includes("billing") || msg.includes("not-enabled") || msg.includes("admin-restricted")) {
    return "Phone sign-in requires a Firebase Blaze plan. Please use Google or Email/Password sign-in instead.";
  }
  if (msg.includes("network-request-failed") || msg.includes("offline")) return "No internet connection. Please check your network.";
  if (msg.includes("missing-client-identifier") || msg.includes("recaptcha")) return "reCAPTCHA verification failed. Please refresh and try again.";
  if (msg.includes("invalid-verification-code")) return "Incorrect OTP. Please check the code and try again.";
  if (msg.includes("session-expired") || msg.includes("expired")) return "OTP expired. Please request a new one.";
  return msg;
}

export default function VerifyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Clean up recaptcha on unmount
  useEffect(() => {
    return () => { clearRecaptcha(); };
  }, []);

  const handleSendOTP = async () => {
    const trimmed = phone.trim();
    if (!trimmed) return;
    const formatted = trimmed.startsWith("+") ? trimmed : `+${trimmed.replace(/\s/g, "")}`;
    setLoading(true);
    try {
      await sendOTP(formatted, "recaptcha-container");
      setStep("otp");
      toast({ title: "OTP sent!", description: `Code sent to ${formatted}` });
    } catch (err: unknown) {
      clearRecaptcha();
      const msg = err instanceof Error ? err.message : "Failed to send OTP.";
      const friendly = mapOtpError(msg);
      toast({ title: "OTP failed", description: friendly, variant: "destructive" });

      // If billing issue, redirect to email signup
      if (msg.includes("billing") || msg.includes("not-enabled") || msg.includes("admin-restricted")) {
        setTimeout(() => setLocation("/signup"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) inputs.current[index + 1]?.focus();
    if (!value && index > 0) inputs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const { isNew } = await verifyOTP(code);
      setLocation(isNew ? "/signup" : "/chats");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed.";
      toast({ title: "Verification failed", description: mapOtpError(msg), variant: "destructive" });
      if (msg.includes("session-expired") || msg.includes("expired")) {
        setStep("phone");
        setOtp(["", "", "", "", "", ""]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    clearRecaptcha();
    setStep("phone");
    setOtp(["", "", "", "", "", ""]);
  };

  return (
    <AppLayout showBottomNav={false} className="p-6">
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" />

      <div className="flex-1 flex flex-col pt-10 max-w-sm mx-auto w-full">
        <Link href="/onboarding" className="text-muted-foreground hover:text-white mb-8 self-start flex items-center gap-1">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 rounded-3xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white mb-6 shadow-[0_0_20px_rgba(124,77,255,0.4)]"
        >
          <Phone className="w-8 h-8" />
        </motion.div>

        {/* Blaze plan notice */}
        <div className="flex items-start gap-2 bg-warning/10 border border-warning/20 rounded-2xl p-3 mb-6">
          <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-xs text-warning/90 leading-relaxed">
            Phone sign-in requires a Firebase Blaze (pay-as-you-go) plan. If it fails, use{" "}
            <Link href="/signup" className="underline font-medium">Email/Password</Link> or{" "}
            <Link href="/onboarding" className="underline font-medium">Google</Link> sign-in instead.
          </p>
        </div>

        {step === "phone" ? (
          <>
            <h1 className="text-3xl font-bold mb-2">Mobile Verification</h1>
            <p className="text-muted-foreground mb-8 text-sm">
              Enter your number with country code (e.g. +91 for India)
            </p>

            <div className="flex-1 space-y-2">
              <Input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-14 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 px-4 text-base"
                onKeyDown={(e) => { if (e.key === "Enter") handleSendOTP(); }}
              />
            </div>

            <Button
              onClick={handleSendOTP}
              disabled={phone.trim().length < 8 || loading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold text-base glowing-primary border-none mt-8"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Send OTP <ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">Enter OTP</h1>
            <p className="text-muted-foreground mb-8 text-sm">
              6-digit code sent to <span className="text-white font-medium">{phone}</span>
            </p>

            <div className="flex gap-2 justify-between mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !digit && i > 0) inputs.current[i - 1]?.focus();
                  }}
                  className="w-12 h-14 rounded-xl bg-surface/50 border border-white/10 text-center text-xl font-bold text-white focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/50 transition-colors"
                />
              ))}
            </div>

            <button
              onClick={handleResend}
              className="text-sm text-primary hover:underline text-center mb-6 w-full"
            >
              Didn't receive it? Resend OTP
            </button>

            <Button
              onClick={handleVerify}
              disabled={otp.join("").length !== 6 || loading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold text-base glowing-primary border-none"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Verify & Continue <ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Prefer email?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Sign up with Email
          </Link>
        </p>
      </div>
    </AppLayout>
  );
}
