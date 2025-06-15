
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { User, TrendingUp, Brain, Target } from 'lucide-react';

const Profile = () => {
  const [questionnaireComplete, setQuestionnaireComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const questions = [
    {
      id: 1,
      question: "How long have you been trading?",
      options: ["Less than 6 months", "6 months - 2 years", "2-5 years", "5+ years"],
      category: "experience"
    },
    {
      id: 2,
      question: "What triggers you to make emotional trading decisions?",
      options: ["Fear of missing out (FOMO)", "Recent losses", "Market volatility", "News events"],
      category: "emotional_triggers"
    },
    {
      id: 3,
      question: "How do you typically react to losing trades?",
      options: ["Immediately try to recover losses", "Take a break", "Analyze what went wrong", "Reduce position size"],
      category: "loss_reaction"
    },
    {
      id: 4,
      question: "What's your risk tolerance level?",
      options: ["Very Conservative", "Conservative", "Moderate", "Aggressive"],
      category: "risk_tolerance"
    },
    {
      id: 5,
      question: "Which assets do you prefer trading?",
      options: ["Forex", "Stocks", "Crypto", "Commodities"],
      category: "preferred_assets"
    }
  ];

  const [answers, setAnswers] = useState<Record<number, string>>({});

  const psychologicalProfile = {
    riskTolerance: 75,
    emotionalControl: 60,
    disciplineScore: 85,
    fomoProneness: 40,
    overconfidenceLevel: 55,
    patternRecognition: 70
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuestionnaireComplete(true);
      console.log('Questionnaire completed:', answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreDescription = (score: number) => {
    if (score >= 70) return "Good";
    if (score >= 50) return "Moderate";
    return "Needs Improvement";
  };

  if (!questionnaireComplete) {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const question = questions[currentQuestion];

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Psychological Profile Setup</h1>
          <p className="text-gray-400">Help us understand your trading psychology</p>
        </div>

        <Card className="bg-[#232833] border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-white">Question {currentQuestion + 1} of {questions.length}</CardTitle>
              <Badge variant="outline">{Math.round(progress)}% Complete</Badge>
            </div>
            <Progress value={progress} className="mb-4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <h2 className="text-xl font-medium text-white mb-6">{question.question}</h2>
            
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(question.id, option)}
                  className={`w-full p-4 text-left rounded-lg border transition-colors ${
                    answers[question.id] === option
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-[#1c2027] border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-6">
              <Button 
                onClick={handlePrevious} 
                disabled={currentQuestion === 0}
                variant="outline"
              >
                Previous
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!answers[question.id]}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
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
                  <span className="text-white">{answers[1] || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Tolerance:</span>
                  <span className="text-white">{answers[4] || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Preferred Assets:</span>
                  <span className="text-white">{answers[5] || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Main Trigger:</span>
                  <span className="text-white">{answers[2] || 'Not specified'}</span>
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
              <Brain className="h-5 w-5 mr-2" />
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
              <Target className="h-5 w-5 mr-2" />
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
            <TrendingUp className="h-5 w-5 mr-2" />
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
          onClick={() => setQuestionnaireComplete(false)}
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
  );
};

export default Profile;
