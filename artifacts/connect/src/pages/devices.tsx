import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Smartphone, Laptop, Monitor, Trash2, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { listenToDevices, removeDevice, type Device } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

function DeviceIcon({ os }: { os: string }) {
  if (os === "Android" || os === "iOS") return <Smartphone className="w-5 h-5" />;
  if (os === "macOS") return <Laptop className="w-5 h-5" />;
  return <Monitor className="w-5 h-5" />;
}

export default function DevicesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const currentDeviceId = localStorage.getItem("connect_device_id");

  useEffect(() => {
    if (!user) return;
    const unsub = listenToDevices(user.uid, (data) => {
      setDevices(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleRemove = async (deviceId: string) => {
    setRemoving(deviceId);
    try {
      await removeDevice(deviceId);
      toast({ title: "Device removed" });
    } catch {
      toast({ title: "Failed to remove", variant: "destructive" });
    } finally {
      setRemoving(null);
    }
  };

  return (
    <AppLayout showBottomNav={false}>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-4">
        <Link href="/settings" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <h1 className="text-xl font-bold">Connected Devices</h1>
      </header>

      <div className="p-4 pb-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <Monitor className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-bold text-lg">No Devices</h3>
            <p className="text-sm text-muted-foreground">No connected devices found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground px-2 mb-4">
              {devices.length} device{devices.length !== 1 ? "s" : ""} connected to your account
            </p>
            {devices.map((device) => {
              const isCurrent = device.id === currentDeviceId;
              return (
                <div key={device.id} className={`glass-card p-4 rounded-3xl flex items-center gap-4 ${isCurrent ? "border border-primary/30" : ""}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCurrent ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground"}`}>
                    <DeviceIcon os={device.os} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white truncate">{device.name}</h3>
                      {isCurrent && (
                        <span className="flex-shrink-0 text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          This device
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {device.lastActive?.toDate
                        ? isCurrent ? "Active now" : `Last seen ${formatDistanceToNow(device.lastActive.toDate(), { addSuffix: true })}`
                        : "Recently active"}
                    </p>
                  </div>
                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(device.id)}
                      disabled={removing === device.id}
                      className="w-10 h-10 rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors flex-shrink-0"
                    >
                      {removing === device.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
