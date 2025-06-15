
-- Create questionnaire_responses table to store user questionnaire data
CREATE TABLE public.questionnaire_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text,
  age text,
  sex text,
  trader_type text,
  experience text,
  markets text[], -- array of selected markets
  portfolio_size text,
  emotional_impact integer,
  emotional_challenges text[], -- array of selected challenges
  trading_stress text,
  stop_loss_decision text,
  current_platforms text,
  use_journaling text,
  emotion_management text[], -- array of selected management methods
  trading_goals text[], -- array of selected goals
  success_definition text,
  helpful_features text[], -- array of selected features
  willingness_to_pay text,
  data_concerns text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id) -- Each user can only have one questionnaire response
);

-- Enable RLS
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for questionnaire_responses
CREATE POLICY "Users can view their own questionnaire responses" ON public.questionnaire_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questionnaire responses" ON public.questionnaire_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questionnaire responses" ON public.questionnaire_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER questionnaire_responses_updated_at
  BEFORE UPDATE ON public.questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
