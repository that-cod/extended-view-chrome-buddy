
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface QuestionnaireData {
  // Personal Info
  name: string;
  age: string;
  sex: string;
  traderType: string;
  experience: string;
  
  // Trading Details
  markets: string[];
  portfolioSize: string;
  emotionalImpact: number;
  emotionalChallenges: string[];
  tradingStress: string;
  
  // Trading Behavior
  stopLossDecision: string;
  currentPlatforms: string;
  useJournaling: string;
  emotionManagement: string[];
  
  // Goals & Preferences
  tradingGoals: string[];
  successDefinition: string;
  helpfulFeatures: string[];
  willingnessToPay: string;
  dataConcerns: string;
}

const Questionnaire = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<QuestionnaireData>({
    name: '',
    age: '',
    sex: '',
    traderType: '',
    experience: '',
    markets: [],
    portfolioSize: '',
    emotionalImpact: 5,
    emotionalChallenges: [],
    tradingStress: '',
    stopLossDecision: '',
    currentPlatforms: '',
    useJournaling: '',
    emotionManagement: [],
    tradingGoals: [],
    successDefinition: '',
    helpfulFeatures: [],
    willingnessToPay: '',
    dataConcerns: '',
  });

  const totalSteps = 5;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleArrayToggle = (field: keyof QuestionnaireData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter(item => item !== value)
        : [...(prev[field] as string[]), value]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Save questionnaire data (in real app, send to backend)
      console.log('Questionnaire completed:', formData);
      
      // Update user to mark questionnaire as completed
      updateUser({ hasCompletedQuestionnaire: true, name: formData.name });
      
      toast({
        title: "Profile Complete!",
        description: "Now let's upload your trading statement for analysis.",
      });
      
      // Redirect to upload page
      navigate('/upload');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save questionnaire. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.name && formData.age && formData.sex && formData.traderType && formData.experience;
      case 1:
        return formData.markets.length > 0 && formData.portfolioSize;
      case 2:
        return formData.emotionalChallenges.length > 0 && formData.tradingStress;
      case 3:
        return formData.stopLossDecision && formData.currentPlatforms && formData.useJournaling && formData.emotionManagement.length > 0;
      case 4:
        return formData.tradingGoals.length > 0 && formData.successDefinition && formData.helpfulFeatures.length > 0;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-gray-300">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-[#1c2027] border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="age" className="text-gray-300">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="bg-[#1c2027] border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-3 block">Sex *</Label>
              <div className="grid grid-cols-3 gap-2">
                {['Male', 'Female', 'Other'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, sex: option }))}
                    className={`p-3 rounded-lg border transition-colors ${
                      formData.sex === option
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#1c2027] border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-3 block">Type of Trader *</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Day Trader', 'Scalper Trader', 'Swing Trader', 'Long Term Investor'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, traderType: option }))}
                    className={`p-3 rounded-lg border transition-colors ${
                      formData.traderType === option
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#1c2027] border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-3 block">Trading Experience *</Label>
              <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Intermediate', 'Pro'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, experience: option }))}
                    className={`p-3 rounded-lg border transition-colors ${
                      formData.experience === option
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#1c2027] border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Trading Markets & Portfolio</h2>
            
            <div>
              <Label className="text-gray-300 mb-3 block">What markets do you trade in? *</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Commodities', 'Stocks', 'Forex', 'Crypto', 'Options'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleArrayToggle('markets', option)}
                    className={`p-3 rounded-lg border transition-colors ${
                      formData.markets.includes(option)
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#1c2027] border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-3 block">Approximate size of your trading portfolio *</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Under $1,000', '$1,000 - $10,000', '$10,000 - $50,000', '$50,000 - $100,000', '$100,000 - $500,000', 'Over $500,000'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, portfolioSize: option }))}
                    className={`p-3 rounded-lg border transition-colors ${
                      formData.portfolioSize === option
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#1c2027] border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-3 block">
                On a scale of 1-10, how much do emotions impact your trades? ({formData.emotionalImpact}/10)
              </Label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.emotionalImpact}
                onChange={(e) => setFormData(prev => ({ ...prev, emotionalImpact: Number(e.target.value) }))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>No impact</span>
                <span>Major impact</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Emotional Challenges</h2>
            
            <div>
              <Label className="text-gray-300 mb-3 block">Which emotional challenges affect you the most? *</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Overconfidence', 'Panic Selling', 'Overtrading', 'Holding Losers Too Long', 'FOMO'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleArrayToggle('emotionalChallenges', option)}
                    className={`p-3 rounded-lg border transition-colors ${
                      formData.emotionalChallenges.includes(option)
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#1c2027] border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-3 block">Have you experienced trading-induced stress or anxiety? *</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Never', 'Rarely', 'Sometimes', 'Often', 'Always'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tradingStress: option }))}
                    className={`p-3 rounded-lg border transition-colors ${
                      formData.tradingStress === option
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#1c2027] border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Trading Behavior & Tools</h2>
            
            <div>
              <Label htmlFor="stopLoss" className="text-gray-300">How do you decide when to shift or tighten stop-losses? Do you ever 'anchor' to certain price points? *</Label>
              <Textarea
                id="stopLoss"
                value={formData.stopLossDecision}
                onChange={(e) => setFormData(prev => ({ ...prev, stopLossDecision: e.target.value }))}
                className="bg-[#1c2027] border-gray-600 text-white mt-2"
                rows={3}
                placeholder="Describe your stop-loss strategy..."
              />
            </div>

            <div>
              <Label htmlFor="platforms" className="text-gray-300">What trading platforms/tools do you currently use? *</Label>
              <Input
                id="platforms"
                value={formData.currentPlatforms}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPlatforms: e.target.value }))}
                className="bg-[#1c2027] border-gray-600 text-white mt-2"
                placeholder="e.g., MetaTrader, TradingView, etc."
              />
            </div>

            <div>
              <Label className="text-gray-300 mb-3 block">Do you use any journaling or analytics tools? *</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Yes', 'No'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, useJournaling: option }))}
                    className={`p-3 rounded-lg border transition-colors ${
                      formData.useJournaling === option
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#1c2027] border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-3 block">How do you currently manage emotions? *</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Meditation', 'Taking Breaks', 'Rule-Based Trading', "Don't Do Anything"].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleArrayToggle('emotionManagement', option)}
                    className={`p-3 rounded-lg border transition-colors ${
                      formData.emotionManagement.includes(option)
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#1c2027] border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Goals & Preferences</h2>
            
            <div>
              <Label className="text-gray-300 mb-3 block">What are your primary trading goals? *</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Consistent Profit', 'Learning', 'Supplemental Income', 'Full Time Income'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleArrayToggle('tradingGoals', option)}
                    className={`p-3 rounded-lg border transition-colors ${
                      formData.tradingGoals.includes(option)
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#1c2027] border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="success" className="text-gray-300">What would you consider a success in your trading journey? *</Label>
              <Textarea
                id="success"
                value={formData.successDefinition}
                onChange={(e) => setFormData(prev => ({ ...prev, successDefinition: e.target.value }))}
                className="bg-[#1c2027] border-gray-600 text-white mt-2"
                rows={3}
                placeholder="Describe what success means to you..."
              />
            </div>

            <div>
              <Label className="text-gray-300 mb-3 block">What features would you find most helpful in managing trading psychology? *</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Gamification', 'Real Time Alerts', 'Coaching', 'Community', 'Courses'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleArrayToggle('helpfulFeatures', option)}
                    className={`p-3 rounded-lg border transition-colors ${
                      formData.helpfulFeatures.includes(option)
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#1c2027] border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-3 block">How much would you be willing to pay for such a tool?</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Free only', '$5-15/month', '$15-30/month', '$30-50/month', '$50+/month'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, willingnessToPay: option }))}
                    className={`p-3 rounded-lg border transition-colors ${
                      formData.willingnessToPay === option
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#1c2027] border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="concerns" className="text-gray-300">What concerns would you have about sharing your trading data for emotional analysis?</Label>
              <Textarea
                id="concerns"
                value={formData.dataConcerns}
                onChange={(e) => setFormData(prev => ({ ...prev, dataConcerns: e.target.value }))}
                className="bg-[#1c2027] border-gray-600 text-white mt-2"
                rows={3}
                placeholder="Share any privacy or data concerns..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#171b22] p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Trading Profile Setup</h1>
          <p className="text-gray-400">Help us understand your trading psychology</p>
        </div>

        <Card className="bg-[#232833] border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-white">Step {currentStep + 1} of {totalSteps}</CardTitle>
              <Badge variant="outline">{Math.round(progress)}% Complete</Badge>
            </div>
            <Progress value={progress} className="mb-4" />
          </CardHeader>
          <CardContent>
            {renderStep()}
            
            <div className="flex justify-between pt-6 mt-6 border-t border-gray-700">
              <Button 
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} 
                disabled={currentStep === 0}
                variant="outline"
              >
                Previous
              </Button>
              
              {currentStep === totalSteps - 1 ? (
                <Button 
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Completing...' : 'Complete Setup'}
                </Button>
              ) : (
                <Button 
                  onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))}
                  disabled={!canProceed()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Questionnaire;
