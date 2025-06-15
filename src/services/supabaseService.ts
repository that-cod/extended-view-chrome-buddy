
import { supabase } from '@/integrations/supabase/client';
import { ProcessedTrade } from '@/utils/csvProcessor';

export interface UploadedStatement {
  id: string;
  user_id: string;
  filename: string;
  file_size: number;
  file_type: string;
  upload_date: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
}

export interface Trade {
  id: string;
  user_id: string;
  statement_id?: string;
  trade_date: string;
  symbol: string;
  action: 'buy' | 'sell';
  volume: number;
  price: number;
  profit: number;
  emotion?: string;
  confidence?: number;
  notes?: string;
}

export interface TradingAnalysis {
  id: string;
  user_id: string;
  statement_id?: string;
  analysis_type: string;
  analysis_data: any;
}

export class SupabaseService {
  static async createUploadedStatement(
    filename: string,
    fileSize: number,
    fileType: string
  ): Promise<UploadedStatement | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('uploaded_statements')
        .insert({
          user_id: user.id,
          filename,
          file_size: fileSize,
          file_type: fileType,
          processing_status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating uploaded statement:', error);
        throw error;
      }

      return data as UploadedStatement;
    } catch (error) {
      console.error('Error in createUploadedStatement:', error);
      return null;
    }
  }

  static async updateStatementStatus(
    statementId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    errorMessage?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('uploaded_statements')
        .update({
          processing_status: status,
          error_message: errorMessage
        })
        .eq('id', statementId);

      if (error) {
        console.error('Error updating statement status:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in updateStatementStatus:', error);
      return false;
    }
  }

  static async insertTrades(trades: ProcessedTrade[], statementId?: string): Promise<Trade[] | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const tradesData = trades.map(trade => ({
        user_id: user.id,
        statement_id: statementId,
        trade_date: trade.date,
        symbol: trade.symbol,
        action: trade.action,
        volume: trade.volume,
        price: trade.price,
        profit: trade.profit,
        emotion: trade.emotion,
        confidence: trade.confidence
      }));

      const { data, error } = await supabase
        .from('trades')
        .insert(tradesData)
        .select();

      if (error) {
        console.error('Error inserting trades:', error);
        throw error;
      }

      return data as Trade[];
    } catch (error) {
      console.error('Error in insertTrades:', error);
      return null;
    }
  }

  static async getTrades(): Promise<Trade[] | null> {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('trade_date', { ascending: false });

      if (error) {
        console.error('Error fetching trades:', error);
        throw error;
      }

      return data as Trade[];
    } catch (error) {
      console.error('Error in getTrades:', error);
      return null;
    }
  }

  static async getUploadedStatements(): Promise<UploadedStatement[] | null> {
    try {
      const { data, error } = await supabase
        .from('uploaded_statements')
        .select('*')
        .order('upload_date', { ascending: false });

      if (error) {
        console.error('Error fetching uploaded statements:', error);
        throw error;
      }

      return data as UploadedStatement[];
    } catch (error) {
      console.error('Error in getUploadedStatements:', error);
      return null;
    }
  }

  static async saveAnalysis(
    analysisType: string,
    analysisData: any,
    statementId?: string
  ): Promise<TradingAnalysis | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('trading_analysis')
        .insert({
          user_id: user.id,
          statement_id: statementId,
          analysis_type: analysisType,
          analysis_data: analysisData
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving analysis:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in saveAnalysis:', error);
      return null;
    }
  }

  static async exportData(format: 'json' | 'csv' = 'json'): Promise<string | null> {
    try {
      const trades = await this.getTrades();
      if (!trades) return null;

      if (format === 'json') {
        return JSON.stringify(trades, null, 2);
      } else {
        // CSV export
        if (trades.length === 0) return '';
        
        const headers = Object.keys(trades[0]).join(',');
        const rows = trades.map(trade => 
          Object.values(trade).map(value => 
            typeof value === 'string' && value.includes(',') ? `"${value}"` : value
          ).join(',')
        );
        
        return [headers, ...rows].join('\n');
      }
    } catch (error) {
      console.error('Error in exportData:', error);
      return null;
    }
  }
}
