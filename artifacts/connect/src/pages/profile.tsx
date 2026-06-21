import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Settings, Edit3, QrCode, Share, Shield, Loader2, Camera, Lock, Mail } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile, generateInviteLink } from "@/lib/firestore";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import QRCodeDisplay from "@/components/qr-code-display";

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { displayName, bio });
      await refreshProfile();
      setEditing(false);
      toast({ title: "Profile updated!" });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    let timeoutId: ReturnType<typeof setTimeout>;
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      const uploadPromise = uploadBytes(storageRef, file);
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("timeout")), 15000);
      });
      await Promise.race([uploadPromise, timeoutPromise]);
      clearTimeout(timeoutId!);
      const url = await getDownloadURL(storageRef);
      await updateUserProfile(user.uid, { photoURL: url });
      await refreshProfile();
      toast({ title: "Photo updated!" });
    } catch (err) {
      const isTimeout = err instanceof Error && err.message === "timeout";
      if (isTimeout) {
        toast({ title: "Upload timed out", description: "Check your connection and try again.", variant: "destructive" });
      } else {
        toast({ title: "Upload failed", description: "Make sure Firebase Storage is enabled in your project.", variant: "destructive" });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) {
      toast({ title: "No email on account", description: "You need an email to reset your password.", variant: "destructive" });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({ title: "Password reset email sent", description: `Check ${user.email} for instructions.` });
    } catch (err: unknown) {
      toast({ title: "Failed to send reset email", description: err instanceof Error ? err.message : "Try again.", variant: "destructive" });
    }
  };

  const copyInviteLink = () => {
    if (profile) {
      navigator.clipboard.writeText(generateInviteLink(profile.username));
      toast({ title: "Link copied!" });
    }
  };

  if (!profile) {
    return (
      <AppLayout showBottomNav={true}>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showBottomNav={true}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />

      <header className="pt-12 pb-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Link href="/settings" className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors">
          <Settings className="w-5 h-5 text-white" />
        </Link>
      </header>

      <div className="p-6 pb-20">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4 group">
            <div className="w-28 h-28 rounded-full border-4 border-surface overflow-hidden shadow-xl shadow-primary/20 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : profile.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-white">{profile.displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white border-2 border-surface shadow-md"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {editing ? (
            <div className="w-full space-y-3 mb-4">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-12 rounded-2xl bg-surface/50 border-white/10 text-center font-bold text-lg"
                placeholder="Your name"
              />
              <Input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="h-12 rounded-2xl bg-surface/50 border-white/10 text-center text-sm"
                placeholder="Bio (optional)"
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditing(false)} className="flex-1 h-10 rounded-xl glass-card border-white/10">Cancel</Button>
                <Button onClick={handleSave} disabled={saving} className="flex-1 h-10 rounded-xl bg-primary text-white">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{profile.displayName}</h2>
                <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-white transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-primary font-medium">@{profile.username}</p>
            </>
          )}

          <div className="mt-4 inline-flex items-center gap-1.5 bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Online now
          </div>
        </div>

        {profile.bio && !editing && (
          <div className="glass-card p-5 rounded-3xl mb-6 text-center border-white/5">
            <p className="text-muted-foreground text-[15px] leading-relaxed">"{profile.bio}"</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            onClick={() => setShowQR(true)}
            variant="outline"
            className="h-14 rounded-2xl glass-card border-white/10 hover:bg-white/5 font-medium"
          >
            <QrCode className="w-5 h-5 mr-2 text-secondary" /> My QR Code
          </Button>
          <Button
            onClick={copyInviteLink}
            variant="outline"
            className="h-14 rounded-2xl glass-card border-white/10 hover:bg-white/5 font-medium"
          >
            <Share className="w-5 h-5 mr-2 text-primary" /> Share Link
          </Button>
        </div>

        <div className="space-y-3 mb-6">
          <Button
            onClick={handleChangePassword}
            variant="outline"
            className="w-full h-14 rounded-2xl glass-card border-white/10 hover:bg-white/5 font-medium flex items-center gap-3"
          >
            <Lock className="w-5 h-5 text-primary" />
            <span className="flex-1 text-left">Change Password</span>
            <Mail className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        <div className="glass-card rounded-3xl overflow-hidden p-5 border-white/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold">Account Status</h3>
              <p className="text-xs text-muted-foreground">Email: {profile.email || "—"}</p>
            </div>
          </div>
          <div className="w-full bg-surface rounded-full h-2 overflow-hidden mb-2">
            <div className="bg-gradient-to-r from-primary to-secondary w-full h-full rounded-full" />
          </div>
          <p className="text-[11px] text-muted-foreground text-center">Fully secured & active</p>
        </div>
      </div>

      {showQR && profile && (
        <QRCodeDisplay
          value={generateInviteLink(profile.username)}
          username={profile.username}
          onClose={() => setShowQR(false)}
        />
      )}
    </AppLayout>
  );
}
