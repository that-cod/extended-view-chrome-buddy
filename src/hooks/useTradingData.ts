
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tradingAPI } from '@/services/api';
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
      console.log('Fetching trading data from API...');
      const response = await tradingAPI.getTrades();
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch trading data');
      }
      
      console.log('Raw API response:', response.data);
      const processedData = processTradeData(response.data || []);
      console.log('Processed trading data:', processedData);
      
      return processedData;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
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
