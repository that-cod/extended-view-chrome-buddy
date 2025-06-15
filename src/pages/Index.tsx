
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

// Sample data for charts
const emotionalData = [
  { date: '2024-01-01', emotional: 67, fomo: 34, confidence: 78 },
  { date: '2024-01-02', emotional: 72, fomo: 28, confidence: 82 },
  { date: '2024-01-03', emotional: 65, fomo: 45, confidence: 65 },
  { date: '2024-01-04', emotional: 78, fomo: 22, confidence: 88 },
  { date: '2024-01-05', emotional: 69, fomo: 38, confidence: 75 },
];

const biasData = [
  { name: 'FOMO', value: 30, color: '#ef4444' },
  { name: 'Overconfidence', value: 25, color: '#f97316' },
  { name: 'Panic Selling', value: 20, color: '#eab308' },
  { name: 'Anchoring', value: 15, color: '#22c55e' },
  { name: 'Confirmation Bias', value: 10, color: '#3b82f6' },
];

const Index = () => {
  const navigate = useNavigate();

  const handleGetStrategy = () => {
    console.log('Get Personalized Strategy clicked');
    // This would trigger AI analysis in a real implementation
    alert('AI strategy analysis would be generated here');
  };

  const handleEmotionalTag = (tag: string) => {
    console.log(`Emotional tag clicked: ${tag}`);
    navigate('/journal');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-2">Today's Emotional State</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#232833] rounded-lg p-5 shadow flex flex-col items-center justify-center">
          <span className="text-gray-300">Emotional Balance</span>
          <div className="text-3xl font-bold">67<span className="text-base font-normal text-gray-400">/100</span></div>
          <span className="text-green-400 text-sm mt-1">↑ 0.56% From Yesterday</span>
        </div>
        <div className="bg-[#232833] rounded-lg p-5 shadow flex flex-col items-center justify-center">
          <span className="text-gray-300">FOMO Risk</span>
          <div className="text-3xl font-bold">34<span className="text-base font-normal text-gray-400">/100</span></div>
          <span className="text-red-400 text-sm mt-1">↓ 0.56% From Yesterday</span>
        </div>
        <div className="bg-[#232833] rounded-lg p-5 shadow flex flex-col items-center justify-center">
          <span className="text-gray-300">Decision Conf.</span>
          <div className="text-3xl font-bold">78<span className="text-base font-normal text-gray-400">/100</span></div>
          <span className="text-green-400 text-sm mt-1">↑ 2.1% From Yesterday</span>
        </div>
      </div>

      {/* Charts and Emotional Tagging */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="col-span-2 bg-[#232833] rounded-lg p-5 shadow">
          <h2 className="text-lg font-bold mb-3">Emotional State Progress</h2>
          <ChartContainer
            config={{
              emotional: { label: "Emotional Balance", color: "#22c55e" },
              fomo: { label: "FOMO Risk", color: "#ef4444" },
              confidence: { label: "Decision Confidence", color: "#3b82f6" }
            }}
            className="h-[200px]"
          >
            <LineChart data={emotionalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="emotional" stroke="#22c55e" strokeWidth={2} />
              <Line type="monotone" dataKey="fomo" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="confidence" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ChartContainer>
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
          <h2 className="text-lg font-bold mb-2">Daily Summary</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-200">
              <thead>
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Trades</th>
                  <th className="p-2 text-left">Lots</th>
                  <th className="p-2 text-left">Results</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-800">
                  <td className="p-2">08/10/2025</td>
                  <td className="p-2">3</td>
                  <td className="p-2">2.23</td>
                  <td className="p-2 text-green-400">+6.36%</td>
                </tr>
                <tr className="border-t border-gray-800">
                  <td className="p-2">09/10/2025</td>
                  <td className="p-2">4</td>
                  <td className="p-2">2.13</td>
                  <td className="p-2 text-red-400">-2.14%</td>
                </tr>
                <tr className="border-t border-gray-800">
                  <td className="p-2">10/10/2025</td>
                  <td className="p-2">5</td>
                  <td className="p-2">4.70</td>
                  <td className="p-2 text-green-400">+8.92%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-[#232833] rounded-lg p-5 shadow flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-4">Bias Breakdown</h2>
            <ChartContainer
              config={{
                bias: { label: "Bias Distribution" }
              }}
              className="h-[150px]"
            >
              <PieChart>
                <Pie
                  data={biasData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  dataKey="value"
                >
                  {biasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="mt-2 space-y-1">
              {biasData.map((bias) => (
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
            You overtrade by <span className="text-red-400">45%</span> on days following losses, typically with higher risk positions.
          </div>
          <Button 
            onClick={handleGetStrategy}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
          >
            Get Personalized Strategy
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
