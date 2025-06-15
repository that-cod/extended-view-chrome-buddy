
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Questionnaire from "./pages/Questionnaire";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Journal from "./pages/Journal";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AppSidebar from "@/components/Sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();

  // If user is not authenticated, show landing page
  if (!user) {
    return (
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    );
  }

  // If user hasn't completed questionnaire, redirect to questionnaire
  if (!user.hasCompletedQuestionnaire) {
    return (
      <Routes>
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="*" element={<Navigate to="/questionnaire" replace />} />
      </Routes>
    );
  }

  // Main app with sidebar
  return (
    <div className="bg-[#171b22] min-h-screen flex w-full">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SidebarTrigger />
          <main className="flex-1 p-6 bg-[#171b22] text-white min-h-screen rounded-lg shadow overflow-auto">
            <Routes>
              <Route path="/" element={
                <ProtectedRoute requireUpload={false}>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/upload" element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              } />
              <Route path="/journal" element={
                <ProtectedRoute requireUpload={true}>
                  <Journal />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
