import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, FileText, Mic, MapPin, Tag, X, Loader2 } from "lucide-react";
import type { Message } from "@/lib/firestore";
import { AudioRecorder } from "./audio-recorder";

interface AttachmentSheetProps {
  open: boolean;
  onClose: () => void;
  onSelectMedia: (file: File) => void;
  onSelectDocument: (file: File) => void;
  onSelectLocation: () => void;
  onSelectAudio: (blob: Blob, duration: number) => void;
  onSelectPriority: (priority: Message["priority"]) => void;
  uploading?: boolean;
}

export function AttachmentSheet({
  open, onClose, onSelectMedia, onSelectDocument,
  onSelectLocation, onSelectAudio, onSelectPriority, uploading,
}: AttachmentSheetProps) {
  const mediaRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const [showAudio, setShowAudio] = useState(false);
  const [showPriority, setShowPriority] = useState(false);

  const handleMediaPick = useCallback(() => mediaRef.current?.click(), []);
  const handleDocPick = useCallback(() => docRef.current?.click(), []);

  const handleLocation = useCallback(() => {
    onSelectLocation();
    onClose();
  }, [onSelectLocation, onClose]);

  if (showAudio) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => { setShowAudio(false); onClose(); }}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-[430px] lg:max-w-[800px] bg-surface rounded-t-3xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <AudioRecorder
              onSend={(blob, duration) => {
                onSelectAudio(blob, duration);
                setShowAudio(false);
                onClose();
              }}
              onCancel={() => setShowAudio(false)}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (showPriority) {
    const priorities: { key: Message["priority"]; label: string; color: string }[] = [
      { key: "normal", label: "Normal", color: "from-primary to-secondary" },
      { key: "good_news", label: "Good News", color: "from-emerald-500 to-teal-500" },
      { key: "important", label: "Important", color: "from-amber-500 to-orange-500" },
      { key: "urgent", label: "Urgent", color: "from-orange-600 to-red-500" },
      { key: "emergency", label: "Emergency", color: "from-destructive to-rose-700" },
    ];

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => { setShowPriority(false); onClose(); }}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-[430px] lg:max-w-[800px] bg-surface rounded-t-3xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Priority</h3>
              <button onClick={() => setShowPriority(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {priorities.map(p => (
                <button
                  key={p.key}
                  onClick={() => { onSelectPriority(p.key); setShowPriority(false); onClose(); }}
                  className={`w-full p-4 rounded-3xl text-left bg-gradient-to-r ${p.color} text-white font-medium`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const items = [
    { icon: Image, label: "Gallery", desc: "Photos & Videos", onClick: handleMediaPick, disabled: uploading },
    { icon: FileText, label: "Document", desc: "PDF, DOC, etc.", onClick: handleDocPick, disabled: uploading },
    { icon: Mic, label: "Audio", desc: "Record voice message", onClick: () => setShowAudio(true), disabled: uploading },
    { icon: MapPin, label: "Location", desc: "Share live location", onClick: handleLocation, disabled: uploading },
    { icon: Tag, label: "Priority", desc: "Set message priority", onClick: () => setShowPriority(true), disabled: false },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-[430px] lg:max-w-[800px] bg-surface rounded-t-3xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Share</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploading && (
              <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-primary/20">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-primary font-medium">Uploading…</span>
              </div>
            )}

            <div className="grid grid-cols-5 gap-3">
              {items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    disabled={item.disabled}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white/10 transition-colors disabled:opacity-40"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <input
            ref={mediaRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) { onSelectMedia(file); onClose(); }
              e.target.value = "";
            }}
          />
          <input
            ref={docRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.csv"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) { onSelectDocument(file); onClose(); }
              e.target.value = "";
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}