
import { ApiResponse, TradingData } from '@/types/trading';

const API_BASE_URL = 'https://server-production-2cd5d.up.railway.app';
const API_KEY = 'F3B9z2H0Yg8LmW7pXqT6s5nRd4KJc3vS1aQwZuIoPyExMhDtGkVfArCbNeUlSiOj';

class TradingAPI {
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        success: false, 
        data: null, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  async getTrades(): Promise<ApiResponse> {
    return this.makeRequest('/trades/getTrades');
  }

  async uploadTrades(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.makeRequest('/trades/upload', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
      },
      body: formData,
    });
  }
}

export const tradingAPI = new TradingAPI();
