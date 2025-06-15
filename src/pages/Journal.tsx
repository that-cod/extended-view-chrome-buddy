
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  time: string;
  symbol: string;
  action: 'buy' | 'sell';
  beforeFeeling: string;
  afterFeeling: string;
  followedPlan: boolean;
  notes: string;
  tags: string[];
}

const Journal = () => {
  const [entries] = useState<JournalEntry[]>([
    {
      id: '1',
      date: '2024-01-15',
      time: '09:30',
      symbol: 'EURUSD',
      action: 'buy',
      beforeFeeling: 'Confident about the setup, saw clear support level',
      afterFeeling: 'Satisfied with entry, but got nervous during drawdown',
      followedPlan: true,
      notes: 'Good entry point, but should have trusted the analysis more during temporary drawdown',
      tags: ['Confident', 'Nervous', 'Support-Level']
    },
    {
      id: '2',
      date: '2024-01-15',
      time: '14:20',
      symbol: 'GBPJPY',
      action: 'sell',
      beforeFeeling: 'FOMO - saw big move starting without me',
      afterFeeling: 'Regret - entered too late and got stopped out',
      followedPlan: false,
      notes: 'Classic FOMO trade. Should have waited for proper setup instead of chasing',
      tags: ['FOMO', 'Regret', 'Chasing']
    }
  ]);

  const [newEntry, setNewEntry] = useState({
    symbol: '',
    action: 'buy' as 'buy' | 'sell',
    beforeFeeling: '',
    afterFeeling: '',
    followedPlan: true,
    notes: '',
    tags: [] as string[]
  });

  const emotionalTags = [
    'Confident', 'Fearful', 'Cautious', 'FOMO', 'Patient', 'Excited', 
    'Greedy', 'Focused', 'Anxious', 'Regret', 'Satisfied', 'Nervous'
  ];

  const handleTagToggle = (tag: string) => {
    setNewEntry(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New journal entry:', newEntry);
    // Here you would save the entry
    alert('Journal entry saved successfully!');
    
    // Reset form
    setNewEntry({
      symbol: '',
      action: 'buy',
      beforeFeeling: '',
      afterFeeling: '',
      followedPlan: true,
      notes: '',
      tags: []
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Trading Journal</h1>
        <p className="text-gray-400">Track your emotions and thoughts for every trade</p>
      </div>

      {/* New Entry Form */}
      <Card className="bg-[#232833] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">New Journal Entry</CardTitle>
          <CardDescription className="text-gray-400">
            Record your feelings and thoughts about this trade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
                <input
                  type="text"
                  value={newEntry.symbol}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, symbol: e.target.value }))}
                  placeholder="e.g., EURUSD, AAPL"
                  className="w-full px-3 py-2 bg-[#1c2027] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Action</label>
                <select
                  value={newEntry.action}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, action: e.target.value as 'buy' | 'sell' }))}
                  className="w-full px-3 py-2 bg-[#1c2027] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">How did you feel BEFORE this trade?</label>
              <Textarea
                value={newEntry.beforeFeeling}
                onChange={(e) => setNewEntry(prev => ({ ...prev, beforeFeeling: e.target.value }))}
                placeholder="Describe your emotional state and confidence level before entering..."
                className="bg-[#1c2027] border-gray-600 text-white"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">How do you feel AFTER this trade?</label>
              <Textarea
                value={newEntry.afterFeeling}
                onChange={(e) => setNewEntry(prev => ({ ...prev, afterFeeling: e.target.value }))}
                placeholder="Describe how the trade outcome made you feel..."
                className="bg-[#1c2027] border-gray-600 text-white"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Did you follow your trading plan?</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={newEntry.followedPlan === true}
                    onChange={() => setNewEntry(prev => ({ ...prev, followedPlan: true }))}
                    className="mr-2"
                  />
                  <span className="text-white">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={newEntry.followedPlan === false}
                    onChange={() => setNewEntry(prev => ({ ...prev, followedPlan: false }))}
                    className="mr-2"
                  />
                  <span className="text-white">No</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Additional Notes</label>
              <Textarea
                value={newEntry.notes}
                onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional thoughts, lessons learned, or reflections..."
                className="bg-[#1c2027] border-gray-600 text-white"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Emotional Tags</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {emotionalTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                      newEntry.tags.includes(tag)
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-[#1c2027] border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Save Journal Entry
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Previous Entries */}
      <Card className="bg-[#232833] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Entries</CardTitle>
          <CardDescription className="text-gray-400">
            Your trading journal history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-[#1c2027] rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{entry.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{entry.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.action === 'buy' ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                      <span className="font-medium text-white">{entry.symbol}</span>
                    </div>
                  </div>
                  <Badge variant={entry.followedPlan ? "default" : "destructive"}>
                    {entry.followedPlan ? "Plan Followed" : "Plan Deviated"}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div>
                    <span className="text-sm font-medium text-gray-300">Before: </span>
                    <span className="text-sm text-gray-400">{entry.beforeFeeling}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-300">After: </span>
                    <span className="text-sm text-gray-400">{entry.afterFeeling}</span>
                  </div>
                  {entry.notes && (
                    <div>
                      <span className="text-sm font-medium text-gray-300">Notes: </span>
                      <span className="text-sm text-gray-400">{entry.notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {entry.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Journal;
