// UserInteraction.js - model for MongoDB
// This file defines the schema for user interactions with the AI system.
// It includes fields for user ID, query, AI response, confidence score, 
// follow-up suggestions, and topics.
import mongoose from 'mongoose';

const UserInteractionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  query: { type: String, required: true },
  aiResponse: { type: String, required: true },
  confidenceScore: { type: Number, default: 0.75 },       // 🆕 LLM confidence
  followUps: { type: [String], default: [] },             // 🆕 follow-ups suggested
  topics: { type: [String], default: [] },                // 🆕 auto-classified
  createdAt: { type: Date, default: Date.now }
});

UserInteractionSchema.index({ userId: 1, createdAt: -1 }); // 🆕 optimized access

export default mongoose.model('UserInteraction', UserInteractionSchema);

