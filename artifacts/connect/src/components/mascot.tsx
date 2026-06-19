import { motion } from "framer-motion";

interface MascotProps {
  src: string;
  alt?: string;
  size?: string;          // Tailwind width class e.g. "w-40"
  glowColor?: string;     // Tailwind bg class e.g. "bg-primary/30"
  className?: string;
  floatAmplitude?: number;
  floatDuration?: number;
  delay?: number;
}

/**
 * A floating Pixar-style character that feels integrated — not like a pasted photo.
 * No rectangular frame, no border, just the character floating in space with a soft glow.
 */
export function Mascot({
  src,
  alt = "",
  size = "w-40",
  glowColor = "bg-primary/30",
  className = "",
  floatAmplitude = 10,
  floatDuration = 4,
  delay = 0,
}: MascotProps) {
  return (
    <motion.div
      className={`relative flex-shrink-0 ${size} ${className}`}
      animate={{ y: [0, -floatAmplitude, 0] }}
      transition={{
        repeat: Infinity,
        duration: floatDuration,
        ease: "easeInOut",
        delay,
      }}
      style={{ filter: "none" }}
    >
      {/* Soft ambient glow — not a box, just a radial light */}
      <div
        className={`absolute inset-[10%] ${glowColor} blur-[30px] rounded-full pointer-events-none`}
      />
      <img
        src={src}
        alt={alt}
        className="relative z-10 w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
        style={{ imageRendering: "auto" }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    </motion.div>
  );
}

/** Compact inline mascot for headers and section intros */
export function MascotInline({
  src,
  alt = "",
  size = "w-20",
  glowColor = "bg-secondary/25",
  className = "",
}: Omit<MascotProps, "floatAmplitude" | "floatDuration" | "delay">) {
  return (
    <motion.div
      className={`relative flex-shrink-0 ${size} aspect-square ${className}`}
      animate={{ y: [0, -5, 0] }}
      transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
    >
      <div className={`absolute inset-0 ${glowColor} blur-[20px] rounded-full pointer-events-none`} />
      <img
        src={src}
        alt={alt}
        className="relative z-10 w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    </motion.div>
  );
}
