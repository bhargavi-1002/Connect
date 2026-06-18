import { Link } from "wouter";
import { ArrowLeft, User, Shield, Bell, Palette, Smartphone, Clock, LogOut } from "lucide-react";
import { AppLayout } from "@/components/app-layout";

export default function SettingsPage() {
  const sections = [
    {
      title: "Account",
      items: [
        { icon: User, title: "Profile Info", desc: "Name, avatar, bio", path: "/profile" },
        { icon: Shield, title: "Privacy & Security", desc: "Password, visibility", path: "#" }
      ]
    },
    {
      title: "Preferences",
      items: [
        { icon: Palette, title: "Themes & Wallpapers", desc: "Colors, chat backgrounds", path: "/themes" },
        { icon: Bell, title: "Notifications", desc: "Sounds, priority alerts", path: "#" }
      ]
    },
    {
      title: "Devices & Security",
      items: [
        { icon: Smartphone, title: "Connected Devices", desc: "Manage active sessions", path: "/settings/devices" },
        { icon: Clock, title: "Auto Logout", desc: "15 minutes", path: "/settings/auto-logout", value: "15m" }
      ]
    }
  ];

  return (
    <AppLayout showBottomNav={false}>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <Link href="/profile" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <h1 className="text-xl font-bold">Settings</h1>
      </header>

      <div className="p-4 pb-10 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-sm font-semibold text-primary mb-3 pl-4 uppercase tracking-wider">{section.title}</h2>
            <div className="glass-card rounded-3xl overflow-hidden flex flex-col">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <Link key={itemIdx} href={item.path} className={`flex items-center p-4 hover:bg-white/5 transition-colors ${itemIdx !== section.items.length - 1 ? 'border-b border-white/5' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mr-4 text-white">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.value && <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">{item.value}</span>}
                      <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-8">
          <Link href="/login" className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl text-destructive hover:bg-destructive/10 transition-colors font-medium">
            <LogOut className="w-5 h-5" />
            Sign Out
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
