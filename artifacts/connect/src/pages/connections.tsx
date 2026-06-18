import { useState } from "react";
import { Link } from "wouter";
import { Search, UserPlus, ScanLine, Link as LinkIcon, Check, X } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Input } from "@/components/ui/input";

const mockRequests = [
  { id: 1, name: "Sarah Connor", username: "@sarahc", avatar: "https://i.pravatar.cc/150?u=sarah" },
  { id: 2, name: "Uncle John", username: "@johnx", avatar: "https://i.pravatar.cc/150?u=john" }
];

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState("add");

  return (
    <AppLayout showBottomNav={true}>
      <header className="pt-12 pb-4 px-6 sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <h1 className="text-2xl font-bold mb-6">Connections</h1>
        
        <div className="flex p-1 bg-surface rounded-full mb-2">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${activeTab === 'add' ? 'bg-white/10 text-white shadow-sm' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('add')}
          >
            Add New
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all relative ${activeTab === 'requests' ? 'bg-white/10 text-white shadow-sm' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests
            <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-primary" />
          </button>
        </div>
      </header>

      <div className="p-4 pb-20">
        {activeTab === 'add' && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search by username (@handle)" 
                className="w-full h-14 rounded-2xl bg-surface/50 border-white/10 pl-12 pr-4 text-base focus-visible:ring-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <ScanLine className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm">Scan QR Code</span>
              </button>
              
              <button className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-colors">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                  <LinkIcon className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm">Share Invite Link</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground px-2 uppercase tracking-wider">Pending Invitations</h2>
            
            {mockRequests.map(req => (
              <div key={req.id} className="glass-card p-4 rounded-3xl flex items-center gap-3">
                <img src={req.avatar} alt={req.name} className="w-12 h-12 rounded-full border border-white/10" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">{req.name}</h3>
                  <p className="text-xs text-muted-foreground">{req.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white glowing-primary transition-transform active:scale-95">
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
