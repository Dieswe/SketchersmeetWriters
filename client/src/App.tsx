import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Submissions from "@/pages/submissions";
import SecurityCheck from "@/pages/security-check";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/submissions/:promptId" component={Submissions} />
      <Route path="/security-check" component={SecurityCheck} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
