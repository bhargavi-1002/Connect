import { Link } from "wouter";
import { Settings, Edit3, QrCode, Share, Shield } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  return (
    <AppLayout showBottomNav={true}>
      <header className="pt-12 pb-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Link href="/settings" className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors">
          <Settings className="w-5 h-5 text-white" />
        </Link>
      </header>

      <div className="p-6 pb-20">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4 group">
            <div className="w-28 h-28 rounded-full border-4 border-surface overflow-hidden shadow-xl shadow-primary/20">
              <img src="https://i.pravatar.cc/150?u=user" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white border-2 border-surface shadow-md">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          
          <h2 className="text-2xl font-bold">Alex Magic</h2>
          <p className="text-primary font-medium">@alexm</p>
          
          <div className="mt-4 inline-flex items-center gap-1.5 bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Online now
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl mb-6 text-center border-white/5">
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            "Residential student at State U. Majoring in Computer Science. Miss my family!"
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button variant="outline" className="h-14 rounded-2xl glass-card border-white/10 hover:bg-white/5 font-medium">
            <QrCode className="w-5 h-5 mr-2 text-secondary" />
            My QR Code
          </Button>
          <Button variant="outline" className="h-14 rounded-2xl glass-card border-white/10 hover:bg-white/5 font-medium">
            <Share className="w-5 h-5 mr-2 text-primary" />
            Share Link
          </Button>
        </div>

        <div className="glass-card rounded-3xl overflow-hidden p-5 border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold">Account Status</h3>
              <p className="text-xs text-muted-foreground">Premium Student Plan</p>
            </div>
          </div>
          <div className="w-full bg-surface rounded-full h-2 overflow-hidden mb-2">
            <div className="bg-gradient-to-r from-primary to-secondary w-[100%] h-full rounded-full" />
          </div>
          <p className="text-[11px] text-muted-foreground text-center">Fully secured & active</p>
        </div>
      </div>
    </AppLayout>
  );
}
