
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireQuestionnaire?: boolean;
  requireUpload?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireQuestionnaire = false,
  requireUpload = false 
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#171b22] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  if (requireQuestionnaire && !user.hasCompletedQuestionnaire) {
    return <Navigate to="/questionnaire" replace />;
  }

  if (requireUpload && !user.hasUploadedStatement) {
    return <Navigate to="/upload" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
