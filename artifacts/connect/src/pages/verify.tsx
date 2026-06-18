import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Phone } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { sendOTP, verifyOTP } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function VerifyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 8) return;
    setLoading(true);
    try {
      await sendOTP(phone.startsWith("+") ? phone : `+${phone}`, "recaptcha-container");
      setStep("otp");
      toast({ title: "OTP Sent!", description: "Check your phone." });
    } catch (err: unknown) {
      toast({ title: "Failed to send OTP", description: err instanceof Error ? err.message : "Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
    if (!value && index > 0) inputs.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const { isNew } = await verifyOTP(code);
      setLocation(isNew ? "/signup" : "/chats");
    } catch (err: unknown) {
      toast({ title: "Invalid OTP", description: err instanceof Error ? err.message : "Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout showBottomNav={false} className="p-6">
      <div id="recaptcha-container" />
      <div className="flex-1 flex flex-col pt-12 max-w-sm mx-auto w-full">
        <Link href="/onboarding" className="text-muted-foreground hover:text-white mb-8 self-start flex items-center">
          <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 rounded-3xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white mb-6"
        >
          <Phone className="w-8 h-8" />
        </motion.div>

        {step === "phone" ? (
          <>
            <h1 className="text-3xl font-bold mb-2">Mobile Verification</h1>
            <p className="text-muted-foreground mb-10">Enter your phone number with country code.</p>
            <div className="flex-1">
              <Input
                type="tel"
                placeholder="+1 234 567 8900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-14 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 px-4 text-base"
              />
            </div>
            <Button
              onClick={handleSendOTP}
              disabled={!phone || loading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold text-base glowing-primary border-none mt-8"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send OTP <ArrowRight className="w-5 h-5 ml-2" /></>}
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">Enter OTP</h1>
            <p className="text-muted-foreground mb-10">We sent a 6-digit code to {phone}</p>

            <div className="flex gap-3 justify-center mb-8">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className="w-12 h-14 rounded-xl bg-surface/50 border border-white/10 text-center text-xl font-bold text-white focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/50 transition-colors"
                />
              ))}
            </div>

            <button onClick={() => { setStep("phone"); setOtp(["","","","","",""]); }} className="text-sm text-primary hover:underline text-center mb-6">
              Resend OTP
            </button>

            <Button
              onClick={handleVerify}
              disabled={otp.join("").length !== 6 || loading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold text-base glowing-primary border-none"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Continue <ArrowRight className="w-5 h-5 ml-2" /></>}
            </Button>
          </>
        )}
      </div>
    </AppLayout>
  );
}
