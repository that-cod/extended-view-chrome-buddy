
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTradingData } from '@/hooks/useTradingData';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tradingData, isLoading, error, refreshData } = useTradingData();

  const handleGetStrategy = () => {
    console.log('Get Personalized Strategy clicked');
    toast({
      title: "AI Strategy Analysis",
      description: "Generating your personalized trading strategy based on behavioral patterns...",
    });
  };

  const handleEmotionalTag = (tag: string) => {
    console.log(`Emotional tag clicked: ${tag}`);
    navigate('/journal');
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
    refreshData();
    toast({
      title: "Refreshing Data",
      description: "Fetching latest trading data...",
    });
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold mb-2">Today's Emotional State</h1>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        
        <div className="bg-[#232833] rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Trading Data</h3>
          <p className="text-gray-400 mb-4">
            {error instanceof Error ? error.message : 'Unable to connect to trading API'}
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-2">Today's Emotional State</h1>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#232833] rounded-lg p-5 shadow flex flex-col items-center justify-center">
          <span className="text-gray-300">Emotional Balance</span>
          {isLoading ? (
            <Skeleton className="h-10 w-20 bg-gray-700" />
          ) : (
            <div className="text-3xl font-bold">
              {tradingData?.summary.emotionalBalance || 67}
              <span className="text-base font-normal text-gray-400">/100</span>
            </div>
          )}
          <span className="text-green-400 text-sm mt-1">Live Data</span>
        </div>
        <div className="bg-[#232833] rounded-lg p-5 shadow flex flex-col items-center justify-center">
          <span className="text-gray-300">FOMO Risk</span>
          {isLoading ? (
            <Skeleton className="h-10 w-20 bg-gray-700" />
          ) : (
            <div className="text-3xl font-bold">
              {tradingData?.summary.fomoRisk || 34}
              <span className="text-base font-normal text-gray-400">/100</span>
            </div>
          )}
          <span className="text-red-400 text-sm mt-1">Live Data</span>
        </div>
        <div className="bg-[#232833] rounded-lg p-5 shadow flex flex-col items-center justify-center">
          <span className="text-gray-300">Decision Conf.</span>
          {isLoading ? (
            <Skeleton className="h-10 w-20 bg-gray-700" />
          ) : (
            <div className="text-3xl font-bold">
              {tradingData?.summary.decisionConfidence || 78}
              <span className="text-base font-normal text-gray-400">/100</span>
            </div>
          )}
          <span className="text-green-400 text-sm mt-1">Live Data</span>
        </div>
      </div>

      {/* Charts and Emotional Tagging */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="col-span-2 bg-[#232833] rounded-lg p-5 shadow">
          <h2 className="text-lg font-bold mb-3">Emotional State Progress</h2>
          {isLoading ? (
            <Skeleton className="h-[200px] bg-gray-700" />
          ) : (
            <ChartContainer
              config={{
                emotional: { label: "Emotional Balance", color: "#22c55e" },
                fomo: { label: "FOMO Risk", color: "#ef4444" },
                confidence: { label: "Decision Confidence", color: "#3b82f6" }
              }}
              className="h-[200px]"
            >
              <LineChart data={tradingData?.emotionalData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="emotional" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="fomo" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="confidence" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          )}
        </div>
        
        <div className="bg-[#232833] rounded-lg p-5 shadow h-full">
          <h2 className="text-lg font-bold mb-3">Emotional Tagging</h2>
          <div className="grid grid-cols-2 gap-2">
            {["Confident", "Fearful", "Cautious", "FOMO", "Patient", "Excited", "Greedy", "Focused", "Anxious"].map(tag => (
              <button
                key={tag}
                onClick={() => handleEmotionalTag(tag)}
                className="px-3 py-1 rounded-lg bg-[#1c2027] text-xs text-white text-center border border-gray-700 hover:border-gray-500 hover:bg-[#252a35] transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-[#232833] rounded-lg p-5 shadow">
          <h2 className="text-lg font-bold mb-2">Recent Trades Summary</h2>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-8 bg-gray-700" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-200">
                <thead>
                  <tr>
                    <th className="p-2 text-left">Symbol</th>
                    <th className="p-2 text-left">Action</th>
                    <th className="p-2 text-left">Volume</th>
                    <th className="p-2 text-left">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {tradingData?.trades.slice(0, 3).map((trade, index) => (
                    <tr key={trade.id} className="border-t border-gray-800">
                      <td className="p-2">{trade.symbol}</td>
                      <td className="p-2 capitalize">{trade.action}</td>
                      <td className="p-2">{trade.volume.toFixed(2)}</td>
                      <td className={`p-2 ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(2)}
                      </td>
                    </tr>
                  )) || (
                    <tr className="border-t border-gray-800">
                      <td colSpan={4} className="p-4 text-center text-gray-400">
                        No trading data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="bg-[#232833] rounded-lg p-5 shadow flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-4">Bias Breakdown</h2>
            {isLoading ? (
              <Skeleton className="h-[150px] bg-gray-700" />
            ) : (
              <ChartContainer
                config={{
                  bias: { label: "Bias Distribution" }
                }}
                className="h-[150px]"
              >
                <PieChart>
                  <Pie
                    data={tradingData?.biasData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                  >
                    {(tradingData?.biasData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            )}
            <div className="mt-2 space-y-1">
              {(tradingData?.biasData || []).map((bias) => (
                <div key={bias.name} className="flex justify-between text-sm">
                  <span className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded mr-2" 
                      style={{ backgroundColor: bias.color }}
                    ></div>
                    {bias.name}
                  </span>
                  <span>{bias.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            AI Insight:<br />
            {tradingData ? (
              <>
                Total trades: <span className="text-blue-400">{tradingData.summary.totalTrades}</span> with 
                <span className={`ml-1 ${tradingData.summary.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {tradingData.summary.winRate}%
                </span> win rate.
              </>
            ) : (
              'Loading behavioral analysis...'
            )}
          </div>
          <Button 
            onClick={handleGetStrategy}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
            disabled={isLoading}
          >
            Get Personalized Strategy
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
