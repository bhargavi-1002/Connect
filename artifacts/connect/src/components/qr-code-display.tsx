import { useEffect, useRef } from "react";
import { X, Download } from "lucide-react";
import { motion } from "framer-motion";
import QRCode from "qrcode";

interface Props {
  value: string;
  username: string;
  onClose: () => void;
}

export default function QRCodeDisplay({ value, username, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: 240,
        margin: 2,
        color: { dark: "#FFFFFF", light: "#0F1738" },
      });
    }
  }, [value]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `connect-qr-${username}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card rounded-3xl p-8 flex flex-col items-center gap-6 max-w-xs w-full border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center w-full">
          <h2 className="font-bold text-lg">My QR Code</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-surface rounded-2xl">
          <canvas ref={canvasRef} className="rounded-xl" />
        </div>

        <div className="text-center">
          <p className="font-bold text-white">@{username}</p>
          <p className="text-xs text-muted-foreground mt-1">Scan to connect with me on Connect</p>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
        >
          <Download className="w-4 h-4" /> Save QR Code
        </button>
      </motion.div>
    </motion.div>
  );
}
