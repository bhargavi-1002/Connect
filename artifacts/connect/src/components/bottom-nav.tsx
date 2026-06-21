import { Link, useLocation } from "wouter";
import { MessageSquare, Users, AlertTriangle, User } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { name: "Chats", path: "/chats", icon: MessageSquare },
    { name: "Requests", path: "/connections", icon: Users },
    { name: "Alerts", path: "/alerts", icon: AlertTriangle },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe">
      <div className="w-full max-w-[430px] lg:max-w-[800px] glass-card rounded-t-3xl border-b-0 px-6 py-4 flex justify-between items-center bg-surface/80 backdrop-blur-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path || location.startsWith(item.path + "/");
          
          return (
            <Link key={item.path} href={item.path} className="flex flex-col items-center gap-1 group">
              <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-primary/20 text-primary' : 'text-muted-foreground group-hover:text-foreground group-hover:bg-white/5'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
