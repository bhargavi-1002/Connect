import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Users, Loader2, Check, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { listenToChats, createGroupChat, type Chat } from "@/lib/firestore";

export default function CreateGroupPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = listenToChats(user.uid, data => setChats(data));
    return () => unsub();
  }, [user]);

  const connections = chats
    .filter(c => !c.isGroup)
    .map(c => {
      const otherUid = c.participants.find(uid => uid !== user?.uid) || "";
      return {
        uid: otherUid,
        name: c.participantNames[otherUid] || "Unknown",
        photo: c.participantPhotos[otherUid],
      };
    })
    .filter(c => c.uid)
    .filter((c, i, arr) => arr.findIndex(a => a.uid === c.uid) === i);

  const toggle = (uid: string) => {
    setSelected(prev => prev.includes(uid) ? prev.filter(u => u !== uid) : [...prev, uid]);
  };

  const handleCreate = async () => {
    if (!user || selected.length < 2 || !groupName.trim()) return;
    setCreating(true);
    try {
      const chatId = await createGroupChat(user.uid, selected, groupName.trim());
      toast({ title: "Group created!" });
      setLocation(`/chats/${chatId}`);
    } catch {
      toast({ title: "Failed to create group", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <AppLayout showBottomNav={false}>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <Link href="/chats" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold leading-none">Create Group</h1>
          <p className="text-xs text-muted-foreground">Select 2 or more members</p>
        </div>
      </header>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto pb-24">
        <Input
          placeholder="Group name"
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
          className="h-12 rounded-2xl bg-surface/50 border-white/10 text-[15px] focus-visible:ring-primary/50"
        />

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground px-1">
            {selected.length} selected
          </p>
          {connections.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm">No connections yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Connect with people first to create a group</p>
            </div>
          ) : (
            connections.map((conn, i) => (
              <motion.button
                key={conn.uid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => toggle(conn.uid)}
                className={`w-full p-4 rounded-3xl flex items-center gap-3 transition-all text-left ${
                  selected.includes(conn.uid)
                    ? "glass-card border-primary/40"
                    : "glass-card hover:bg-white/[0.08]"
                }`}
              >
                {conn.photo ? (
                  <img src={conn.photo} alt={conn.name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                    {conn.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[15px] truncate">{conn.name}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selected.includes(conn.uid)
                    ? "border-primary bg-primary text-white"
                    : "border-white/20"
                }`}>
                  {selected.includes(conn.uid) && <Check className="w-3.5 h-3.5" />}
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe">
        <div className="w-full max-w-[430px] lg:max-w-[800px] p-4 glass-card rounded-t-3xl border-b-0 bg-surface/80 backdrop-blur-xl">
          <Button
            onClick={handleCreate}
            disabled={selected.length < 2 || !groupName.trim() || creating}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-base glowing-primary border-none"
          >
            {creating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Create Group <ChevronRight className="w-5 h-5 ml-1" /></>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}