
import React, { useState } from 'react';
import BrandHeader from "@/components/landing/BrandHeader";
import AuthForm from "@/components/landing/AuthForm";
import ContactEmailModal from "@/components/ui/ContactEmailModal";
import { useAuth } from '@/contexts/AuthContext';

const Landing = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showContact, setShowContact] = useState(false);

  // Add error boundary for auth context
  const { authError } = useAuth();

  React.useEffect(() => {
    if (authError) {
      console.error('Auth context error:', authError);
    }
  }, [authError]);

  return (
    <div className="min-h-screen bg-[#171b22] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <BrandHeader onContactClick={() => setShowContact(true)} />
        {showContact && <ContactEmailModal open={showContact} onOpenChange={setShowContact} />}
        <AuthForm 
          isSignUp={isSignUp}
          setIsSignUp={setIsSignUp}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </div>
    </div>
  );
};

export default Landing;
