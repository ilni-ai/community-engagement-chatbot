// config.js,  configuration file for the server
import dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    db: process.env.MONGO_URI || 'mongodb://localhost:27017/community-engagement-lab-db-v2',
  },
};

export default config[env];
