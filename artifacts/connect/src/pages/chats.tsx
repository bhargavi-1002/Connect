import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, Plus, Sparkles, UserPlus, ScanLine, Link as LinkIcon } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { listenToChats, markChatRead, generateInviteLink, type Chat } from "@/lib/firestore";
import { formatDistanceToNow } from "date-fns";

const priorityDot: Record<string, string> = {
  important: "bg-warning",
  urgent: "bg-orange-500",
  emergency: "bg-destructive",
  good_news: "bg-info",
  normal: "",
};

function formatTime(ts: { toDate?: () => Date } | null | undefined) {
  if (!ts) return "";
  try {
    const date = ts.toDate ? ts.toDate() : new Date(ts as unknown as string);
    return formatDistanceToNow(date, { addSuffix: false });
  } catch {
    return "";
  }
}

export default function ChatsPage() {
  const { user, profile } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const tabs = ["All", "Important", "Groups", "Emergency"];

  useEffect(() => {
    if (!user) return;
    const unsub = listenToChats(user.uid, (data) => {
      setChats(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const filtered = chats.filter(chat => {
    const name = chat.isGroup
      ? chat.groupName || "Group"
      : Object.entries(chat.participantNames).find(([uid]) => uid !== user?.uid)?.[1] || "Unknown";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "important") {
      return matchesSearch && (chat.lastMessage.startsWith("[important]") || chat.lastMessage.startsWith("[urgent]"));
    }
    if (activeTab === "groups") return matchesSearch && chat.isGroup;
    if (activeTab === "emergency") return matchesSearch && chat.lastMessage.startsWith("[emergency]");
    return matchesSearch;
  });

  const handleChatClick = async (chat: Chat) => {
    if (user && chat.unreadCount[user.uid] > 0) {
      await markChatRead(chat.id, user.uid);
    }
    setLocation(`/chats/${chat.id}`);
  };

  const copyInviteLink = () => {
    if (profile) {
      const link = generateInviteLink(profile.username);
      navigator.clipboard.writeText(link);
    }
  };

  return (
    <AppLayout showBottomNav={true}>
      <header className="pt-12 pb-4 px-6 sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center glowing-primary">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Connect</span>
          </div>
          <Link href="/connections">
            <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white glowing-primary">
              <Plus className="w-5 h-5" />
            </button>
          </Link>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search connections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 rounded-2xl bg-surface/50 border-white/10 pl-12 pr-4 text-[15px] focus-visible:ring-primary/50"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.toLowerCase() ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center px-6"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-primary/60" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Connections Yet</h3>
            <p className="text-muted-foreground text-[15px] leading-relaxed mb-8">
              Search by username, scan a QR code, or share your invite link to connect with family and friends.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Link href="/connections">
                <Button className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold glowing-primary border-none">
                  <UserPlus className="w-4 h-4 mr-2" /> Search Username
                </Button>
              </Link>
              <Link href="/connections">
                <Button variant="outline" className="w-full h-12 rounded-2xl glass-card border-white/10 hover:bg-white/5 font-medium">
                  <ScanLine className="w-4 h-4 mr-2" /> Scan QR Code
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={copyInviteLink}
                className="w-full h-12 rounded-2xl glass-card border-white/10 hover:bg-white/5 font-medium"
              >
                <LinkIcon className="w-4 h-4 mr-2" /> Share Invite Link
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((chat, i) => {
              const otherUid = chat.participants.find(uid => uid !== user?.uid) || "";
              const name = chat.isGroup
                ? chat.groupName || "Group"
                : chat.participantNames[otherUid] || "Unknown";
              const photo = chat.isGroup
                ? chat.groupPhoto
                : chat.participantPhotos[otherUid];
              const unread = user ? (chat.unreadCount[user.uid] || 0) : 0;
              const lastPriority = chat.lastMessage.match(/^\[(\w+)\]/)?.[1] || "normal";
              const displayMessage = chat.lastMessage.replace(/^\[\w+\]\s*/, "");

              return (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleChatClick(chat)}
                  className="p-4 rounded-3xl glass-card flex items-center gap-4 hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  <div className="relative flex-shrink-0">
                    {photo ? (
                      <img src={photo} alt={name} className="w-14 h-14 rounded-full object-cover border border-white/10" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl border border-white/10">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold text-[17px] truncate">{name}</h3>
                      <span className={`text-xs whitespace-nowrap ml-2 ${unread ? "text-primary font-medium" : "text-muted-foreground"}`}>
                        {formatTime(chat.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {priorityDot[lastPriority] && (
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[lastPriority]}`} />
                      )}
                      <p className={`text-[14px] truncate ${unread ? "text-white/90 font-medium" : "text-muted-foreground"}`}>
                        {displayMessage || "Start a conversation"}
                      </p>
                    </div>
                  </div>

                  {unread > 0 && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-white shadow-[0_0_10px_rgba(124,77,255,0.4)] flex-shrink-0">
                      {unread}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
