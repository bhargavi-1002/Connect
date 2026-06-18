import { useState, useRef, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Phone, Video, Paperclip, Send, MoreVertical, Camera, Mic } from "lucide-react";
import { AppLayout } from "@/components/app-layout";

// Mock data since backend isn't seeded
const mockMessages = [
  { id: 1, text: "Hey! How's your day going?", senderId: 2, sentAt: "10:30 AM", priority: "normal" },
  { id: 2, text: "Going well! Just finished my class.", senderId: 1, sentAt: "10:35 AM", priority: "normal" },
  { id: 3, text: "That's great. Did you have lunch?", senderId: 2, sentAt: "10:36 AM", priority: "normal" },
  { id: 4, text: "Not yet, heading to the dining hall now.", senderId: 1, sentAt: "10:40 AM", priority: "normal" },
  { id: 5, text: "Don't forget to grab something healthy!", senderId: 2, sentAt: "10:42 AM", priority: "important" },
];

export default function ChatDetailPage() {
  const [, params] = useRoute("/chats/:id");
  const [messages, setMessages] = useState(mockMessages);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      setMessages([
        ...messages,
        {
          id: Date.now(),
          text: inputText,
          senderId: 1, // current user
          sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          priority: "normal"
        }
      ]);
      setInputText("");
    }
  };

  const currentUserId = 1;

  return (
    <AppLayout showBottomNav={false}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/chats" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="https://i.pravatar.cc/150?u=mom" alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-white/10" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-surface" />
            </div>
            <div>
              <h2 className="font-semibold text-[16px] leading-tight text-white">Alex M.</h2>
              <span className="text-xs text-success font-medium">Online</span>
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, index) => {
          const isMine = msg.senderId === currentUserId;
          const showAvatar = !isMine && (index === 0 || messages[index - 1].senderId === currentUserId);
          
          return (
            <div key={msg.id} className={`flex gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
              {!isMine && (
                <div className="w-8 flex-shrink-0 flex items-end">
                  {showAvatar && (
                    <img src="https://i.pravatar.cc/150?u=mom" alt="Avatar" className="w-8 h-8 rounded-full" />
                  )}
                </div>
              )}
              
              <div className={`max-w-[75%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                {msg.priority === 'important' && !isMine && (
                  <div className="flex items-center gap-1 mb-1 text-warning text-xs font-medium bg-warning/10 px-2 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning" /> Important
                  </div>
                )}
                
                <div 
                  className={`px-4 py-3 text-[15px] ${
                    isMine 
                      ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-2xl rounded-br-sm' 
                      : 'bg-card text-white rounded-2xl rounded-bl-sm border border-white/5'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[11px] text-muted-foreground mt-1 px-1">
                  {msg.sentAt}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-surface border-t border-white/5 p-4 pb-safe flex items-end gap-2 relative">
        <Link href="/send-priority" className="absolute -top-12 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-xs font-medium flex items-center gap-2 shadow-lg z-20">
          <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          Send Priority Message
        </Link>
      
        <button className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
          <Paperclip className="w-5 h-5" />
        </button>
        
        <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl flex items-center px-2 py-1 min-h-[44px]">
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Message..."
            className="flex-1 bg-transparent border-none text-[15px] text-white focus:outline-none resize-none px-3 py-2 max-h-[100px] scrollbar-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-white transition-colors shrink-0">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        
        {inputText.trim() ? (
          <button 
            onClick={handleSend}
            className="w-11 h-11 flex-shrink-0 rounded-full bg-primary flex items-center justify-center text-white glowing-primary transition-all"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        ) : (
          <button className="w-11 h-11 flex-shrink-0 rounded-full bg-white/10 flex items-center justify-center text-white transition-all">
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </AppLayout>
  );
}
