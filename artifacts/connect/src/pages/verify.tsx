import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/app-layout";

export default function VerifyPage() {
  const [, setLocation] = useLocation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple chars
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isComplete = otp.every(digit => digit !== "");

  const handleVerify = () => {
    if (isComplete) {
      // Simulate verification, then go to chats
      setLocation("/chats");
    }
  };

  return (
    <AppLayout showBottomNav={false} className="p-6">
      <div className="flex-1 flex flex-col pt-12 max-w-sm mx-auto w-full">
        <Link href="/signup" className="text-muted-foreground hover:text-white mb-6 self-start flex items-center">
          <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="relative w-full aspect-square max-w-[180px] mx-auto mb-8"
        >
          <div className="absolute inset-0 bg-primary/40 blur-[60px] rounded-full mix-blend-screen" />
          <div className="absolute inset-0 bg-amber-500/20 blur-[40px] rounded-full mix-blend-screen translate-x-4" />
          <img 
            src="/otp-shield.png" 
            alt="Glowing shield" 
            className="w-full h-full object-contain relative z-10 drop-shadow-2xl animate-pulse"
            style={{ animationDuration: '3s' }}
          />
        </motion.div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Verify it's you</h1>
          <p className="text-muted-foreground">
            We sent a magical code to your device.
          </p>
        </div>
        
        <div className="flex justify-between gap-2 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold rounded-2xl bg-surface/80 border ${digit ? 'border-primary shadow-[0_0_15px_rgba(124,77,255,0.3)]' : 'border-white/10'} focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all`}
            />
          ))}
        </div>
        
        <div className="text-center mb-8">
          {countdown > 0 ? (
            <p className="text-sm text-muted-foreground">
              Resend code in <span className="text-primary font-medium">{countdown}s</span>
            </p>
          ) : (
            <button 
              onClick={() => setCountdown(30)}
              className="text-sm text-primary font-medium hover:underline"
            >
              Resend magic code
            </button>
          )}
        </div>
        
        <div className="mt-auto pb-4">
          <Button 
            onClick={handleVerify}
            disabled={!isComplete}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold text-base glowing-primary border-none disabled:opacity-50 disabled:shadow-none"
          >
            Verify & Enter
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
