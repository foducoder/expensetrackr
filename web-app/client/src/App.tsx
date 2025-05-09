import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import Home from "@/pages/Home";
import Transactions from "@/pages/Transactions";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/transactions/:year/:month" component={Transactions} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Make sure theme gets applied only after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {mounted && (
          <div className={resolvedTheme === "dark" ? "dark" : ""}>
            <Layout>
              <Router />
            </Layout>
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
