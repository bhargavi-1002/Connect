import { Link } from "wouter";
import { ArrowLeft, Smartphone, Laptop, Monitor } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";

const mockDevices = [
  { id: 1, type: "smartphone", name: "iPhone 13 Pro", browser: "App", lastSeen: "Active now", isCurrent: true },
  { id: 2, type: "laptop", name: "MacBook Air", browser: "Chrome", lastSeen: "2 hours ago", isCurrent: false },
  { id: 3, type: "desktop", name: "Library PC 04", browser: "Edge", lastSeen: "Yesterday", isCurrent: false }
];

export default function DevicesPage() {
  const getIcon = (type: string) => {
    if (type === "laptop") return Laptop;
    if (type === "desktop") return Monitor;
    return Smartphone;
  };

  return (
    <AppLayout showBottomNav={false}>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <Link href="/settings" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <h1 className="text-xl font-bold">Connected Devices</h1>
      </header>

      <div className="p-4 space-y-6">
        <p className="text-muted-foreground text-sm px-2">
          These devices are currently logged into your Connect account. If you see a device you don't recognize, log it out immediately.
        </p>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-white px-2">Current Device</h2>
          {mockDevices.filter(d => d.isCurrent).map(device => {
            const Icon = getIcon(device.type);
            return (
              <div key={device.id} className="glass-card p-4 rounded-3xl flex items-center gap-4 border-primary/30">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{device.name}</h3>
                  <p className="text-xs text-muted-foreground">{device.browser} • <span className="text-success">{device.lastSeen}</span></p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-white px-2 mt-6">Other Devices</h2>
          <div className="glass-card rounded-3xl overflow-hidden flex flex-col">
            {mockDevices.filter(d => !d.isCurrent).map((device, idx, arr) => {
              const Icon = getIcon(device.type);
              return (
                <div key={device.id} className={`p-4 flex items-center gap-4 ${idx !== arr.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{device.name}</h3>
                    <p className="text-xs text-muted-foreground">{device.browser} • {device.lastSeen}</p>
                  </div>
                  <button className="text-xs font-medium text-destructive px-3 py-1.5 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors">
                    Log out
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-8">
          <Button variant="outline" className="w-full h-14 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 bg-transparent">
            Log Out of All Other Devices
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
