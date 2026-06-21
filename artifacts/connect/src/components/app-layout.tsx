import { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";

interface AppLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  className?: string;
}

export function AppLayout({ children, showBottomNav = true, className = "" }: AppLayoutProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-background flex justify-center text-foreground font-sans selection:bg-primary/30">
      <div className={`w-full max-w-[430px] lg:max-w-[800px] min-h-[100dvh] relative flex flex-col bg-background/50 shadow-2xl overflow-hidden ${className}`}>
        {/* Ambient glow effects behind everything */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[30%] bg-secondary/20 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col w-full h-full relative z-10 ${showBottomNav ? 'pb-24' : ''}`}>
          {children}
        </div>
        
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
