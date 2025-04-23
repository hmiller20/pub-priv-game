import { ObjectId } from 'mongodb';
import clientPromise from './mongodb';
import { UserDocument, SurveyResponses, GamePlay } from '@/types/mongodb';

const DATABASE_NAME = 'rat-game';
const COLLECTION_NAME = 'users';

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

export async function addGamePlay(userId: string, gamePlay: GamePlay) {
  const client = await clientPromise;
  const collection = client.db(DATABASE_NAME).collection(COLLECTION_NAME);
  
  const user = await collection.findOne({ _id: new ObjectId(userId) });
  const isSecondPlay = user?.gamePlays === 1;
  
  const update: any = {
    $inc: { gamePlays: 1 },
    $set: { updatedAt: new Date() }
  };
  
  if (isSecondPlay) {
    update.$set['gamePerformance.secondPlay'] = gamePlay;
  } else {
    update.$set['gamePerformance.firstPlay'] = gamePlay;
  }
  
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