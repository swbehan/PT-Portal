import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
-> Feedback: Maybe include the purpose of 'dotenv' in the file for someone who has never used that import statement in ES6+ modules.
export const DB_NAME = 'pt-portal-db';
dotenv.config();
const DEFAULT_URI = process.env.MONGO_URI;
export const CLIENT = new MongoClient(DEFAULT_URI);
await CLIENT.connect();
export const connect = (collectionName) => {
  return CLIENT.db(DB_NAME).collection(collectionName);
};
