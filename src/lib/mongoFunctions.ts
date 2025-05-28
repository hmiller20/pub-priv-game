// this file contains the functions that interact with the database
// it is used by the API routes to create, update, and get users
// you can think of this file like a "factory" 
// that creates "tools" (functions) using "instructions" (types)
// for "workers" (API routes, components, etc.) to import and use

import { ObjectId } from 'mongodb';
import clientPromise from './mongoConnection'; // this establishes the connection to the database
import { UserDocument, SurveyResponses, GamePlay } from '@/types/mongodb';
import { WaitingRoomMessage } from "@/types/mongodb";

if (!process.env.MONGODB_DATABASE_NAME) {
  throw new Error('Please add MONGODB_DATABASE_NAME to .env.local');
}

if (!process.env.MONGODB_COLLECTION_NAME) {
  throw new Error('Please add MONGODB_COLLECTION_NAME to .env.local');
}

const DATABASE_NAME = process.env.MONGODB_DATABASE_NAME;
const COLLECTION_NAME = process.env.MONGODB_COLLECTION_NAME;

export async function updateWaitingRoomMessages(
  userId: string,
  newMessages: WaitingRoomMessage[]
) {
  const client = await clientPromise;
  const collection = client.db(DATABASE_NAME).collection(COLLECTION_NAME);
  await collection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { waitingRoomMessages: newMessages } },
    { upsert: false }
  );
}

export async function createUser(userData: Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt'>) {
  console.log('DB: Attempting to connect to MongoDB...');
  const client = await clientPromise;
  console.log('DB: Connected successfully');
  
  console.log('DB: Getting database:', DATABASE_NAME);
  const db = client.db(DATABASE_NAME);
  console.log('DB: Getting collection:', COLLECTION_NAME);
  const collection = db.collection(COLLECTION_NAME);
  
  const now = new Date();
  const user: Omit<UserDocument, '_id'> = {
    ...userData,
    createdAt: now,
    updatedAt: now,
  };

  console.log('DB: Attempting to insert user:', JSON.stringify(user, null, 2));
  const result = await collection.insertOne(user);
  console.log('DB: Insert successful, ID:', result.insertedId.toString());
  
  return result.insertedId;
}

export async function updateUser(userId: string, updateData: Partial<UserDocument>) {
  const client = await clientPromise;
  const collection = client.db(DATABASE_NAME).collection(COLLECTION_NAME);
  
  const result = await collection.updateOne(
    { _id: new ObjectId(userId) },
    { 
      $set: { 
        ...updateData,
        updatedAt: new Date()
      }
    }
  );
  
  return result;
}

export async function getUser(userId: string) {
  const client = await clientPromise;
  const collection = client.db(DATABASE_NAME).collection(COLLECTION_NAME);
  
  const user = await collection.findOne({ _id: new ObjectId(userId) });
  return user;
}

export async function incrementLeaderboardViews(userId: string) {
  const client = await clientPromise;
  const collection = client.db(DATABASE_NAME).collection(COLLECTION_NAME);
  
  const result = await collection.updateOne(
    { _id: new ObjectId(userId) },
    { 
      $inc: { leaderboardViews: 1 },
      $set: { updatedAt: new Date() }
    }
  );
  
  return result;
}

// this function increments gamePlays
export async function addGamePlay(userId: string, gamePlay: GamePlay) {
  const client = await clientPromise;
  const collection = client.db(DATABASE_NAME).collection(COLLECTION_NAME);
  
  const user = await collection.findOne({ _id: new ObjectId(userId) });
  const playNumber = (user?.gamePlays || 0) + 1;
  
  const update = {
    $inc: { gamePlays: 1 },
    $set: {
      updatedAt: new Date(),
      [`gamePerformance.play${playNumber}`]: gamePlay
    }
  };
  
  const result = await collection.updateOne(
    { _id: new ObjectId(userId) },
    update
  );
  
  return result;
}

export async function updateSurveyResponses(userId: string, responses: SurveyResponses) {
  const client = await clientPromise;
  const collection = client.db(DATABASE_NAME).collection(COLLECTION_NAME);
  
  const result = await collection.updateOne(
    { _id: new ObjectId(userId) },
    { 
      $set: { 
        surveyResponses: responses,
        updatedAt: new Date()
      }
    }
  );
  
  return result;
} 