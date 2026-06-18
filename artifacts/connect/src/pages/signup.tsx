import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { useCheckUsername } from "@workspace/api-client-react";

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  
  // Basic mock check since backend isn't ready
  const isUsernameValid = username.length >= 3;
  const isAvailable = isUsernameValid && username.toLowerCase() !== "admin";

  const handleNext = () => {
    if (name && isAvailable) {
      setLocation("/verify");
    }
  };

  return (
    <AppLayout showBottomNav={false} className="p-6">
      <div className="flex-1 flex flex-col pt-12 max-w-sm mx-auto w-full">
        <Link href="/onboarding" className="text-muted-foreground hover:text-white mb-6 self-start flex items-center">
          <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full aspect-square max-w-[200px] mx-auto mb-8"
        >
          <div className="absolute inset-0 bg-secondary/30 blur-[50px] rounded-full" />
          <img 
            src="/signup-wave.png" 
            alt="Cute girl waving" 
            className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
          />
        </motion.div>
        
        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-muted-foreground mb-8">Join the magic and connect with your family.</p>
        
        <div className="space-y-5 flex-1">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground ml-1">Full Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Alex Magic" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 px-4 text-base"
            />
          </div>
          
          <div className="space-y-2 relative">
            <Label htmlFor="username" className="text-muted-foreground ml-1">Username</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <Input 
                id="username" 
                placeholder="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`h-14 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 pl-8 pr-24 text-base ${isAvailable ? 'border-success/50' : ''}`}
              />
              {isUsernameValid && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                  {isAvailable ? (
                    <span className="flex items-center text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-md">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Available
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-md">
                      Taken
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleNext}
          disabled={!name || !isAvailable}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold text-base glowing-primary border-none mt-8"
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </AppLayout>
  );
}
