// handles the actual connection to the database

import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
console.log('MongoDB: Using URI (redacted password):', uri.replace(/:[^@]*@/, ':****@'));

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  console.log('MongoDB: Setting up development connection');
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    console.log('MongoDB: Creating new client connection');
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect().then(client => {
      console.log('MongoDB: Successfully connected to database');
      return client;
    });
  } else {
    console.log('MongoDB: Reusing existing client connection');
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  console.log('MongoDB: Setting up production connection');
  client = new MongoClient(uri, options);
  clientPromise = client.connect().then(client => {
    console.log('MongoDB: Successfully connected to database');
    return client;
  });
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise; 