import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Phone, Video, Paperclip, Send, MoreVertical, Mic } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  getChat, listenToMessages, sendMessage, markChatRead,
  setTyping, listenToTyping, markMessageRead,
  type Chat, type Message,
} from "@/lib/firestore";
import { getWallpaperStyle } from "@/lib/themes";
import { formatDistanceToNow } from "date-fns";

const priorityConfig: Record<string, { label: string; gradient: string; badge: string }> = {
  normal:    { label: "",           gradient: "from-primary to-secondary",         badge: "" },
  good_news: { label: "Good News",  gradient: "from-emerald-500 to-teal-500",      badge: "bg-emerald-500/20 text-emerald-400" },
  important: { label: "Important",  gradient: "from-amber-500 to-orange-500",      badge: "bg-warning/20 text-warning" },
  urgent:    { label: "Urgent",     gradient: "from-orange-600 to-red-500",         badge: "bg-orange-500/20 text-orange-400" },
  emergency: { label: "Emergency",  gradient: "from-destructive to-rose-700",      badge: "bg-destructive/20 text-destructive" },
};

export default function ChatDetailPage() {
  const [, params] = useRoute("/chats/:id");
  const chatId = params?.id || "";
  const { user, profile } = useAuth();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<Message["priority"]>("normal");
  const [showPriority, setShowPriority] = useState(false);
  const [typingUids, setTypingUids] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!chatId) return;
    getChat(chatId).then(c => { setChat(c); setLoading(false); });
  }, [chatId]);

  useEffect(() => {
    if (!chatId || !user) return;
    const unsub = listenToMessages(chatId, (msgs) => {
      setMessages(msgs);
      markChatRead(chatId, user.uid);
      msgs.forEach(msg => {
        if (!msg.readBy.includes(user.uid)) markMessageRead(chatId, msg.id, user.uid);
      });
    });
    return () => unsub();
  }, [chatId, user]);

  useEffect(() => {
    if (!chatId || !user) return;
    const unsub = listenToTyping(chatId, user.uid, setTypingUids);
    return () => unsub();
  }, [chatId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = useCallback((text: string) => {
    setInputText(text);
    if (!user || !chatId) return;
    setTyping(chatId, user.uid, true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(chatId, user.uid, false), 2000);
  }, [chatId, user]);

  const handleSend = async () => {
    if (!inputText.trim() || !profile || !chat) return;
    const text = inputText.trim();
    setInputText("");
    if (typingTimer.current) clearTimeout(typingTimer.current);
    if (user) setTyping(chatId, user.uid, false);
    await sendMessage(chatId, profile, text, selectedPriority, chat.participants);
    setSelectedPriority("normal");
  };

  const otherUid = chat?.participants.find(uid => uid !== user?.uid) || "";
  const otherName = chat?.isGroup ? (chat.groupName || "Group") : (chat?.participantNames[otherUid] || "Unknown");
  const otherPhoto = chat?.isGroup ? chat.groupPhoto : chat?.participantPhotos[otherUid];
  const otherTyping = typingUids.length > 0;

  // Apply selected wallpaper to the messages area
  const wallpaperStyle = getWallpaperStyle(profile?.chatWallpaper || "none");

  if (loading) {
    return (
      <AppLayout showBottomNav={false}>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showBottomNav={false}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/chats" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex items-center gap-3">
            {otherPhoto ? (
              <img src={otherPhoto} alt={otherName} className="w-10 h-10 rounded-full object-cover border border-white/10" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                {otherName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="font-semibold text-[16px] leading-tight text-white">{otherName}</h2>
              {otherTyping ? (
                <span className="text-xs text-primary font-medium">typing…</span>
              ) : (
                <span className="text-xs text-muted-foreground">connected</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors text-muted-foreground">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages — wallpaper applied here */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
        style={wallpaperStyle}
      >
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="relative w-32 h-32 mb-4">
              <div className="absolute inset-0 bg-primary/20 blur-[30px] rounded-full" />
              <img
                src="/signup-wave.png"
                alt="Say hello"
                className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <p className="text-muted-foreground text-sm">You're connected! 🎉</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Say hello to start your conversation</p>
          </motion.div>
        )}

        {messages.map((msg, index) => {
          const isMine = msg.senderId === user?.uid;
          const showAvatar = !isMine && (index === 0 || messages[index - 1].senderId !== msg.senderId);
          const pConfig = priorityConfig[msg.priority] || priorityConfig.normal;
          const isRead = chat?.participants.every(uid => msg.readBy.includes(uid));

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${isMine ? "justify-end" : "justify-start"}`}
            >
              {!isMine && (
                <div className="w-8 flex-shrink-0 flex items-end">
                  {showAvatar && (otherPhoto ? (
                    <img src={otherPhoto} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                      {otherName.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
              )}

              <div className={`max-w-[75%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                {msg.priority !== "normal" && (
                  <div className={`flex items-center gap-1 mb-1 text-xs font-medium px-2 py-0.5 rounded-md ${pConfig.badge}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {pConfig.label}
                  </div>
                )}
                <div className={`px-4 py-3 text-[15px] leading-relaxed ${
                  isMine
                    ? `bg-gradient-to-br ${pConfig.gradient} text-white rounded-2xl rounded-br-sm shadow-lg`
                    : "bg-card/80 backdrop-blur-sm text-white rounded-2xl rounded-bl-sm border border-white/5"
                }`}>
                  {msg.text}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[11px] text-muted-foreground">
                    {msg.sentAt?.toDate ? formatDistanceToNow(msg.sentAt.toDate(), { addSuffix: true }) : ""}
                  </span>
                  {isMine && (
                    <span className={`text-[10px] ${isRead ? "text-primary" : "text-muted-foreground"}`}>
                      {isRead ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        <AnimatePresence>
          {otherTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4"
            >
              <div className="bg-card/80 backdrop-blur-sm border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-surface/95 backdrop-blur-xl border-t border-white/5 p-4 flex flex-col gap-2">
        <AnimatePresence>
          {showPriority && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex gap-2 overflow-x-auto pb-1"
            >
              {(Object.entries(priorityConfig) as [Message["priority"], typeof priorityConfig[string]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => { setSelectedPriority(key); setShowPriority(false); }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedPriority === key
                      ? `bg-gradient-to-r ${cfg.gradient} text-white border-transparent`
                      : "border-white/10 text-muted-foreground hover:text-white"
                  }`}
                >
                  {key === "normal" ? "Normal" : cfg.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowPriority(v => !v)}
            className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-colors ${
              selectedPriority !== "normal"
                ? `bg-gradient-to-br ${priorityConfig[selectedPriority]?.gradient} text-white`
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl flex items-center px-2 py-1 min-h-[44px]">
            {selectedPriority !== "normal" && (
              <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityConfig[selectedPriority]?.badge}`}>
                {priorityConfig[selectedPriority]?.label}
              </span>
            )}
            <textarea
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Message..."
              className="flex-1 bg-transparent border-none text-[15px] text-white focus:outline-none resize-none px-3 py-2 max-h-[100px] scrollbar-none placeholder:text-muted-foreground/60"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
            />
          </div>

          {inputText.trim() ? (
            <motion.button
              onClick={handleSend}
              whileTap={{ scale: 0.9 }}
              className="w-11 h-11 flex-shrink-0 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_16px_var(--glow-primary,rgba(124,77,255,0.4))]"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </motion.button>
          ) : (
            <button className="w-11 h-11 flex-shrink-0 rounded-full bg-white/10 flex items-center justify-center text-white transition-all">
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
