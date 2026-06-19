import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Search, Link as LinkIcon, Check, X, UserPlus, Loader2, Copy, ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  searchUsersByUsername, sendContactRequest, listenToIncomingRequests,
  respondToRequest, generateInviteLink, type ContactRequest, type UserProfile,
} from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { Mascot } from "@/components/mascot";

export default function ConnectionsPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("add");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [responding, setResponding] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (!user) return;
    const unsub = listenToIncomingRequests(user.uid, setRequests);
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) { setResults([]); return; }
    setSearching(true);
    searchUsersByUsername(debouncedSearch)
      .then(res => setResults(res.filter(u => u.uid !== user?.uid)))
      .finally(() => setSearching(false));
  }, [debouncedSearch, user]);

  const handleSendRequest = async (target: UserProfile) => {
    if (!profile) return;
    setSending(target.uid);
    try {
      await sendContactRequest(profile, target.uid);
      toast({ title: `Request sent to @${target.username}!` });
    } catch (err: unknown) {
      toast({ title: "Failed to send request", description: err instanceof Error ? err.message : "Try again.", variant: "destructive" });
    } finally {
      setSending(null);
    }
  };

  const handleRespond = async (req: ContactRequest, accept: boolean) => {
    setResponding(req.id);
    try {
      await respondToRequest(req.id, req.fromUid, user!.uid, accept);
      toast({ title: accept ? `Connected with @${req.fromUsername}!` : "Request declined" });
    } catch (err: unknown) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again.", variant: "destructive" });
    } finally {
      setResponding(null);
    }
  };

  const copyInviteLink = () => {
    if (!profile) return;
    navigator.clipboard.writeText(generateInviteLink(profile.username));
    toast({ title: "Invite link copied!" });
  };

  return (
    <AppLayout showBottomNav={false}>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <Link href="/chats" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold leading-none">Connections</h1>
          <p className="text-xs text-muted-foreground">Find and add family members</p>
        </div>
        {requests.length > 0 && (
          <button
            onClick={() => setActiveTab("requests")}
            className="relative w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
          >
            <UserPlus className="w-5 h-5 text-primary" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {requests.length}
            </span>
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex border-b border-white/5 px-4">
        {["add", "requests"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative flex-1 py-3.5 text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? "text-white" : "text-muted-foreground"
            }`}
          >
            {tab === "requests" ? `Requests${requests.length > 0 ? ` (${requests.length})` : ""}` : "Add People"}
            {activeTab === tab && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-10">
        {activeTab === "add" && (
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
              <Input
                placeholder="Search by @username..."
                value={search}
                onChange={(e) => setSearch(e.target.value.toLowerCase().replace(/\s/g, ""))}
                className="h-12 rounded-2xl bg-surface/50 border-white/10 pl-12 pr-12 text-[15px] focus-visible:ring-primary/50"
              />
            </div>

            {/* Invite link */}
            <button
              onClick={copyInviteLink}
              className="w-full p-4 rounded-3xl glass-card flex items-center gap-3 hover:bg-white/5 active:scale-[0.98] transition-all"
            >
              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="font-medium text-sm">Share Invite Link</p>
                <p className="text-xs text-muted-foreground">Copy your personal link</p>
              </div>
              <Copy className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Search results */}
            <AnimatePresence>
              {results.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                  <p className="text-xs text-muted-foreground px-1">Search results</p>
                  {results.map(u => (
                    <motion.div
                      key={u.uid}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-3xl glass-card flex items-center gap-3"
                    >
                      {u.photoURL ? (
                        <img src={u.photoURL} alt={u.displayName} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                          {u.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[15px] truncate">{u.displayName}</p>
                        <p className="text-xs text-muted-foreground">@{u.username}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSendRequest(u)}
                        disabled={sending === u.uid}
                        className="rounded-2xl bg-primary text-white border-none shadow-[0_0_10px_var(--glow-primary,rgba(124,77,255,0.3))] h-9 px-4 text-xs"
                      >
                        {sending === u.uid ? <Loader2 className="w-3 h-3 animate-spin" /> : <><UserPlus className="w-3 h-3 mr-1" />Connect</>}
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state when no search */}
            {!search && results.length === 0 && (
              <div className="flex flex-col items-center pt-4 text-center">
                <Mascot
                  src="/signup-wave.png"
                  size="w-40"
                  glowColor="bg-secondary/25"
                  floatDuration={4.5}
                  delay={0.5}
                  className="mb-2"
                />
                <p className="text-sm text-muted-foreground">Type a @username to find someone</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Family members can also scan your QR code</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="p-4 space-y-3">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <Mascot
                  src="/onboarding-cloud.png"
                  size="w-44"
                  glowColor="bg-primary/20"
                  floatDuration={5}
                  className="mb-2"
                />
                <p className="text-muted-foreground text-sm">No pending requests</p>
                <p className="text-xs text-muted-foreground/60 mt-1">When someone sends you a request, it appears here</p>
              </div>
            ) : (
              requests.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="p-4 rounded-3xl glass-card flex items-center gap-3"
                >
                  {req.fromPhotoURL ? (
                    <img src={req.fromPhotoURL} alt={req.fromDisplayName} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                      {req.fromDisplayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px] truncate">{req.fromDisplayName}</p>
                    <p className="text-xs text-muted-foreground">@{req.fromUsername} wants to connect</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(req, true)}
                      disabled={responding === req.id}
                      className="w-9 h-9 rounded-full bg-success/20 flex items-center justify-center hover:bg-success/30 transition-colors"
                    >
                      {responding === req.id ? <Loader2 className="w-4 h-4 animate-spin text-success" /> : <Check className="w-4 h-4 text-success" />}
                    </button>
                    <button
                      onClick={() => handleRespond(req, false)}
                      disabled={responding === req.id}
                      className="w-9 h-9 rounded-full bg-destructive/20 flex items-center justify-center hover:bg-destructive/30 transition-colors"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
