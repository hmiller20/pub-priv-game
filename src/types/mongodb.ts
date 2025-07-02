// this file defines the various fields in the document schema for the MongoDB database

import { ObjectId } from 'mongodb';

export interface GamePlay {
  score: number;
  skips: number;
  duration: number; // Duration in seconds
  questions_answered: number; // Track how many questions were submitted
  completedAt: Date;
}

export interface SurveyResponses {
  mastery: number[];  // Array of responses to mastery questions
  public: number[];   // Array of responses to public/private questions
  attention: string[]; // Array of responses to attention check questions
  manipCheck?: number; // Response to manipulation check question
} // what is the ? for manipCheck?

export interface UserDocument {
  _id?: ObjectId;
  age: number;
  gender: 0 | 1 | 2 | 3 | 4; // 0=male, 1=female, 2=non-binary, 3=prefer not to answer, 4=other
  assignedCondition: string;
  gamePlays: number;
  leaderboardViews: number;
  gamePerformance: {
    [key: `play${number}`]: GamePlay;
  };
  surveyResponses?: SurveyResponses;
  createdAt: Date;
  updatedAt: Date;
} 

export interface WaitingRoomMessage {
  name: string; // "Alex P."
  role: "user" | "system";
  message: string;
  timestamp: string; // ISO string
}