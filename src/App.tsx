import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { DemoDisclaimer } from "@/components/DemoDisclaimer";
import { StarBackground } from "@/components/StarBackground";
import Dashboard from "./pages/Dashboard";
import Quotes from "./pages/Quotes";
import LoadMatching from "./pages/LoadMatching";
import Documents from "./pages/Documents";
import Forecasting from "./pages/Forecasting";
import Analytics from "./pages/Analytics";
import RoutePlanning from "./pages/RoutePlanning";
import LeadGeneration from "./pages/LeadGeneration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="relative min-h-screen bg-black">
          <StarBackground />
          <div className="relative z-10">
            <Navigation />
            <DemoDisclaimer />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/quotes" element={<Quotes />} />
              <Route path="/load-matching" element={<LoadMatching />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/forecasting" element={<Forecasting />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/lead-generation" element={<LeadGeneration />} />
              <Route path="/route-planning" element={<RoutePlanning />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
