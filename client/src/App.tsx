import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

// Pages
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Documents from "@/pages/Documents";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
  if (!user) return <Redirect to="/auth" />;
  
  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      
      <Route path="/">
        {user ? <ProtectedRoute component={Dashboard} /> : <Redirect to="/auth" />}
      </Route>
      
      <Route path="/documents">
        <ProtectedRoute component={Documents} />
      </Route>
      
      <Route path="/reports">
        <ProtectedRoute component={Reports} />
      </Route>
      
      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
