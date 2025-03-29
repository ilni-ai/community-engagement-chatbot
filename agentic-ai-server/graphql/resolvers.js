// resolvers.js - contains the GraphQL resolvers for the Agentic AI Server.
import dotenv from 'dotenv';
dotenv.config();

import UserInteraction from '../models/UserInteraction.js';
import CommunityPost from '../models/CommunityPost.js';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cosineSimilarity } from '../utils/cosineSimilarity.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-1.5-flash',
  maxOutputTokens: 2048,
});

// === EMBEDDING GENERATION ===
const generateEmbedding = async (text) => {
  try {
    const embeddingModel = genAI.getGenerativeModel({ model: 'embedding-001' });
    const response = await embeddingModel.embedContent({
      content: { parts: [{ text }] }
    });
    return response.embedding?.values;
  } catch (error) {
    console.error('Embedding error:', error.message);
    throw new Error('Failed to generate embedding');
  }
};

// === TOPIC TAGGING ===
const extractTopics = (text) => {
  const topics = [];
  if (/housing|rent|affordable/i.test(text)) topics.push("housing");
  if (/safety|crime|security/i.test(text)) topics.push("safety");
  if (/transit|commute|bus|subway|route/i.test(text)) topics.push("transportation");
  if (/funding|budget|money|grants/i.test(text)) topics.push("finance");
  if (/mental health|counseling|well-being/i.test(text)) topics.push("health");
  return topics;
};

// === RETRIEVAL ===
const retrieveData = async (query) => {
  const queryEmbedding = await generateEmbedding(query);
  const allPosts = await CommunityPost.find({ embedding: { $exists: true, $ne: [] } });

  const ranked = allPosts
    .map(post => ({
      post,
      similarity: cosineSimilarity(queryEmbedding, post.embedding),
    }))
    .filter(item => item.similarity >= 0.6) // threshold to reduce noise
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);

  return ranked.map(r => r.post.content);
};

// === FOLLOW-UP SUGGESTION LOGIC ===
const generateFollowUpQuestions = (query, aiResponse) => {
  const suggestions = [];

  if (/safety|crime|security/i.test(query) || /suspicious|concerns/.test(aiResponse)) {
    suggestions.push(
      "Would you like to see statistics on crime rates?",
      "Are there community-led initiatives addressing this?"
    );
  }

  if (/solutions|ideas|plans/i.test(query) || /recommendations|proposed solutions/i.test(aiResponse)) {
    suggestions.push(
      "What solutions have been effective in similar communities?",
      "Are there any government-led safety programs?"
    );
  }

  if (/budget|funding|money|cost of living|rent|affordable housing/i.test(query) || /financial support|grants|housing options|eviction/i.test(aiResponse)) {
    suggestions.push(
      "How is this initiative being funded?",
      "Do you need help finding affordable housing?"
    );
  }

  if (/transportation|transit|bus|subway|commute/i.test(query) || /public transit|route|schedule|accessibility/i.test(aiResponse)) {
    suggestions.push(
      "Would you like to view local transit schedules?",
      "Do you want tips for commuting or discounted transit passes?"
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "What more would you like to know?",
      "Would you like updates on this topic?"
    );
  }

  return suggestions;
};

// === GRAPHQL RESOLVERS ===
const resolvers = {
  Query: {
    communityAIQuery: async (_, { input, userId }) => {
      try {
        // Load user context
        const pastInteractions = await UserInteraction.find({ userId })
          .sort({ createdAt: -1 })
          .limit(3);

        const contextString = pastInteractions
          .map(i => `User asked: "${i.query}", AI responded: "${i.aiResponse}"`)
          .join("\n");

        // Retrieve relevant community discussions
        const retrievedPosts = await retrieveData(input);
        const retrievedData = retrievedPosts.join("\n");

        const augmented = `User Query: ${input}\n\nPrevious Interactions:\n${contextString}\n\nCommunity Discussions:\n${retrievedData}`;

        // Ask the model
        const response = await model.invoke([["human", augmented]]);
        const aiResponseText = response.content;

        // Enrich response
        const followUps = generateFollowUpQuestions(input, aiResponseText);
        const topics = extractTopics(aiResponseText);

        // Optionally: set a confidence heuristic (later can improve)
        const confidenceScore = retrievedPosts.length >= 3 ? 0.9 : 0.7;

        // Save interaction
        await new UserInteraction({
          userId,
          query: input,
          aiResponse: aiResponseText,
          confidenceScore,
          followUps,
          topics,
        }).save();

        return {
          text: aiResponseText,
          suggestedQuestions: followUps,
          retrievedPosts,
        };
      } catch (error) {
        console.error('Error during AI query processing:', error.message);
        return {
          text: 'Sorry, something went wrong while processing your request.',
          suggestedQuestions: [],
          retrievedPosts: [],
        };
      }
    },

    getUserInteractions: async (_, { userId }) => {
      try {
        return await UserInteraction.find({ userId }).sort({ createdAt: -1 }).limit(10);
      } catch (err) {
        console.error('Failed to fetch user interactions:', err.message);
        return [];
      }
    },
  },
};

export default resolvers;
