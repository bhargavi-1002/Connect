import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, Eye, EyeOff } from "lucide-react";
import { AppLayout } from "@/components/app-layout";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      setLocation("/chats");
    }
  };

  return (
    <AppLayout showBottomNav={false} className="p-6">
      <div className="flex-1 flex flex-col pt-12 max-w-sm mx-auto w-full">
        <Link href="/onboarding" className="text-muted-foreground hover:text-white mb-8 self-start flex items-center">
          <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white glowing-primary mb-6"
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>
        
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-muted-foreground mb-10">Sign in to continue your connection.</p>
        
        <form onSubmit={handleLogin} className="space-y-6 flex-1">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-muted-foreground ml-1">Username</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <Input 
                id="username" 
                placeholder="your handle" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-14 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 pl-9 text-base"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <Label htmlFor="password" className="text-muted-foreground">Password</Label>
              <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
            </div>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-2xl bg-surface/50 border-white/10 focus-visible:ring-primary/50 pr-12 text-base"
                required
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
            disabled={!username || !password}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold text-base glowing-primary border-none mt-4"
          >
            Login
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </form>
        
        <p className="mt-8 text-center text-sm text-muted-foreground pb-4">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </AppLayout>
  );
}
