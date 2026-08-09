import { useState } from "react";
import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateUserPassword } from "@/lib/auth";
import { Loader2, ArrowLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function SecuritySettingsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      await updateUserPassword(newPassword);
      toast({ title: "Password updated successfully" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg = err.message || "Failed to update password. You may need to sign out and sign back in to verify your identity.";
      toast({ title: "Update failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout showBottomNav={false}>
      <div className="pt-12 px-5 max-w-md mx-auto">
        <Link href="/settings" className="text-muted-foreground hover:text-white mb-6 flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Back to Settings
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Privacy & Security</h1>
          <p className="text-muted-foreground text-sm mb-8">Update your password to keep your account secure.</p>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide ml-1">New Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-14 rounded-2xl bg-surface/50 border-white/10 px-4"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide ml-1">Confirm Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-14 rounded-2xl bg-surface/50 border-white/10 px-4"
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full h-14 rounded-2xl bg-primary text-white font-semibold mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
            </Button>
          </form>
        </motion.div>
      </div>
    </AppLayout>
  );
}
