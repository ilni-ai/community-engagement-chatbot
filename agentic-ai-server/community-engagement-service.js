// community-engagement-service.js - Entry point for the Agentic AI Server application
// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers.js';
import configureMongoose from './config/mongoose.js';

// Initialize Express application
const app = express();
const httpServer = http.createServer(app);

// Apply middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Start Apollo Server
const startServer = async () => {
  await configureMongoose(); // Connect to MongoDB
  await server.start();
  app.use('/graphql', expressMiddleware(server));
  httpServer.listen(5000, () => console.log('🚀 Server running on http://localhost:5000/graphql'));
};

// Start application
startServer();
