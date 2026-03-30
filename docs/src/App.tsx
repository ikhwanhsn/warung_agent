import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DocsHome from "./pages/DocsHome";
import Welcome from "./pages/Welcome";
import APIReference from "./pages/docs/APIReference";
import ApiDocPage from "./pages/docs/ApiDocPage";
import Changelog from "./pages/docs/Changelog";
import Community from "./pages/docs/Community";
import WarungAiAgent from "./pages/docs/WarungAiAgent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" storageKey="warung-docs-theme" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/docs" replace />} />
            <Route path="/docs" element={<DocsHome />} />
            <Route path="/docs/welcome" element={<Welcome />} />
            <Route path="/docs/ai-agent" element={<WarungAiAgent />} />
            <Route path="/docs/api-reference" element={<APIReference />} />
            <Route path="/docs/api-reference/endpoints" element={<APIReference />} />
            <Route path="/docs/api/:slug" element={<ApiDocPage />} />
            <Route path="/docs/api-reference/errors" element={<APIReference />} />
            <Route path="/docs/api-reference/rate-limits" element={<APIReference />} />
            <Route path="/docs/changelog" element={<Changelog />} />
            <Route path="/docs/community" element={<Community />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
