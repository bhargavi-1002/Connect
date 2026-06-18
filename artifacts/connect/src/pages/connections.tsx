import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Search, ScanLine, Link as LinkIcon, Check, X, UserPlus, Loader2, Copy } from "lucide-react";
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
import QRScanner from "@/components/qr-scanner";

export default function ConnectionsPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("add");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (!user) return;
    const unsub = listenToIncomingRequests(user.uid, setRequests);
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setResults([]);
      return;
    }
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
      toast({ title: "Request sent!", description: `Request sent to @${target.username}` });
    } catch (err: unknown) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again.", variant: "destructive" });
    } finally {
      setSending(null);
    }
  };

  const handleRespond = async (req: ContactRequest, accept: boolean) => {
    try {
      await respondToRequest(req.id, req.fromUid, user!.uid, accept);
      toast({ title: accept ? "Connection accepted!" : "Request declined" });
    } catch (err: unknown) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again.", variant: "destructive" });
    }
  };

  const copyInviteLink = () => {
    if (profile) {
      navigator.clipboard.writeText(generateInviteLink(profile.username));
      toast({ title: "Link copied!", description: "Share it with your family." });
    }
  };

  return (
    <AppLayout showBottomNav={true}>
      <header className="pt-12 pb-4 px-6 sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <h1 className="text-2xl font-bold mb-6">Connections</h1>

        <div className="flex p-1 bg-surface rounded-full mb-2">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${activeTab === "add" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground"}`}
            onClick={() => setActiveTab("add")}
          >
            Add New
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all relative ${activeTab === "requests" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground"}`}
            onClick={() => setActiveTab("requests")}
          >
            Requests
            {requests.length > 0 && (
              <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </header>

      <div className="p-4 pb-20">
        {activeTab === "add" && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by @username"
                value={search}
                onChange={(e) => setSearch(e.target.value.replace(/^@/, ""))}
                className="w-full h-14 rounded-2xl bg-surface/50 border-white/10 pl-12 pr-4 text-base focus-visible:ring-primary/50"
              />
              {searching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>

            <AnimatePresence>
              {results.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {results.map(u => (
                    <div key={u.uid} className="glass-card p-4 rounded-3xl flex items-center gap-3">
                      {u.photoURL ? (
                        <img src={u.photoURL} alt={u.displayName} className="w-12 h-12 rounded-full border border-white/10" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                          {u.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate">{u.displayName}</h3>
                        <p className="text-xs text-muted-foreground">@{u.username}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSendRequest(u)}
                        disabled={sending === u.uid}
                        className="rounded-full bg-primary text-white hover:opacity-90 h-9 px-4 glowing-primary"
                      >
                        {sending === u.uid ? <Loader2 className="w-3 h-3 animate-spin" /> : <><UserPlus className="w-3 h-3 mr-1" /> Add</>}
                      </Button>
                    </div>
                  ))}
                </motion.div>
              )}
              {search.length >= 2 && !searching && results.length === 0 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground text-sm py-4">
                  No users found for "@{search}"
                </motion.p>
              )}
            </AnimatePresence>

            {!search && (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowQR(true)} className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <ScanLine className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-sm">Scan QR Code</span>
                </button>
                <button onClick={copyInviteLink} className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                    <Copy className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-sm">Copy Invite Link</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <UserPlus className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg">No Requests</h3>
                <p className="text-sm text-muted-foreground">No pending connection requests.</p>
              </div>
            ) : (
              <>
                <h2 className="text-sm font-semibold text-muted-foreground px-2 uppercase tracking-wider">
                  Pending ({requests.length})
                </h2>
                {requests.map(req => (
                  <div key={req.id} className="glass-card p-4 rounded-3xl flex items-center gap-3">
                    {req.fromPhotoURL ? (
                      <img src={req.fromPhotoURL} alt={req.fromDisplayName} className="w-12 h-12 rounded-full border border-white/10" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                        {req.fromDisplayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{req.fromDisplayName}</h3>
                      <p className="text-xs text-muted-foreground">@{req.fromUsername}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRespond(req, false)}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRespond(req, true)}
                        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white glowing-primary transition-transform active:scale-95"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {showQR && <QRScanner onClose={() => setShowQR(false)} />}
    </AppLayout>
  );
}
