import { Siren, Clock, MapPin } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { motion } from "framer-motion";

const mockAlerts = [
  { 
    id: 1, 
    user: "Alex M.", 
    relation: "Son", 
    message: "Dorm fire alarm went off, evacuated safely. Waiting outside.", 
    time: "10 mins ago",
    location: "North Hall",
    active: true
  },
  { 
    id: 2, 
    user: "Sam K.", 
    relation: "Brother", 
    message: "Lost my wallet and ID, need help cancelling cards.", 
    time: "2 hours ago",
    location: "Campus Library",
    active: false
  }
];

export default function AlertPage() {
  return (
    <AppLayout showBottomNav={true}>
      <header className="pt-12 pb-4 px-6 sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <h1 className="text-2xl font-bold text-destructive flex items-center gap-2">
          <Siren className="w-6 h-6 animate-pulse" />
          Emergency Alerts
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Critical notifications from your family</p>
      </header>

      <div className="p-4 pb-20 space-y-4">
        {mockAlerts.map((alert, i) => (
          <motion.div 
            key={alert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-5 rounded-3xl border-2 ${alert.active ? 'bg-destructive/10 border-destructive shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'glass-card border-white/5'}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alert.active ? 'bg-destructive text-white glowing-danger animate-pulse' : 'bg-white/10 text-muted-foreground'}`}>
                  <Siren className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold ${alert.active ? 'text-white' : 'text-white/80'}`}>{alert.user}</h3>
                  <p className="text-xs text-muted-foreground">{alert.relation}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <Clock className="w-3 h-3" />
                {alert.time}
              </div>
            </div>
            
            <p className={`text-[15px] leading-relaxed mb-4 ${alert.active ? 'text-white font-medium' : 'text-muted-foreground'}`}>
              "{alert.message}"
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-black/20 px-2 py-1 rounded-md">
                <MapPin className="w-3 h-3" />
                {alert.location}
              </div>
              
              {alert.active && (
                <button className="text-xs font-bold text-white bg-destructive hover:bg-destructive/90 px-4 py-2 rounded-full transition-colors">
                  Resolve Alert
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {mockAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4 text-success">
              <Siren className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg">All Clear</h3>
            <p className="text-sm">No emergency alerts right now.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
