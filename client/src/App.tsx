import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { ChatWidget } from "@/components/ChatWidget";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import PkBattles from "@/pages/PkBattles";
import Events from "@/pages/Events";
import CustomPage from "@/pages/CustomPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Admin} />
      <Route path="/pk-battles" component={PkBattles} />
      <Route path="/events" component={Events} />
      <Route path="/page/:slug" component={CustomPage} />
      
      {/* Placeholders for Movies/Games using CustomPage logic or similar */}
      <Route path="/movies">
        <div className="container py-20 text-center">
          <h1 className="text-4xl font-display font-bold mb-4">Movies</h1>
          <p className="text-muted-foreground">Coming Soon</p>
        </div>
      </Route>
      <Route path="/games">
        <div className="container py-20 text-center">
          <h1 className="text-4xl font-display font-bold mb-4">Games</h1>
          <p className="text-muted-foreground">Coming Soon</p>
        </div>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
          <AnnouncementBar />
          <Navigation />
          <main className="flex-1">
            <Router />
          </main>
          <ChatWidget />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
