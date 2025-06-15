
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { QuestionnaireService, type QuestionnaireData } from '@/services/questionnaireService';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const Questionnaire = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state variables
  const [markets, setMarkets] = useState([
    { label: 'Stocks', checked: false },
    { label: 'Forex', checked: false },
    { label: 'Crypto', checked: false },
    { label: 'Options', checked: false },
    { label: 'Futures', checked: false },
    { label: 'Bonds', checked: false },
  ]);

  const [emotionalChallenges, setEmotionalChallenges] = useState([
    { label: 'Fear of losing', checked: false },
    { label: 'Greed', checked: false },
    { label: 'Impatience', checked: false },
    { label: 'Overconfidence', checked: false },
    { label: 'Revenge trading', checked: false },
  ]);

  const [emotionManagement, setEmotionManagement] = useState([
    { label: 'Meditation', checked: false },
    { label: 'Exercise', checked: false },
    { label: 'Deep breathing', checked: false },
    { label: 'Positive self-talk', checked: false },
    { label: 'Taking breaks', checked: false },
  ]);

  const [tradingGoals, setTradingGoals] = useState([
    { label: 'Consistent profitability', checked: false },
    { label: 'Financial freedom', checked: false },
    { label: 'Wealth accumulation', checked: false },
    { label: 'Personal growth', checked: false },
    { label: 'Mastering the markets', checked: false },
  ]);

  const [helpfulFeatures, setHelpfulFeatures] = useState([
    { label: 'Emotion tracking', checked: false },
    { label: 'Personalized insights', checked: false },
    { label: 'Progress tracking', checked: false },
    { label: 'Community support', checked: false },
    { label: 'Educational resources', checked: false },
  ]);

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
    dataConcerns: ''
  });

  useEffect(() => {
    const loadExistingData = async () => {
      try {
        console.log('Loading existing questionnaire data...');
        setIsLoading(true);
        setLoadError(null);

        const existingData = await QuestionnaireService.getQuestionnaireResponse();
        
        if (existingData) {
          console.log('Found existing questionnaire data:', existingData);
          setFormData(existingData);
        } else {
          console.log('No existing questionnaire data found');
        }
      } catch (error) {
        console.error('Error loading questionnaire data:', error);
        setLoadError('Failed to load questionnaire data. You can still fill out the form.');
        toast({
          title: "Loading Error",
          description: "Failed to load existing data, but you can still complete the questionnaire.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('Questionnaire loading timed out');
        setIsLoading(false);
        setLoadError('Loading timed out. Please refresh if needed.');
      }
    }, 10000);

    loadExistingData();

    return () => clearTimeout(timeoutId);
  }, [toast]);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit the questionnaire.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting questionnaire data:', formData);
      
      const success = await QuestionnaireService.saveQuestionnaireResponse(formData);
      
      if (success) {
        console.log('Questionnaire saved successfully, updating user profile');
        await updateUser({ hasCompletedQuestionnaire: true });
        
        toast({
          title: "Questionnaire Completed!",
          description: "Thank you for completing the questionnaire. You can now access the full application.",
        });
      } else {
        throw new Error('Failed to save questionnaire response');
      }
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error saving your responses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#171b22] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg mb-2">Loading Questionnaire...</div>
          <div className="text-gray-400 text-sm">Please wait while we prepare your questionnaire</div>
        </div>
      </div>
    );
  }

  // Show error state if there was a critical error
  if (loadError && !formData.name && currentStep === 1) {
    return (
      <div className="min-h-screen bg-[#171b22] flex items-center justify-center p-4">
        <Card className="bg-[#232833] border-gray-700 max-w-md">
          <CardHeader>
            <CardTitle className="text-white">Loading Error</CardTitle>
            <CardDescription className="text-gray-400">
              {loadError}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const updateFormData = (field: keyof QuestionnaireData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Enter your full name"
                className="bg-[#1c2027] border-gray-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-gray-300">Age Range *</Label>
              <RadioGroup 
                value={formData.age} 
                onValueChange={(value) => updateFormData('age', value)}
                className="grid grid-cols-2 gap-4"
              >
                {['18-25', '26-35', '36-45', '46-55', '56-65', '65+'].map((age) => (
                  <div key={age} className="flex items-center space-x-2">
                    <RadioGroupItem value={age} id={age} className="border-gray-600" />
                    <Label htmlFor={age} className="text-gray-300">{age}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Gender *</Label>
              <RadioGroup 
                value={formData.sex} 
                onValueChange={(value) => updateFormData('sex', value)}
                className="grid grid-cols-3 gap-4"
              >
                {['Male', 'Female', 'Other'].map((gender) => (
                  <div key={gender} className="flex items-center space-x-2">
                    <RadioGroupItem value={gender} id={gender} className="border-gray-600" />
                    <Label htmlFor={gender} className="text-gray-300">{gender}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="traderType" className="text-gray-300">What type of trader are you? *</Label>
              <RadioGroup
                value={formData.traderType}
                onValueChange={(value) => updateFormData('traderType', value)}
                className="grid grid-cols-2 gap-4"
              >
                {['Day Trader', 'Swing Trader', 'Position Trader', 'Investor'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={type} className="border-gray-600" />
                    <Label htmlFor={type} className="text-gray-300">{type}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience" className="text-gray-300">How long have you been trading? *</Label>
              <RadioGroup
                value={formData.experience}
                onValueChange={(value) => updateFormData('experience', value)}
                className="grid grid-cols-2 gap-4"
              >
                {['Less than 1 year', '1-3 years', '3-5 years', '5+ years'].map((exp) => (
                  <div key={exp} className="flex items-center space-x-2">
                    <RadioGroupItem value={exp} id={exp} className="border-gray-600" />
                    <Label htmlFor={exp} className="text-gray-300">{exp}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Which markets do you trade? *</Label>
              <div className="grid grid-cols-2 gap-4">
                {markets.map((market, index) => (
                  <div key={market.label} className="flex items-center space-x-2">
                    <Checkbox
                      id={`market-${index}`}
                      checked={market.checked}
                      onCheckedChange={(checked) => {
                        const newMarkets = [...markets];
                        newMarkets[index].checked = Boolean(checked);
                        setMarkets(newMarkets);

                        const selectedMarkets = newMarkets
                          .filter((m) => m.checked)
                          .map((m) => m.label);
                        updateFormData('markets', selectedMarkets);
                      }}
                      className="border-gray-600"
                    />
                    <Label htmlFor={`market-${index}`} className="text-gray-300">{market.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="portfolioSize" className="text-gray-300">What is your approximate portfolio size? *</Label>
              <RadioGroup
                value={formData.portfolioSize}
                onValueChange={(value) => updateFormData('portfolioSize', value)}
                className="grid grid-cols-2 gap-4"
              >
                {['Less than $1,000', '$1,000 - $10,000', '$10,000 - $50,000', '$50,000 - $100,000', '$100,000+'].map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <RadioGroupItem value={size} id={size} className="border-gray-600" />
                    <Label htmlFor={size} className="text-gray-300">{size}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emotionalImpact" className="text-gray-300">How much do emotions impact your trading decisions? *</Label>
              <Slider
                id="emotionalImpact"
                defaultValue={[formData.emotionalImpact]}
                max={10}
                step={1}
                onValueChange={(value) => updateFormData('emotionalImpact', value[0])}
                className="bg-[#1c2027]"
              />
              <p className="text-gray-400 text-sm text-center">
                (1 - Not at all, 10 - Very significantly)
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Which emotional challenges do you face? *</Label>
              <div className="grid grid-cols-2 gap-4">
                {emotionalChallenges.map((challenge, index) => (
                  <div key={challenge.label} className="flex items-center space-x-2">
                    <Checkbox
                      id={`challenge-${index}`}
                      checked={challenge.checked}
                      onCheckedChange={(checked) => {
                        const newChallenges = [...emotionalChallenges];
                        newChallenges[index].checked = Boolean(checked);
                        setEmotionalChallenges(newChallenges);

                        const selectedChallenges = newChallenges
                          .filter((c) => c.checked)
                          .map((c) => c.label);
                        updateFormData('emotionalChallenges', selectedChallenges);
                      }}
                      className="border-gray-600"
                    />
                    <Label htmlFor={`challenge-${index}`} className="text-gray-300">{challenge.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tradingStress" className="text-gray-300">How often do you feel stressed while trading? *</Label>
              <RadioGroup
                value={formData.tradingStress}
                onValueChange={(value) => updateFormData('tradingStress', value)}
                className="grid grid-cols-2 gap-4"
              >
                {['Never', 'Rarely', 'Sometimes', 'Often', 'Always'].map((stress) => (
                  <div key={stress} className="flex items-center space-x-2">
                    <RadioGroupItem value={stress} id={stress} className="border-gray-600" />
                    <Label htmlFor={stress} className="text-gray-300">{stress}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stopLossDecision" className="text-gray-300">How do you typically decide where to place stop losses? *</Label>
              <Textarea
                id="stopLossDecision"
                placeholder="Explain your process"
                value={formData.stopLossDecision}
                onChange={(e) => updateFormData('stopLossDecision', e.target.value)}
                className="bg-[#1c2027] border-gray-600 text-white resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentPlatforms" className="text-gray-300">Which trading platforms do you currently use? *</Label>
              <Input
                id="currentPlatforms"
                type="text"
                placeholder="List your platforms"
                value={formData.currentPlatforms}
                onChange={(e) => updateFormData('currentPlatforms', e.target.value)}
                className="bg-[#1c2027] border-gray-600 text-white"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="useJournaling" className="text-gray-300">Do you currently use a trading journal? *</Label>
              <RadioGroup
                value={formData.useJournaling}
                onValueChange={(value) => updateFormData('useJournaling', value)}
                className="grid grid-cols-2 gap-4"
              >
                {['Yes', 'No', 'Sometimes'].map((journal) => (
                  <div key={journal} className="flex items-center space-x-2">
                    <RadioGroupItem value={journal} id={journal} className="border-gray-600" />
                    <Label htmlFor={journal} className="text-gray-300">{journal}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Which emotion management techniques do you use? *</Label>
              <div className="grid grid-cols-2 gap-4">
                {emotionManagement.map((technique, index) => (
                  <div key={technique.label} className="flex items-center space-x-2">
                    <Checkbox
                      id={`technique-${index}`}
                      checked={technique.checked}
                      onCheckedChange={(checked) => {
                        const newTechniques = [...emotionManagement];
                        newTechniques[index].checked = Boolean(checked);
                        setEmotionManagement(newTechniques);

                        const selectedTechniques = newTechniques
                          .filter((t) => t.checked)
                          .map((t) => t.label);
                        updateFormData('emotionManagement', selectedTechniques);
                      }}
                      className="border-gray-600"
                    />
                    <Label htmlFor={`technique-${index}`} className="text-gray-300">{technique.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">What are your primary trading goals? *</Label>
              <div className="grid grid-cols-2 gap-4">
                {tradingGoals.map((goal, index) => (
                  <div key={goal.label} className="flex items-center space-x-2">
                    <Checkbox
                      id={`goal-${index}`}
                      checked={goal.checked}
                      onCheckedChange={(checked) => {
                        const newGoals = [...tradingGoals];
                        newGoals[index].checked = Boolean(checked);
                        setTradingGoals(newGoals);

                        const selectedGoals = newGoals
                          .filter((g) => g.checked)
                          .map((g) => g.label);
                        updateFormData('tradingGoals', selectedGoals);
                      }}
                      className="border-gray-600"
                    />
                    <Label htmlFor={`goal-${index}`} className="text-gray-300">{goal.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="successDefinition" className="text-gray-300">How do you define success in trading? *</Label>
              <Textarea
                id="successDefinition"
                placeholder="Explain what success means to you"
                value={formData.successDefinition}
                onChange={(e) => updateFormData('successDefinition', e.target.value)}
                className="bg-[#1c2027] border-gray-600 text-white resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Which features would you find most helpful in a trading psychology tool? *</Label>
              <div className="grid grid-cols-2 gap-4">
                {helpfulFeatures.map((feature, index) => (
                  <div key={feature.label} className="flex items-center space-x-2">
                    <Checkbox
                      id={`feature-${index}`}
                      checked={feature.checked}
                      onCheckedChange={(checked) => {
                        const newFeatures = [...helpfulFeatures];
                        newFeatures[index].checked = Boolean(checked);
                        setHelpfulFeatures(newFeatures);

                        const selectedFeatures = newFeatures
                          .filter((f) => f.checked)
                          .map((f) => f.label);
                        updateFormData('helpfulFeatures', selectedFeatures);
                      }}
                      className="border-gray-600"
                    />
                    <Label htmlFor={`feature-${index}`} className="text-gray-300">{feature.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="willingnessToPay" className="text-gray-300">How much would you be willing to pay for such a tool? *</Label>
              <Input
                id="willingnessToPay"
                type="text"
                placeholder="Enter amount"
                value={formData.willingnessToPay}
                onChange={(e) => updateFormData('willingnessToPay', e.target.value)}
                className="bg-[#1c2027] border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataConcerns" className="text-gray-300">Do you have any concerns about sharing your trading data? *</Label>
              <Textarea
                id="dataConcerns"
                placeholder="Explain your concerns"
                value={formData.dataConcerns}
                onChange={(e) => updateFormData('dataConcerns', e.target.value)}
                className="bg-[#1c2027] border-gray-600 text-white resize-none"
              />
            </div>
          </div>
        );

      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#171b22] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Trading Psychology Assessment</h1>
          <p className="text-gray-400">
            Help us understand your trading background and goals (Step {currentStep} of 6)
          </p>
        </div>

        {loadError && (
          <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded text-yellow-300 text-sm">
            {loadError}
          </div>
        )}

        <Card className="bg-[#232833] border-gray-700">
          <CardHeader>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStep()}

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < 6 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!formData.name.trim() && currentStep === 1}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.name.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
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
