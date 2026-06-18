import { useState } from "react";
import { Link } from "wouter";
import { Search, Plus, Sparkles, Bell } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Input } from "@/components/ui/input";

// Mock data since backend isn't seeded
const mockChats = [
  {
    id: 1,
    name: "Mom",
    avatar: "https://i.pravatar.cc/150?u=mom",
    lastMessage: "Don't forget your coat!",
    time: "10:42 AM",
    unread: 2,
    online: true,
    priority: "important",
  },
  {
    id: 2,
    name: "Dad",
    avatar: "https://i.pravatar.cc/150?u=dad",
    lastMessage: "Call me when you're free",
    time: "Yesterday",
    unread: 0,
    online: false,
    priority: "normal",
  },
  {
    id: 3,
    name: "Family Group",
    avatar: "https://i.pravatar.cc/150?u=family",
    lastMessage: "Alex: I got an A on the test! 🎉",
    time: "Tue",
    unread: 5,
    online: true,
    priority: "good_news",
  },
  {
    id: 4,
    name: "Grandma",
    avatar: "https://i.pravatar.cc/150?u=gran",
    lastMessage: "Miss you sweetie",
    time: "Mon",
    unread: 0,
    online: false,
    priority: "normal",
  }
];

export default function ChatsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const tabs = ["All", "Important", "Groups", "Emergency"];

  return (
    <AppLayout showBottomNav={true}>
      {/* Header */}
      <header className="pt-12 pb-4 px-6 sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center glowing-primary">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Connect</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white glowing-primary">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search connections..." 
            className="w-full h-12 rounded-2xl bg-surface/50 border-white/10 pl-12 pr-4 text-[15px] focus-visible:ring-primary/50"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.toLowerCase() 
                  ? 'bg-white/10 text-white' 
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        <div className="space-y-3">
          {mockChats.map(chat => (
            <Link key={chat.id} href={`/chats/${chat.id}`}>
              <div className="p-4 rounded-3xl glass-card flex items-center gap-4 hover:bg-white/[0.08] transition-colors cursor-pointer group">
                <div className="relative">
                  <img src={chat.avatar} alt={chat.name} className="w-14 h-14 rounded-full object-cover border border-white/10" />
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-card" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-[17px] truncate">{chat.name}</h3>
                    <span className={`text-xs ${chat.unread ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {chat.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {chat.priority === 'important' && (
                      <span className="w-2 h-2 rounded-full bg-warning flex-shrink-0" />
                    )}
                    {chat.priority === 'good_news' && (
                      <span className="w-2 h-2 rounded-full bg-info flex-shrink-0" />
                    )}
                    <p className={`text-[14px] truncate ${chat.unread ? 'text-white/90 font-medium' : 'text-muted-foreground'}`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
                
                {chat.unread > 0 && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-white shadow-[0_0_10px_rgba(124,77,255,0.4)]">
                    {chat.unread}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
