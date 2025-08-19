import { supabase, UserRecord, GamePlay, SurveyResponses, WaitingRoomMessage } from './supabase';

export async function createUser(userData: Partial<UserRecord>) {
  console.log('DB: Attempting to create user in Supabase...');
  
  const now = new Date().toISOString();
  const user: Omit<UserRecord, 'id'> = {
    age: userData.age,
    gender: userData.gender,
    assigned_condition: (userData as any).assignedCondition || userData.assigned_condition,
    game_plays: userData.game_plays || 0,
    leaderboard_views: userData.leaderboard_views || 0,
    game_performance: userData.game_performance || {},
    survey_responses: userData.survey_responses,
    waiting_room_messages: userData.waiting_room_messages,
    created_at: now,
    updated_at: now,
  };

  console.log('DB: Attempting to insert user:', JSON.stringify(user, null, 2));
  
  const { data, error } = await supabase
    .from('users')
    .insert([user])
    .select()
    .single();

  if (error) {
    console.error('DB: Insert error:', error);
    throw error;
  }

  console.log('DB: Insert successful, ID:', data.id);
  return data.id;
}

export async function updateUser(userId: string, updateData: Partial<UserRecord> & { assignedCondition?: string }) {
  // Map camelCase to snake_case for Supabase
  const mappedData: any = {};
  
  Object.keys(updateData).forEach(key => {
    if (key === 'assignedCondition') {
      mappedData.assigned_condition = (updateData as any)[key];
    } else {
      mappedData[key] = (updateData as any)[key];
    }
  });

  const { data, error } = await supabase
    .from('users')
    .update({
      ...mappedData,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function incrementLeaderboardViews(userId: string) {
  const { data, error } = await supabase.rpc('increment_leaderboard_views', {
    user_id: userId
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function addGamePlay(userId: string, gamePlay: GamePlay) {
  // First get current user to determine play number
  const user = await getUser(userId);
  const playNumber = (user?.game_plays || 0) + 1;
  
  const updatedGamePerformance = {
    ...user.game_performance,
    [`play${playNumber}`]: gamePlay
  };

  const { data, error } = await supabase
    .from('users')
    .update({
      game_plays: playNumber,
      game_performance: updatedGamePerformance,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateSurveyResponses(userId: string, responses: SurveyResponses) {
  const { data, error } = await supabase
    .from('users')
    .update({
      survey_responses: responses,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateWaitingRoomMessages(userId: string, messages: WaitingRoomMessage[]) {
  const { data, error } = await supabase
    .from('users')
    .update({
      waiting_room_messages: messages,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select();

  if (error) {
    throw error;
  }

  return data;
}