import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types for Supabase
export interface GamePlay {
  score: number;
  skips: number;
  duration: number;
  questions_answered: number;
  completedAt: string;
}

export interface SurveyResponses {
  mastery: number[];
  public: number[];
  attention: string[];
  manipCheck?: number;
}

export interface UserRecord {
  id: string;
  age?: number;
  gender?: 0 | 1 | 2 | 3 | 4;
  assigned_condition?: string;
  game_plays: number;
  leaderboard_views: number;
  game_performance: Record<string, GamePlay>;
  survey_responses?: SurveyResponses;
  waiting_room_messages?: WaitingRoomMessage[];
  created_at: string;
  updated_at: string;
}

export interface WaitingRoomMessage {
  name: string;
  role: "user" | "system";
  message: string;
  timestamp: string;
}