import { useState, useEffect } from "react";
import { Siren, Clock, MapPin, Loader2, Send } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  listenToEmergencyAlerts, listenToMyAlerts, resolveAlert,
  sendEmergencyAlert, listenToChats, type EmergencyAlert,
} from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function AlertPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [myAlerts, setMyAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSend, setShowSend] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertLoc, setAlertLoc] = useState("");
  const [sending, setSending] = useState(false);
  const [contactUids, setContactUids] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub1 = listenToEmergencyAlerts(user.uid, (data) => {
      setAlerts(data);
      setLoading(false);
    });
    const unsub2 = listenToMyAlerts(user.uid, setMyAlerts);
    const unsub3 = listenToChats(user.uid, (chats) => {
      const uids = Array.from(new Set(
        chats.flatMap(c => c.participants.filter(uid => uid !== user.uid))
      ));
      setContactUids(uids);
    });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [user]);

  const handleResolve = async (alertId: string) => {
    await resolveAlert(alertId);
    toast({ title: "Alert resolved" });
  };

  const handleSendAlert = async () => {
    if (!profile || !alertMsg.trim()) return;
    setSending(true);
    try {
      await sendEmergencyAlert(profile, alertMsg.trim(), alertLoc.trim(), contactUids);
      toast({ title: "Emergency alert sent!", description: "All your contacts have been notified." });
      setShowSend(false);
      setAlertMsg("");
      setAlertLoc("");
    } catch (err: unknown) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const allAlerts = [
    ...myAlerts.map(a => ({ ...a, isMine: true })),
    ...alerts.map(a => ({ ...a, isMine: false })),
  ].sort((a, b) => {
    const at = a.createdAt?.toDate?.()?.getTime() ?? 0;
    const bt = b.createdAt?.toDate?.()?.getTime() ?? 0;
    return bt - at;
  });

  return (
    <AppLayout showBottomNav={true}>
      <header className="pt-12 pb-4 px-6 sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-destructive flex items-center gap-2">
              <Siren className="w-6 h-6 animate-pulse" />
              Emergency Alerts
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Critical notifications from your network</p>
          </div>
          <Button
            onClick={() => setShowSend(v => !v)}
            size="sm"
            className="rounded-full bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/30 font-medium"
          >
            <Siren className="w-4 h-4 mr-1" /> SOS
          </Button>
        </div>

        {showSend && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/30 space-y-3"
          >
            <p className="text-sm font-medium text-destructive">Send Emergency Alert to all contacts</p>
            <Input
              placeholder="What's happening?"
              value={alertMsg}
              onChange={(e) => setAlertMsg(e.target.value)}
              className="h-12 rounded-xl bg-surface/50 border-white/10 text-sm"
            />
            <Input
              placeholder="Your location (optional)"
              value={alertLoc}
              onChange={(e) => setAlertLoc(e.target.value)}
              className="h-12 rounded-xl bg-surface/50 border-white/10 text-sm"
            />
            <Button
              onClick={handleSendAlert}
              disabled={!alertMsg.trim() || sending || contactUids.length === 0}
              className="w-full h-11 rounded-xl bg-destructive text-white font-semibold"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Send Alert</>}
            </Button>
            {contactUids.length === 0 && (
              <p className="text-xs text-muted-foreground text-center">Add connections first to send alerts.</p>
            )}
          </motion.div>
        )}
      </header>

      <div className="p-4 pb-20 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-destructive border-t-transparent animate-spin" />
          </div>
        ) : allAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4 text-success">
              <Siren className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg">All Clear</h3>
            <p className="text-sm text-muted-foreground">No emergency alerts right now.</p>
          </div>
        ) : (
          allAlerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`p-5 rounded-3xl border-2 ${alert.active ? "bg-destructive/10 border-destructive shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "glass-card border-white/5"}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alert.active ? "bg-destructive text-white animate-pulse" : "bg-white/10 text-muted-foreground"}`}>
                    <Siren className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${alert.active ? "text-white" : "text-white/70"}`}>
                      {alert.isMine ? "You" : alert.senderName}
                      {alert.isMine && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-normal">Sent by you</span>}
                    </h3>
                    <p className="text-xs text-muted-foreground">@{alert.senderUsername}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {alert.createdAt?.toDate ? formatDistanceToNow(alert.createdAt.toDate(), { addSuffix: true }) : ""}
                </div>
              </div>

              <p className={`text-[15px] leading-relaxed mb-4 ${alert.active ? "text-white font-medium" : "text-muted-foreground"}`}>
                "{alert.message}"
              </p>

              <div className="flex items-center justify-between">
                {alert.location ? (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-black/20 px-2 py-1 rounded-md">
                    <MapPin className="w-3 h-3" /> {alert.location}
                  </div>
                ) : <div />}

                {alert.active && (alert.isMine || alert.senderUid === user?.uid) && (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="text-xs font-bold text-white bg-destructive hover:bg-destructive/90 px-4 py-2 rounded-full transition-colors"
                  >
                    Resolve Alert
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </AppLayout>
  );
}
