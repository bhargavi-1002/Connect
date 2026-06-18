import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/app-layout";
import { Loader2, UserPlus, Sparkles } from "lucide-react";
import { searchUsersByUsername, sendContactRequest, type UserProfile } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function InvitePage() {
  const [, params] = useRoute("/invite/:username");
  const username = params?.username || "";
  const { user, profile } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [target, setTarget] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!username) return;
    searchUsersByUsername(username).then(results => {
      const match = results.find(u => u.username === username.toLowerCase());
      setTarget(match || null);
      setLoading(false);
    });
  }, [username]);

  const handleConnect = async () => {
    if (!profile || !target) return;
    setSending(true);
    try {
      await sendContactRequest(profile, target.uid);
      toast({ title: "Request sent!", description: `Connection request sent to @${target.username}` });
      setLocation("/chats");
    } catch (err: unknown) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <AppLayout showBottomNav={false} className="justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center max-w-sm mx-auto w-full"
      >
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white glowing-primary mb-8">
          <Sparkles className="w-8 h-8" />
        </div>

        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        ) : !target ? (
          <>
            <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
            <p className="text-muted-foreground mb-8">The username @{username} doesn't exist.</p>
            <Button onClick={() => setLocation("/")} className="rounded-2xl bg-primary text-white h-12 px-8">
              Go Home
            </Button>
          </>
        ) : (
          <>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-3xl border-4 border-surface mb-4 overflow-hidden">
              {target.photoURL ? (
                <img src={target.photoURL} alt={target.displayName} className="w-full h-full object-cover" />
              ) : (
                target.displayName.charAt(0).toUpperCase()
              )}
            </div>
            <h1 className="text-2xl font-bold mb-1">{target.displayName}</h1>
            <p className="text-primary font-medium mb-2">@{target.username}</p>
            {target.bio && <p className="text-muted-foreground text-sm mb-6">{target.bio}</p>}

            <p className="text-muted-foreground mb-8">
              Connect with <strong className="text-white">{target.displayName}</strong> on Connect to send messages and stay in touch.
            </p>

            {!user ? (
              <Button onClick={() => setLocation("/onboarding")} className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold glowing-primary border-none">
                Sign in to Connect
              </Button>
            ) : target.uid === user.uid ? (
              <p className="text-muted-foreground text-sm">This is your own profile link.</p>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={sending}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold glowing-primary border-none"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-5 h-5 mr-2" /> Send Connection Request</>}
              </Button>
            )}
          </>
        )}
      </motion.div>
    </AppLayout>
  );
}
