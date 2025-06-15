
import { supabase } from '@/integrations/supabase/client';

export interface QuestionnaireData {
  name: string;
  age: string;
  sex: string;
  traderType: string;
  experience: string;
  markets: string[];
  portfolioSize: string;
  emotionalImpact: number;
  emotionalChallenges: string[];
  tradingStress: string;
  stopLossDecision: string;
  currentPlatforms: string;
  useJournaling: string;
  emotionManagement: string[];
  tradingGoals: string[];
  successDefinition: string;
  helpfulFeatures: string[];
  willingnessToPay: string;
  dataConcerns: string;
}

export class QuestionnaireService {
  static async saveQuestionnaireResponse(data: QuestionnaireData): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        return false;
      }

      console.log('Saving questionnaire response for user:', user.id);

      const { error } = await supabase
        .from('questionnaire_responses')
        .upsert({
          user_id: user.id,
          name: data.name,
          age: data.age,
          sex: data.sex,
          trader_type: data.traderType,
          experience: data.experience,
          markets: data.markets,
          portfolio_size: data.portfolioSize,
          emotional_impact: data.emotionalImpact,
          emotional_challenges: data.emotionalChallenges,
          trading_stress: data.tradingStress,
          stop_loss_decision: data.stopLossDecision,
          current_platforms: data.currentPlatforms,
          use_journaling: data.useJournaling,
          emotion_management: data.emotionManagement,
          trading_goals: data.tradingGoals,
          success_definition: data.successDefinition,
          helpful_features: data.helpfulFeatures,
          willingness_to_pay: data.willingnessToPay,
          data_concerns: data.dataConcerns
        });

      if (error) {
        console.error('Error saving questionnaire response:', error);
        return false;
      }

      console.log('Questionnaire response saved successfully');
      return true;
    } catch (error) {
      console.error('Error in saveQuestionnaireResponse:', error);
      return false;
    }
  }

  static async getQuestionnaireResponse(): Promise<QuestionnaireData | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        return null;
      }

      const { data, error } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching questionnaire response:', error);
        return null;
      }

      if (!data) {
        console.log('No questionnaire response found for user');
        return null;
      }

      return {
        name: data.name || '',
        age: data.age || '',
        sex: data.sex || '',
        traderType: data.trader_type || '',
        experience: data.experience || '',
        markets: data.markets || [],
        portfolioSize: data.portfolio_size || '',
        emotionalImpact: data.emotional_impact || 5,
        emotionalChallenges: data.emotional_challenges || [],
        tradingStress: data.trading_stress || '',
        stopLossDecision: data.stop_loss_decision || '',
        currentPlatforms: data.current_platforms || '',
        useJournaling: data.use_journaling || '',
        emotionManagement: data.emotion_management || [],
        tradingGoals: data.trading_goals || [],
        successDefinition: data.success_definition || '',
        helpfulFeatures: data.helpful_features || [],
        willingnessToPay: data.willingness_to_pay || '',
        dataConcerns: data.data_concerns || ''
      };
    } catch (error) {
      console.error('Error in getQuestionnaireResponse:', error);
      return null;
    }
  }
}
