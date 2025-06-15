
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SupabaseService } from '@/services/supabaseService';
import { processTradeData } from '@/utils/dataProcessor';
import { TradingData } from '@/types/trading';

export const useTradingData = () => {
  const queryClient = useQueryClient();

  const {
    data: tradingData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['trading-data'],
    queryFn: async (): Promise<TradingData> => {
      console.log('Fetching trading data from Supabase...');
      const trades = await SupabaseService.getTrades();
      
      if (!trades) {
        throw new Error('Failed to fetch trading data');
      }
      
      console.log('Raw Supabase response:', trades);
      const processedData = processTradeData(trades);
      console.log('Processed trading data:', processedData);
      
      return processedData;
    },
    // REMOVE auto refetch and staleTime - now manual refresh only
    // refetchInterval: 5 * 60 * 1000, 
    // staleTime: 2 * 60 * 1000, 
  });

  const refreshData = () => {
    console.log('Manually refreshing trading data...');
    refetch();
  };

  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: ['trading-data'] });
  };

  return {
    tradingData,
    isLoading,
    error,
    refreshData,
    invalidateData,
  };
};

