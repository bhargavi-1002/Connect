import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";

import LandingPage from "@/pages/landing";
import OnboardingPage from "@/pages/onboarding";
import SignupPage from "@/pages/signup";
import VerifyPage from "@/pages/verify";
import LoginPage from "@/pages/login";
import ChatsPage from "@/pages/chats";
import ChatDetailPage from "@/pages/chat-detail";
import SendPriorityPage from "@/pages/send-priority";
import ThemesPage from "@/pages/themes";
import SettingsPage from "@/pages/settings";
import DevicesPage from "@/pages/devices";
import AutoLogoutPage from "@/pages/auto-logout";
import ConnectionsPage from "@/pages/connections";
import AlertsPage from "@/pages/alerts";
import ProfilePage from "@/pages/profile";
import InvitePage from "@/pages/invite";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/onboarding");
    }
  }, [loading, user, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/verify" component={VerifyPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/invite/:username" component={InvitePage} />

      <Route path="/chats">
        {() => <ProtectedRoute component={ChatsPage} />}
      </Route>
      <Route path="/chats/:id">
        {() => <ProtectedRoute component={ChatDetailPage} />}
      </Route>
      <Route path="/send-priority">
        {() => <ProtectedRoute component={SendPriorityPage} />}
      </Route>
      <Route path="/themes">
        {() => <ProtectedRoute component={ThemesPage} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={SettingsPage} />}
      </Route>
      <Route path="/settings/devices">
        {() => <ProtectedRoute component={DevicesPage} />}
      </Route>
      <Route path="/settings/auto-logout">
        {() => <ProtectedRoute component={AutoLogoutPage} />}
      </Route>
      <Route path="/connections">
        {() => <ProtectedRoute component={ConnectionsPage} />}
      </Route>
      <Route path="/alerts">
        {() => <ProtectedRoute component={AlertsPage} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={ProfilePage} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
