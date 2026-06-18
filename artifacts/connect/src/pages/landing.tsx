import { Link } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, Shield, Heart, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-x-0 border-t-0 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center glowing-primary">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Connect</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
          <a href="#themes" className="hover:text-white transition-colors">Themes</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/onboarding">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-lg shadow-primary/25">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
        <div className="flex-1 flex flex-col items-start gap-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/30"
          >
            <Moon className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">A magical way to connect</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold leading-tight tracking-tight"
          >
            Stay Close,<br />
            <span className="gradient-text">Even When You're Far.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl"
          >
            A premium communication platform where residential students connect with family when they can only access shared computers. Feel the warmth of home, anywhere.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto"
          >
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white rounded-full px-8 py-6 text-lg glowing-primary border-none">
                Start Connecting
              </Button>
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex items-center gap-6 mt-8 opacity-70"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              </div>
              <span className="text-sm font-medium">Web</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.523 15.3414c-.5511 0-1.0022-.4511-1.0022-1.0022s.4511-1.0022 1.0022-1.0022c.5511 0 1.0022.4511 1.0022 1.0022s-.4511 1.0022-1.0022 1.0022zm-11.046 0c-.5511 0-1.0022-.4511-1.0022-1.0022s.4511-1.0022 1.0022-1.0022c.5511 0 1.0022.4511 1.0022 1.0022s-.4511 1.0022-1.0022 1.0022zm11.405-7.318l1.697-2.94c.05-.09.02-.2-.07-.25-.09-.05-.21-.02-.26.07l-1.69 2.93c-1.38-.63-2.92-1-4.56-1s-3.18.37-4.56 1l-1.69-2.93c-.05-.09-.17-.12-.26-.07-.09.05-.12.16-.07.25l1.697 2.94C4.383 9.4714 2.123 12.8014 2 16.7314h20c-.123-3.93-2.383-7.26-6.072-8.708z"/></svg>
              </div>
              <span className="text-sm font-medium">Android</span>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="flex-1 relative"
        >
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
          <img src="/hero-illustration.png" alt="Family connecting magically" className="relative z-10 w-full h-auto object-cover rounded-3xl drop-shadow-2xl" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Connect?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Everything you need to feel close, bundled in a magical experience.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-3xl flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Secure by default</h3>
            <p className="text-muted-foreground">Auto-logout features ensure your sessions are always safe on shared devices.</p>
          </div>
          <div className="glass-card p-8 rounded-3xl flex flex-col items-start gap-4 border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px]" />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white glowing-primary">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Priority Messaging</h3>
            <p className="text-muted-foreground">Let your family know instantly when something is urgent, good news, or an emergency.</p>
          </div>
          <div className="glass-card p-8 rounded-3xl flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Beautiful Themes</h3>
            <p className="text-muted-foreground">Customize your space with gorgeous gradients and wallpapers that match your mood.</p>
          </div>
        </div>
      </section>
      
    </div>
  );
}
