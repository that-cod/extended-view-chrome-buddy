
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Questionnaire from "./pages/Questionnaire";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Journal from "./pages/Journal";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AppSidebar from "@/components/Sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppRouter from "@/components/AppRouter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
