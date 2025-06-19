
import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Questionnaire from "@/pages/Questionnaire";
import Index from "@/pages/Index";
import Upload from "@/pages/Upload";
import Journal from "@/pages/Journal";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import AppSidebar from "@/components/Sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

const AppRouter = () => {
  const { user, isLoading, authError, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  console.log('AppRouter render - Route:', location.pathname, 'isLoading:', isLoading, 'user:', user?.id, 'hasCompletedQuestionnaire:', user?.hasCompletedQuestionnaire, 'authError:', authError);

  // Force bypass loading state - go directly to main app
  // Show error state only if there's an explicit error (not just loading)
  if (authError && !isLoading) {
    return (
      <div className="min-h-screen bg-[#171b22] flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="text-red-400 text-lg mb-2">Authentication Error</div>
          <div className="text-gray-400 text-sm mb-4">{authError}</div>
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/')} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Go to Home
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Refresh Page
            </Button>
            <Button 
              onClick={logout}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Always show the main app with sidebar - no loading screens, no auth checks
  console.log('Rendering main app directly without auth checks');
  return (
    <div className="bg-[#171b22] min-h-screen flex w-full">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="p-2">
            <SidebarTrigger />
          </div>
          <main className="flex-1 p-6 bg-[#171b22] text-white min-h-screen rounded-lg shadow overflow-auto">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/questionnaire" element={<Questionnaire />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Index />} />
            </Routes>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default AppRouter;
