import mongoose from 'mongoose';
import { env } from '../utils/env.js';

export const initMongoConnection = () => {
  const user = env('MONGODB_USER');
  const passsword = env('MONGODB_PASSWORD');
  const url = env('MONGODB_URL');
  const db = env('MONGODB_DB');

  const connectionLink = `mongodb+srv://${user}:${passsword}@${url}/${db}?retryWrites=true&w=majority&appName=Cluster0`;

  try {
    mongoose.connect(connectionLink);
    console.log('Mongo connection successfully established!');
  } catch (error) {
    console.log(error);
  }
};
