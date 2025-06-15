
export interface Trade {
  id: string;
  date: string;
  symbol: string;
  action: 'buy' | 'sell';
  volume: number;
  price: number;
  profit: number;
  emotion?: string;
  confidence?: number;
}

export interface TradingData {
  trades: Trade[];
  summary: {
    totalTrades: number;
    winRate: number;
    totalProfit: number;
    emotionalBalance: number;
    fomoRisk: number;
    decisionConfidence: number;
  };
  biasData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  emotionalData: Array<{
    date: string;
    emotional: number;
    fomo: number;
    confidence: number;
  }>;
}

export interface ApiResponse {
  success: boolean;
  data: any;
  message?: string;
}
