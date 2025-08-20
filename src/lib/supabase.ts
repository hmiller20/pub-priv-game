import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types for Supabase
export interface Participant {
  id: string;
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not' | 'other';
  condition?: string;
  gameplays: number;
  createdat: string;
}

export interface GameData {
  id: number;
  participant_id: string;
  trial: number;
  score: number;
  skips: number;
  duration: number;
  questions_answered: number;
  completedat?: string;
  created_at: string;
}

export interface GamesPlayed {
  id: number;
  participant_id: string;
  trial: number;
  started_at: string;
}

export interface SurveyResponses {
  participant_id: string;
  mastery1?: number;
  mastery2?: number;
  mastery3?: number;
  mastery4?: number;
  mastery5?: number;
  mastery6?: number;
  mastery7?: number;
  mastery8?: number;
  public1?: number;
  public2?: number;
  public3?: number;
  public4?: number;
  public5?: number;
  public6?: number;
  public7?: number;
  attn_3?: number;
  manip_check?: number;
  suspicion?: string;
  created_at: string;
}

// Legacy interfaces for backward compatibility
export interface GamePlay {
  score: number;
  skips: number;
  duration: number;
  questions_answered: number;
  completedAt: string;
}

export interface UserRecord {
  id: string;
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not' | 'other';
  condition?: string;
  gameplays: number;
  createdat: string;
}

export interface WaitingRoomMessage {
  name: string;
  role: "user" | "system";
  message: string;
  timestamp: string;
}