import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, Plus, UserPlus, ScanLine, Link as LinkIcon, Users, Pin, Archive, ArchiveRestore, ChevronDown, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { listenToChats, markChatRead, generateInviteLink, archiveChat, unarchiveChat, type Chat } from "@/lib/firestore";
import { Mascot } from "@/components/mascot";
import { formatDistanceToNow } from "date-fns";

const priorityDot: Record<string, string> = {
  important: "bg-warning",
  urgent: "bg-orange-500",
  emergency: "bg-destructive",
  good_news: "bg-info",
  normal: "",
};

const categoryDot: Record<string, string> = {
  important: "bg-warning",
  groups: "bg-info",
  emergency: "bg-destructive",
  normal: "",
};

function formatTime(ts: { toDate?: () => Date } | null | undefined) {
  if (!ts) return "";
  try {
    const date = ts.toDate ? ts.toDate() : new Date(ts as unknown as string);
    return formatDistanceToNow(date, { addSuffix: false });
  } catch { return ""; }
}

export default function ChatsPage() {
  const { user, profile } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const tabs = ["All", "Important", "Groups", "Emergency"];

  useEffect(() => {
    if (!user) return;
    const unsub = listenToChats(user.uid, (data) => {
      setChats(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const filterChat = (chat: Chat) => {
    const otherUid = chat.participants.find(uid => uid !== user?.uid) || "";
    const name = chat.isGroup
      ? (chat.groupName || "Group")
      : (chat.participantNames[otherUid] || "Unknown");
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "important")
      return matchesSearch && (
        chat.category === "important" ||
        chat.lastMessage.includes("[important]") ||
        chat.lastMessage.includes("[urgent]")
      );
    if (activeTab === "groups")
      return matchesSearch && (
        chat.category === "groups" ||
        chat.isGroup
      );
    if (activeTab === "emergency")
      return matchesSearch && (
        chat.category === "emergency" ||
        chat.lastMessage.includes("[emergency]")
      );
    return matchesSearch;
  };

  const pinned = chats.filter(c => c.pinnedBy?.[user?.uid || ""] && !c.archivedBy?.[user?.uid || ""] && filterChat(c));
  const archived = chats.filter(c => c.archivedBy?.[user?.uid || ""] && filterChat(c));
  const normal = chats.filter(c => !c.pinnedBy?.[user?.uid || ""] && !c.archivedBy?.[user?.uid || ""] && filterChat(c));

  const handleChatClick = async (chat: Chat) => {
    if (user && (chat.unreadCount[user.uid] || 0) > 0) await markChatRead(chat.id, user.uid);
    setLocation(`/chats/${chat.id}`);
  };

  const copyInviteLink = () => {
    if (profile) navigator.clipboard.writeText(generateInviteLink(profile.username));
  };

  const renderChat = (chat: Chat, i: number) => {
    const otherUid = chat.participants.find(uid => uid !== user?.uid) || "";
    const name = chat.isGroup ? (chat.groupName || "Group") : (chat.participantNames[otherUid] || "Unknown");
    const photo = chat.isGroup ? chat.groupPhoto : chat.participantPhotos[otherUid];
    const unread = user ? (chat.unreadCount[user.uid] || 0) : 0;
    const lastPriority = chat.lastMessage.match(/^\[(\w+)\]/)?.[1] || "normal";
    const displayMessage = chat.lastMessage.replace(/^\[\w+\]\s*/, "") || "Start a conversation";
    const isPinned = chat.pinnedBy?.[user?.uid || ""];

    return (
      <motion.div
        key={chat.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.04 }}
        onClick={() => handleChatClick(chat)}
        className="p-4 rounded-3xl glass-card flex items-center gap-4 hover:bg-white/[0.08] active:scale-[0.98] transition-all cursor-pointer"
      >
        <div className="relative flex-shrink-0">
          {photo ? (
            <img src={photo} alt={name} className="w-14 h-14 rounded-full object-cover border border-white/10" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl border border-white/10">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-background" />
          )}
          {isPinned && (
            <span className="absolute -top-1 -left-1">
              <Pin className="w-3.5 h-3.5 text-primary" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              {chat.category && chat.category !== "normal" && (
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${categoryDot[chat.category] || ""}`} title={chat.category} />
              )}
              <h3 className="font-semibold text-[17px] truncate">{name}</h3>
            </div>
            <span className={`text-xs whitespace-nowrap ml-2 ${unread ? "text-primary font-medium" : "text-muted-foreground"}`}>
              {formatTime(chat.lastMessageAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {priorityDot[lastPriority] && (
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[lastPriority]}`} />
            )}
            <p className={`text-[14px] truncate ${unread ? "text-white/90 font-medium" : "text-muted-foreground"}`}>
              {displayMessage}
            </p>
          </div>
        </div>

        {unread > 0 && (
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-white shadow-[0_0_10px_var(--glow-primary,rgba(124,77,255,0.4))] flex-shrink-0">
            {unread}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <AppLayout showBottomNav={true}>
      <header className="pt-12 pb-4 px-5 sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-primary/30 blur-[10px] rounded-full" />
              <img
                src="/signup-wave.png"
                alt=""
                className="relative z-10 w-full h-full object-contain drop-shadow-lg"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">Connect</span>
              {profile && <p className="text-xs text-muted-foreground">@{profile.username}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/create-group">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-surface/50 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
              >
                <Users className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/connections">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_14px_var(--glow-primary,rgba(124,77,255,0.4))]"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search connections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 rounded-2xl bg-surface/50 border-white/10 pl-12 pr-4 text-[15px] focus-visible:ring-primary/50"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.toLowerCase()
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : pinned.length === 0 && normal.length === 0 && archived.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-10 text-center px-6"
          >
            <Mascot
              src="/onboarding-cloud.png"
              size="w-48"
              glowColor="bg-primary/25"
              floatDuration={5}
              className="mb-2"
            />
            <h3 className="text-xl font-bold mb-2">No chats yet</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              {search
                ? `No conversations matching "${search}"`
                : "Search by username, scan a QR, or share your invite link to connect with your family."}
            </p>
            {!search && (
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <Link href="/connections">
                  <Button className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-[0_0_16px_var(--glow-primary,rgba(124,77,255,0.4))] border-none">
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
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {/* Pinned Chats */}
            {pinned.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-1 mb-2">
                  <Pin className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pinned</span>
                </div>
                {pinned.map((chat, i) => renderChat(chat, i))}
                <div className="h-4" />
              </div>
            )}

            {/* Normal Chats */}
            {normal.map((chat, i) => renderChat(chat, i))}

            {/* Archived Chats */}
            {archived.length > 0 && (
              <div>
                <button
                  onClick={() => setShowArchived(v => !v)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-3xl glass-card hover:bg-white/[0.08] transition-all"
                >
                  <Archive className="w-5 h-5 text-muted-foreground" />
                  <span className="flex-1 text-left font-medium text-sm">Archived</span>
                  <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">{archived.length}</span>
                  {showArchived ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {showArchived && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-2 pt-2"
                    >
                      {archived.map((chat, i) => renderChat(chat, i))}
                      <button
                        onClick={() => archived.forEach(c => unarchiveChat(c.id, user!.uid))}
                        className="w-full py-2 text-xs text-center text-muted-foreground hover:text-white transition-colors"
                      >
                        <ArchiveRestore className="w-3.5 h-3.5 inline mr-1" />
                        Unarchive all
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}