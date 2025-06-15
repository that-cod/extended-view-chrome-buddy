
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, logout, isLoading } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lastUpload, setLastUpload] = useState<string | null>(null);

  const navigate = useNavigate();

  // Log user and isLoading for stuck screen diagnosis
  React.useEffect(() => {
    console.log('Profile page: user', user, 'isLoading', isLoading);
  }, [user, isLoading]);

  // Defensive: If auth or user info still loading, show loading (matches app style)
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#171b22] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Fetch last upload date from uploaded_statements (safe: user is checked above)
  React.useEffect(() => {
    const fetchLastUpload = async () => {
      if (!user?.id) return setLastUpload(null);
      const { data, error } = await supabase
        .from('uploaded_statements')
        .select('upload_date')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.upload_date) setLastUpload(new Date(data.upload_date).toLocaleString());
      else setLastUpload(null);
    };
    fetchLastUpload();
  }, [user?.id]);

  // Dummy psychological profile (replace with real values as available)
  const psychologicalProfile = {
    riskTolerance: 75,
    emotionalControl: 60,
    disciplineScore: 85,
    fomoProneness: 40,
    overconfidenceLevel: 55,
    patternRecognition: 70
  };

  // Risk Profile summary for display
  const riskProfileSummary = useMemo(() => {
    const { riskTolerance } = psychologicalProfile;
    if (riskTolerance >= 80) return "High";
    if (riskTolerance >= 60) return "Medium-high";
    if (riskTolerance >= 40) return "Medium";
    return "Conservative";
  }, [psychologicalProfile]);

  // Delete account function
  const handleDeleteAccount = async () => {
    setDeleting(true);
    // Call RPC or delete user rows from all related tables first, then profiles.
    // This is a placeholder; real-world production apps need a better cascade!
    try {
      // Optionally, delete from other user-owned tables here
      await supabase.from('profiles').delete().eq('id', user?.id);
      // Sign out user
      await logout();
      // Optionally, show notification
    } catch (e) {
      // Optionally, show error
    }
    setDeleting(false);
    setShowDeleteDialog(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 justify-between mb-6">
        <div className="flex items-center gap-3">
          <User className="w-10 h-10 text-blue-400" />
          <div>
            <div className="text-2xl font-bold text-white">{user?.name || user?.email}</div>
            <div className="text-sm text-gray-400">{user?.email}</div>
          </div>
        </div>
        <div>
          <Button variant="outline" onClick={logout} className="mr-2">
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </Button>
        </div>
      </div>
      {/* Settings Card */}
      <Card className="bg-[#232833] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Settings &amp; Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Email:</span>
                <div className="text-white text-sm">{user?.email}</div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Risk Profile:</span>
                <div className="text-white text-sm">{riskProfileSummary}</div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Last Upload Date:</span>
                <div className="text-white text-sm">{lastUpload || "No upload yet"}</div>
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <Button variant="outline" onClick={() => navigate("/questionnaire")}>
                Update Questionnaire
              </Button>
              <Button variant="outline" className="border-red-700 text-red-400 hover:bg-red-900/20" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="w-4 h-4 mr-1" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questionnaire & Psychological profile below */}
      <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Psychological Profile</h1>
        <p className="text-gray-400">Based on your questionnaire responses and trading data</p>
      </div>

      {/* Profile Overview */}
      <Card className="bg-[#232833] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <User className="h-5 w-5 mr-2" />
            Trader Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Profile Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Experience Level:</span>
                  <span className="text-white">{/* answers[1] ||  */'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Tolerance:</span>
                  <span className="text-white">{/* answers[4] ||  */'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Preferred Assets:</span>
                  <span className="text-white">{/* answers[5] ||  */'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Main Trigger:</span>
                  <span className="text-white">{/* answers[2] ||  */'Not specified'}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-3">AI Assessment</h3>
              <p className="text-sm text-gray-400">
                Based on your responses, you show signs of moderate emotional trading with 
                strong analytical tendencies. Focus on developing better loss management 
                strategies and reducing FOMO-driven decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Psychological Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#232833] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="h-5 w-5 mr-2" />
              Psychological Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(psychologicalProfile).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getScoreColor(value)}`}>
                      {value}/100
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getScoreColor(value)}`}
                    >
                      {getScoreDescription(value)}
                    </Badge>
                  </div>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-[#232833] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="h-5 w-5 mr-2" />
              Improvement Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-[#1c2027] rounded-lg border border-yellow-600">
                <h4 className="text-sm font-medium text-yellow-400 mb-1">Emotional Control</h4>
                <p className="text-xs text-gray-400">
                  Work on maintaining composure during market volatility
                </p>
              </div>
              <div className="p-3 bg-[#1c2027] rounded-lg border border-red-600">
                <h4 className="text-sm font-medium text-red-400 mb-1">FOMO Management</h4>
                <p className="text-xs text-gray-400">
                  Develop strategies to avoid fear-driven trading decisions
                </p>
              </div>
              <div className="p-3 bg-[#1c2027] rounded-lg border border-yellow-600">
                <h4 className="text-sm font-medium text-yellow-400 mb-1">Overconfidence</h4>
                <p className="text-xs text-gray-400">
                  Practice humility and proper risk management
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="bg-[#232833] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <User className="h-5 w-5 mr-2" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">Daily Practices</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Review and journal after each trade</li>
                <li>• Set daily loss limits and stick to them</li>
                <li>• Practice mindfulness before trading sessions</li>
                <li>• Use smaller position sizes during emotional periods</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">Strategy Adjustments</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Implement mandatory cooling-off periods</li>
                <li>• Create pre-defined exit strategies</li>
                <li>• Use automated tools to reduce emotional decisions</li>
                <li>• Focus on quality over quantity of trades</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button 
          onClick={() => navigate("/questionnaire")}
          variant="outline"
          className="mr-4"
        >
          Retake Questionnaire
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Download Full Report
        </Button>
      </div>
    </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#232833] rounded-lg p-6 w-full max-w-sm border border-gray-700 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Confirm Account Deletion
            </h3>
            <p className="text-gray-300 mb-4 text-sm">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button disabled={deleting} variant="outline" className="flex-1" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                disabled={deleting}
                className="flex-1 bg-red-700 hover:bg-red-800 text-white"
                onClick={handleDeleteAccount}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function getScoreColor(value: number): string {
    if (value >= 70) return "text-green-400";
    if (value >= 50) return "text-yellow-400";
    return "text-red-400";
  }

  function getScoreDescription(value: number): string {
    if (value >= 70) return "Good";
    if (value >= 50) return "Moderate";
    return "Needs Improvement";
  }
};

export default Profile;
