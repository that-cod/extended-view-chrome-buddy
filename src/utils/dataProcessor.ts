
import { Trade, TradingData } from '@/types/trading';

export const processTradeData = (rawTrades: any[]): TradingData => {
  const trades: Trade[] = rawTrades.map((trade, index) => ({
    id: trade.id || `trade-${index}`,
    date: trade.date || trade.timestamp || new Date().toISOString(),
    symbol: trade.symbol || trade.instrument || 'UNKNOWN',
    action: trade.action?.toLowerCase() === 'buy' ? 'buy' : 'sell',
    volume: parseFloat(trade.volume || trade.quantity || 0),
    price: parseFloat(trade.price || trade.open_price || 0),
    profit: parseFloat(trade.profit || trade.pnl || 0),
    emotion: trade.emotion || undefined,
    confidence: trade.confidence || Math.random() * 100, // Default if not provided
  }));

  const totalTrades = trades.length;
  const winningTrades = trades.filter(trade => trade.profit > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalProfit = trades.reduce((sum, trade) => sum + trade.profit, 0);
  
  // Calculate emotional metrics based on trading patterns
  const emotionalBalance = calculateEmotionalBalance(trades);
  const fomoRisk = calculateFOMORisk(trades);
  const decisionConfidence = calculateDecisionConfidence(trades);

  // Generate bias data
  const biasData = [
    { name: 'FOMO', value: Math.round(fomoRisk), color: '#ef4444' },
    { name: 'Overconfidence', value: 25, color: '#f97316' },
    { name: 'Panic Selling', value: 20, color: '#eab308' },
    { name: 'Anchoring', value: 15, color: '#22c55e' },
    { name: 'Confirmation Bias', value: 10, color: '#3b82f6' },
  ];

  // Generate emotional trend data (last 5 days)
  const emotionalData = generateEmotionalTrendData(trades);

  return {
    trades,
    summary: {
      totalTrades,
      winRate: Math.round(winRate),
      totalProfit,
      emotionalBalance: Math.round(emotionalBalance),
      fomoRisk: Math.round(fomoRisk),
      decisionConfidence: Math.round(decisionConfidence),
    },
    biasData,
    emotionalData,
  };
};

const calculateEmotionalBalance = (trades: Trade[]): number => {
  // Simple algorithm: based on profit consistency and trade frequency
  const profitability = trades.filter(t => t.profit > 0).length / trades.length;
  const consistency = calculateConsistency(trades);
  return (profitability * 0.6 + consistency * 0.4) * 100;
};

const calculateFOMORisk = (trades: Trade[]): number => {
  // FOMO risk based on rapid consecutive trades and large position sizes
  let fomoScore = 0;
  for (let i = 1; i < trades.length; i++) {
    const prevTrade = trades[i - 1];
    const currentTrade = trades[i];
    const timeDiff = new Date(currentTrade.date).getTime() - new Date(prevTrade.date).getTime();
    
    // If trades are within 30 minutes and volume increases
    if (timeDiff < 30 * 60 * 1000 && currentTrade.volume > prevTrade.volume) {
      fomoScore += 10;
    }
  }
  return Math.min(fomoScore, 100);
};

const calculateDecisionConfidence = (trades: Trade[]): number => {
  // Confidence based on win rate and average profit
  const winRate = trades.filter(t => t.profit > 0).length / trades.length;
  const avgProfit = trades.reduce((sum, t) => sum + Math.abs(t.profit), 0) / trades.length;
  return (winRate * 0.7 + Math.min(avgProfit / 100, 1) * 0.3) * 100;
};

const calculateConsistency = (trades: Trade[]): number => {
  if (trades.length < 2) return 1;
  
  const profits = trades.map(t => t.profit);
  const mean = profits.reduce((a, b) => a + b, 0) / profits.length;
  const variance = profits.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / profits.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Lower standard deviation means higher consistency
  return Math.max(0, 1 - standardDeviation / Math.abs(mean));
};

const generateEmotionalTrendData = (trades: Trade[]) => {
  const last5Days = [];
  const today = new Date();
  
  for (let i = 4; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTrades = trades.filter(trade => 
      trade.date.startsWith(dateStr)
    );
    
    const emotional = dayTrades.length > 0 ? 
      calculateEmotionalBalance(dayTrades) : 67;
    const fomo = dayTrades.length > 0 ? 
      calculateFOMORisk(dayTrades) : 34;
    const confidence = dayTrades.length > 0 ? 
      calculateDecisionConfidence(dayTrades) : 78;
    
    last5Days.push({
      date: dateStr,
      emotional: Math.round(emotional),
      fomo: Math.round(fomo), 
      confidence: Math.round(confidence),
    });
  }
  
  return last5Days;
};
