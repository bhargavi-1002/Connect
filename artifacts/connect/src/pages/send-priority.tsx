import { useLocation } from "wouter";
import { X } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { motion } from "framer-motion";

const priorityOptions = [
  {
    id: "normal",
    title: "Normal",
    desc: "Regular everyday message",
    gradient: "from-slate-700 to-slate-600",
    emoji: "💬",
  },
  {
    id: "good_news",
    title: "Good News",
    desc: "Share exciting updates",
    gradient: "from-emerald-600 to-teal-500",
    emoji: "🎉",
  },
  {
    id: "important",
    title: "Important",
    desc: "Needs attention soon",
    gradient: "from-amber-600 to-orange-500",
    emoji: "⚠️",
  },
  {
    id: "urgent",
    title: "Urgent",
    desc: "Please respond quickly",
    gradient: "from-orange-600 to-red-500",
    emoji: "🚨",
  },
  {
    id: "emergency",
    title: "Emergency",
    desc: "Immediate help needed",
    gradient: "from-destructive to-rose-700",
    emoji: "🆘",
  },
];

export default function SendPriorityPage() {
  const [, setLocation] = useLocation();

  const handleSelect = (priorityId: string) => {
    setLocation(`/chats?priority=${priorityId}`);
  };

  return (
    <AppLayout showBottomNav={false}>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Priority Level</h1>
        <button
          onClick={() => setLocation(-1 as unknown as string)}
          className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="p-4 pb-10 space-y-4">
        <p className="text-sm text-muted-foreground px-1 mb-2">
          Select how important your message is. This affects notification intensity.
        </p>
        {priorityOptions.map((opt, i) => (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => handleSelect(opt.id)}
            className={`w-full p-5 rounded-3xl bg-gradient-to-r ${opt.gradient} flex items-center gap-4 hover:opacity-90 transition-all active:scale-[0.98] shadow-lg text-left`}
          >
            <span className="text-3xl">{opt.emoji}</span>
            <div>
              <h3 className="font-bold text-white text-lg">{opt.title}</h3>
              <p className="text-white/70 text-sm">{opt.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </AppLayout>
  );
}
