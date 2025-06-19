
import React from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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

  console.log('AppRouter render - Route:', location.pathname, 'isLoading:', isLoading, 'user:', user?.id, 'hasCompletedQuestionnaire:', user?.hasCompletedQuestionnaire, 'authError:', authError);

  // Show loading while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#171b22] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-lg mb-2">Loading...</div>
          <div className="text-gray-400 text-sm">Checking your authentication status</div>
        </div>
      </div>
    );
  }

  // Show error state if there's an auth error
  if (authError) {
    return (
      <div className="min-h-screen bg-[#171b22] flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="text-red-400 text-lg mb-2">Authentication Error</div>
          <div className="text-gray-400 text-sm mb-4">{authError}</div>
          <div className="space-y-2">
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

  // If user is not authenticated, only allow landing page
  if (!user) {
    console.log('No user found, showing landing page or redirecting');
    return (
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    );
  }

  // If user hasn't completed questionnaire, only allow questionnaire
  if (!user.hasCompletedQuestionnaire) {
    console.log('User has not completed questionnaire, showing questionnaire or redirecting');
    return (
      <Routes>
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="*" element={<Navigate to="/questionnaire" replace />} />
      </Routes>
    );
  }

  // Main app with sidebar for authenticated users who completed questionnaire
  console.log('User authenticated and questionnaire complete, showing main app');
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

export default AppRouter;
