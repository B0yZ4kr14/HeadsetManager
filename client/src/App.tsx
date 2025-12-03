import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";

import Home from "./pages/Home";
import TerminalPage from "./pages/Terminal";
import DocsPage from "./pages/Docs";
import DiagnosticsPage from "./pages/Diagnostics";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/terminal" component={TerminalPage} />
        <Route path="/diagnostics" component={DiagnosticsPage} />
        <Route path="/docs" component={DocsPage} />
        <Route path="/settings" component={Settings} />
        <Route path="/help" component={Help} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
