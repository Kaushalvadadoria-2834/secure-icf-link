import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConsentProvider } from "./context/ConsentContext";
import Index from "./pages/Index";
import LandingPage from "./pages/patient/LandingPage";
import VerifyIdentity from "./pages/patient/VerifyIdentity";
import DocumentViewer from "./pages/patient/DocumentViewer";
import ComprehensionChecklist from "./pages/patient/ComprehensionChecklist";
import SignaturePage from "./pages/patient/SignaturePage";
import CompletionPage from "./pages/patient/CompletionPage";
import ErrorPage from "./pages/patient/ErrorPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ConsentProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Home - Auto-redirect to demo */}
            <Route path="/" element={<Index />} />
            
            {/* Patient Consent Flow */}
            <Route path="/patient/consent/:token" element={<LandingPage />} />
            <Route path="/patient/consent/:token/verify" element={<VerifyIdentity />} />
            <Route path="/patient/consent/:token/document" element={<DocumentViewer />} />
            <Route path="/patient/consent/:token/checklist" element={<ComprehensionChecklist />} />
            <Route path="/patient/consent/:token/signature" element={<SignaturePage />} />
            <Route path="/patient/consent/:token/complete" element={<CompletionPage />} />
            <Route path="/patient/consent/:token/error" element={<ErrorPage />} />
            
            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ConsentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
