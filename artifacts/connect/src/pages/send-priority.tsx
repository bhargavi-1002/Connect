import { Link, useLocation } from "wouter";
import { X, MessageCircle, Heart, AlertCircle, Clock, Siren } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { motion } from "framer-motion";

const priorityOptions = [
  {
    id: "normal",
    title: "Normal",
    desc: "Regular everyday message",
    icon: MessageCircle,
    color: "from-success/80 to-success",
    bg: "bg-success/20",
    glow: "shadow-[0_0_15px_rgba(34,197,94,0.3)]",
    border: "border-success/30"
  },
  {
    id: "good_news",
    title: "Good News",
    desc: "Share your happy moments",
    icon: Heart,
    color: "from-info/80 to-info",
    bg: "bg-info/20",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]",
    border: "border-info/30"
  },
  {
    id: "important",
    title: "Important",
    desc: "Important but not urgent",
    icon: Clock,
    color: "from-warning/80 to-warning",
    bg: "bg-warning/20",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    border: "border-warning/30"
  },
  {
    id: "urgent",
    title: "Urgent",
    desc: "Needs immediate attention",
    icon: AlertCircle,
    color: "from-orange-500/80 to-orange-500",
    bg: "bg-orange-500/20",
    glow: "shadow-[0_0_15px_rgba(249,115,22,0.3)]",
    border: "border-orange-500/30"
  },
  {
    id: "emergency",
    title: "Emergency",
    desc: "Critical! Need immediate help",
    icon: Siren,
    color: "from-destructive/80 to-destructive",
    bg: "bg-destructive/20",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.6)]",
    border: "border-destructive border-2 animate-pulse",
    isEmergency: true
  }
];

export default function SendPriorityPage() {
  const [, setLocation] = useLocation();

  const handleSelect = (id: string) => {
    // In a real app, this would set context/state and go back
    window.history.back();
  };

  return (
    <AppLayout showBottomNav={false} className="bg-background">
      <div className="flex-1 flex flex-col p-6">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Message Type</h1>
            <p className="text-muted-foreground text-sm mt-1">Select priority for your message</p>
          </div>
          <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10">
            <X className="w-5 h-5 text-white" />
          </button>
        </header>

        <div className="space-y-4">
          {priorityOptions.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleSelect(opt.id)}
                className={`w-full text-left p-4 rounded-3xl glass-card flex items-center gap-4 group transition-all duration-300 hover:scale-[1.02] ${opt.border}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${opt.color} ${opt.glow}`}>
                  <Icon className={`w-6 h-6 ${opt.isEmergency ? 'animate-bounce' : ''}`} />
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg ${opt.isEmergency ? 'text-destructive' : 'text-white'}`}>
                    {opt.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{opt.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
