import { ApiResponse, TradingData } from '@/types/trading';
import { SupabaseService } from './supabaseService';

class TradingAPI {
  async getTrades(): Promise<ApiResponse> {
    try {
      const trades = await SupabaseService.getTrades();
      return { success: true, data: trades };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        success: false, 
        data: null, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  async uploadTrades(file: File): Promise<ApiResponse> {
    // This method is now handled by the Upload component directly
    // but keeping for compatibility
    return { 
      success: false, 
      data: null, 
      message: 'Use SupabaseService for file uploads' 
    };
  }
}

export const tradingAPI = new TradingAPI();
