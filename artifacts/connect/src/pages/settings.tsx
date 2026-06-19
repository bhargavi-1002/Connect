import { Link, useLocation } from "wouter";
import { User, Shield, Bell, Palette, Smartphone, Clock, LogOut, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { MascotInline } from "@/components/mascot";

export default function SettingsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/onboarding");
    } catch {
      toast({ title: "Sign out failed", variant: "destructive" });
    }
  };

  const sections = [
    {
      title: "Account",
      items: [
        { icon: User,      title: "Profile Info",        desc: profile ? `@${profile.username}` : "Name, avatar, bio",    path: "/profile" },
        { icon: Shield,    title: "Privacy & Security",  desc: "Password, visibility",                                       path: "#" },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: Palette,   title: "Themes & Wallpapers", desc: "Colours, chat backgrounds",                                  path: "/themes" },
        { icon: Bell,      title: "Notifications",       desc: "Sounds, priority alerts",                                    path: "#" },
      ],
    },
    {
      title: "Devices & Security",
      items: [
        { icon: Smartphone, title: "Connected Devices",  desc: "Manage active sessions",                                     path: "/settings/devices" },
        { icon: Clock,      title: "Auto Logout",        desc: "Shared computer protection",  path: "/settings/auto-logout",
          value: profile ? `${profile.autoLogoutMinutes}m` : "15m" },
      ],
    },
  ];

  return (
    <AppLayout showBottomNav={false}>
      {/* Hero header with floating mascot */}
      <div className="relative pt-12 pb-8 px-5 overflow-hidden">
        {/* Background ambient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">Settings</h1>
            {profile && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm leading-none">{profile.displayName}</p>
                  <p className="text-xs text-muted-foreground">@{profile.username}</p>
                </div>
              </div>
            )}
          </div>

          {/* Mascot — panda for settings/security */}
          <MascotInline
            src="/panda-security.png"
            size="w-24"
            glowColor="bg-secondary/20"
            className="-mr-2"
          />
        </div>
      </div>

      <div className="px-4 pb-10 space-y-6">
        {sections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.08 }}
          >
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {section.title}
            </h2>
            <div className="rounded-3xl overflow-hidden glass-card divide-y divide-white/5">
              {section.items.map((item) => (
                item.path === "#" ? (
                  <div
                    key={item.title}
                    className="flex items-center gap-4 px-4 py-4 opacity-50 cursor-not-allowed"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">Soon</span>
                  </div>
                ) : (
                  <Link href={item.path} key={item.title}>
                    <div className="flex items-center gap-4 px-4 py-4 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                      </div>
                      {"value" in item && item.value && (
                        <span className="text-xs text-primary font-medium mr-1">{item.value}</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Link>
                )
              ))}
            </div>
          </motion.div>
        ))}

        {/* Sign out */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handleLogout}
          className="w-full p-4 rounded-3xl glass-card border border-destructive/20 flex items-center gap-4 hover:bg-destructive/10 active:scale-[0.98] transition-all text-left"
        >
          <div className="w-10 h-10 rounded-2xl bg-destructive/15 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-destructive">Sign Out</p>
            <p className="text-xs text-muted-foreground">You can sign back in anytime</p>
          </div>
        </motion.button>
      </div>
    </AppLayout>
  );
}
