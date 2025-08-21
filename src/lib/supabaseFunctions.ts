import { supabase, UserRecord, GamePlay, SurveyResponses, WaitingRoomMessage, Participant, GameData, GamesPlayed } from './supabase';

// Legacy function for backward compatibility
export async function createUser(userData: Partial<UserRecord>) {
  console.log('DB: Attempting to create user in Supabase...');
  
  const now = new Date().toISOString();
  const user: Omit<UserRecord, 'id'> = {
    age: userData.age,
    gender: userData.gender,
    condition: (userData as any).assignedCondition || userData.condition,
    gameplays: userData.gameplays || 0,
    createdat: now,
  };

  console.log('DB: Attempting to insert user:', JSON.stringify(user, null, 2));
  
  const { data, error } = await supabase
    .from('participants')
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

// New normalized schema functions
export async function createParticipant(participantData: Partial<Participant>) {
  console.log('DB: Attempting to create participant in Supabase...');
  
  const participant: Omit<Participant, 'id' | 'createdat'> = {
    age: participantData.age,
    gender: participantData.gender,
    condition: participantData.condition,
    gameplays: participantData.gameplays || 0,
  };

  console.log('DB: Attempting to insert participant:', JSON.stringify(participant, null, 2));
  
  const { data, error } = await supabase
    .from('participants')
    .insert([participant])
    .select()
    .single();

  if (error) {
    console.error('DB: Insert error:', error);
    throw error;
  }

  console.log('DB: Insert successful, ID:', data.id);
  return data.id;
}

export async function addGameData(gameData: Omit<GameData, 'id' | 'created_at'>) {
  console.log('DB: Attempting to add game data...');
  
  const { data, error } = await supabase
    .from('gamedata')
    .insert([gameData])
    .select()
    .single();

  if (error) {
    console.error('DB: Insert error:', error);
    throw error;
  }

  console.log('DB: Game data insert successful, ID:', data.id);
  return data;
}

export async function addGamePlayed(gamePlayedData: Omit<GamesPlayed, 'id' | 'started_at'>) {
  console.log('DB: Attempting to add games played record...');
  
  const { data, error } = await supabase
    .from('gamesplayed')
    .insert([gamePlayedData])
    .select()
    .single();

  if (error) {
    console.error('DB: Insert error:', error);
    throw error;
  }

  console.log('DB: Games played insert successful, ID:', data.id);
  return data;
}

export async function getParticipantGameCount(participantId: string) {
  const { data, error } = await supabase
    .from('gamesplayed')
    .select('trial')
    .eq('participant_id', participantId)
    .order('trial', { ascending: false })
    .limit(1);

  if (error) {
    console.error('DB: Error getting game count:', error);
    return 0;
  }

  return data && data.length > 0 ? data[0].trial : 0;
}

export async function startGameSession(participantId: string) {
  console.log('DB: Starting new game session...');
  
  // Get the current highest trial number for this participant
  const currentTrialCount = await getParticipantGameCount(participantId);
  const nextTrial = currentTrialCount + 1;
  
  const gamePlayedData = {
    participant_id: participantId,
    trial: nextTrial
  };

  return await addGamePlayed(gamePlayedData);
}

export async function getParticipant(participantId: string) {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('id', participantId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateParticipant(participantId: string, updateData: Partial<Participant>) {
  const { data, error } = await supabase
    .from('participants')
    .update(updateData)
    .eq('id', participantId)
    .select();

  if (error) {
    throw error;
  }

  return data;
}

export async function addSurveyResponse(surveyData: Omit<SurveyResponses, 'created_at'>) {
  console.log('DB: Attempting to add survey response...');
  
  const { data, error } = await supabase
    .from('surveyresponses')
    .insert([surveyData])
    .select()
    .single();

  if (error) {
    console.error('DB: Insert error:', error);
    throw error;
  }

  console.log('DB: Survey response insert successful');
  return data;
}

export async function updateUser(userId: string, updateData: Partial<UserRecord> & { assignedCondition?: string }) {
  // Map camelCase to snake_case for Supabase
  const mappedData: any = {};
  
  Object.keys(updateData).forEach(key => {
    if (key === 'assignedCondition') {
      mappedData.condition = (updateData as any)[key];
    } else {
      mappedData[key] = (updateData as any)[key];
    }
  });

  const { data, error } = await supabase
    .from('participants')
    .update({
      ...mappedData,
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
    .from('participants')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Deprecated - leaderboard views no longer tracked
export async function incrementLeaderboardViews(userId: string) {
  console.log('incrementLeaderboardViews is deprecated - no longer tracking leaderboard views');
  return null;
}

// Legacy function - use addGameData instead for new schema
export async function addGamePlay(userId: string, gamePlay: GamePlay) {
  // First get current user to determine play number
  const user = await getUser(userId);
  const playNumber = (user?.gameplays || 0) + 1;
  
  // Update participant gameplays count
  await supabase
    .from('participants')
    .update({ gameplays: playNumber })
    .eq('id', userId);

  // Add to new gamedata table
  const gameData = {
    participant_id: userId,
    trial: playNumber,
    score: gamePlay.score,
    skips: gamePlay.skips,
    duration: gamePlay.duration,
    questions_answered: gamePlay.questions_answered,
    completedat: gamePlay.completedAt
  };

  return await addGameData(gameData);
}

// Legacy function - use addSurveyResponse instead for new schema
export async function updateSurveyResponses(userId: string, responses: any) {
  // Handle both legacy array format and new object format
  const surveyData = {
    participant_id: userId,
    // Handle mastery responses - check if it's an array or object
    mastery1: Array.isArray(responses.mastery) ? responses.mastery[0] : responses.mastery?.mastery1,
    mastery2: Array.isArray(responses.mastery) ? responses.mastery[1] : responses.mastery?.mastery2,
    mastery3: Array.isArray(responses.mastery) ? responses.mastery[2] : responses.mastery?.mastery3,
    mastery4: Array.isArray(responses.mastery) ? responses.mastery[3] : responses.mastery?.mastery4,
    mastery5: Array.isArray(responses.mastery) ? responses.mastery[4] : responses.mastery?.mastery5,
    mastery6: Array.isArray(responses.mastery) ? responses.mastery[5] : responses.mastery?.mastery6,
    mastery7: Array.isArray(responses.mastery) ? responses.mastery[6] : responses.mastery?.mastery7,
    mastery8: Array.isArray(responses.mastery) ? responses.mastery[7] : responses.mastery?.mastery8,
    // Handle public responses - check if it's an array or object
    public1: Array.isArray(responses.public) ? responses.public[0] : responses.public?.public1,
    public2: Array.isArray(responses.public) ? responses.public[1] : responses.public?.public2,
    public3: Array.isArray(responses.public) ? responses.public[2] : responses.public?.public3,
    public4: Array.isArray(responses.public) ? responses.public[3] : responses.public?.public4,
    public5: Array.isArray(responses.public) ? responses.public[4] : responses.public?.public5,
    public6: Array.isArray(responses.public) ? responses.public[5] : responses.public?.public6,
    public7: Array.isArray(responses.public) ? responses.public[6] : responses.public?.public7,
    // Handle attention check - can be from array or direct property
    attn_3: Array.isArray(responses.attention) ? responses.attention[0] : (responses.public?.attn_3 || responses.attn_3),
    // Handle manipulation check
    manip_check: responses.manipCheck || responses.public?.manipCheck,
    // Handle suspicion text response
    suspicion: responses.suspicion || responses.public?.suspicion
  };

  return await addSurveyResponse(surveyData);
}

// Deprecated - waiting room messages no longer stored
export async function updateWaitingRoomMessages(userId: string, messages: WaitingRoomMessage[]) {
  console.log('updateWaitingRoomMessages is deprecated - waiting room messages no longer stored');
  return null;
}