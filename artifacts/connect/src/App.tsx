import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Import all pages (to be created)
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
import AlertPage from "./pages/alerts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/verify" component={VerifyPage} />
      <Route path="/login" component={LoginPage} />
      
      {/* Main app shell routes */}
      <Route path="/chats" component={ChatsPage} />
      <Route path="/chats/:id" component={ChatDetailPage} />
      <Route path="/send-priority" component={SendPriorityPage} />
      <Route path="/themes" component={ThemesPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/settings/devices" component={DevicesPage} />
      <Route path="/settings/auto-logout" component={AutoLogoutPage} />
      <Route path="/connections" component={ConnectionsPage} />
      <Route path="/alerts" component={AlertPage} />
      <Route path="/profile" component={ProfilePage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
