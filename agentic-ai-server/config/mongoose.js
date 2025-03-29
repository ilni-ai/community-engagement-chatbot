// mongoose.js - configuration file that connects to MongoDB using Mongoose
import mongoose from 'mongoose';
import config from './config.js';

// Mongoose connection configuration
const configureMongoose = async () => {
  console.log(config.db);
  try {
    await mongoose.connect(config.db);
    console.log(`Connected to MongoDB at ${config.db}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the process with failure
  }
};

export default configureMongoose;
