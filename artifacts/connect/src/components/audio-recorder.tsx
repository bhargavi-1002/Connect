import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Send, Trash2, Play, Pause, Loader2 } from "lucide-react";

interface AudioRecorderProps {
  onSend: (blob: Blob, duration: number) => void;
  onCancel: () => void;
}

export function AudioRecorder({ onSend, onCancel }: AudioRecorderProps) {
  const [state, setState] = useState<"idle" | "recording" | "preview">("idle");
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      timer.current && clearInterval(timer.current);
      audioUrl && URL.revokeObjectURL(audioUrl);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4" });
      mediaRecorder.current = recorder;
      chunks.current = [];

      recorder.ondataavailable = e => chunks.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: recorder.mimeType });
        setAudioUrl(URL.createObjectURL(blob));
        setState("preview");
      };

      recorder.start();
      setState("recording");
      const startTime = Date.now();
      timer.current = setInterval(() => setDuration(Math.floor((Date.now() - startTime) / 1000)), 200);
    } catch {
      onCancel();
    }
  }, [onCancel]);

  const stopRecording = useCallback(() => {
    mediaRecorder.current?.stop();
    timer.current && clearInterval(timer.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const handleSend = useCallback(() => {
    if (!chunks.current.length) return;
    const blob = new Blob(chunks.current, { type: mediaRecorder.current?.mimeType || "audio/webm" });
    setUploading(true);
    onSend(blob, duration);
  }, [duration, onSend]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !audioUrl) return;
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
      audioRef.current.onended = () => setPlaying(false);
    }
  }, [playing, audioUrl]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6"
    >
      <h3 className="text-lg font-bold">
        {state === "idle" ? "Voice Message" : state === "recording" ? "Recording…" : "Preview"}
      </h3>

      {state === "idle" && (
        <button
          onClick={startRecording}
          className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_30px_var(--glow-primary,rgba(124,77,255,0.5))]"
        >
          <Mic className="w-8 h-8" />
        </button>
      )}

      {state === "recording" && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
            <span className="text-2xl font-mono font-bold tabular-nums">{formatTime(duration)}</span>
          </div>
          <button onClick={stopRecording} className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center text-white">
            <Square className="w-6 h-6" />
          </button>
        </div>
      )}

      {state === "preview" && audioUrl && (
        <div className="flex flex-col items-center gap-4 w-full">
          <span className="text-2xl font-mono font-bold tabular-nums">{formatTime(duration)}</span>
          <audio ref={audioRef} src={audioUrl} />
          <div className="flex items-center gap-6">
            <button onClick={onCancel} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Trash2 className="w-5 h-5 text-muted-foreground" />
            </button>
            <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_20px_var(--glow-primary,rgba(124,77,255,0.4))]">
              {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
            <button onClick={handleSend} disabled={uploading} className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center hover:bg-success/30 transition-colors disabled:opacity-40">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin text-success" /> : <Send className="w-5 h-5 text-success" />}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}