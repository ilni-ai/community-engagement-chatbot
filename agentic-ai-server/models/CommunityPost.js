// CommunityPost model for community-engagement-service
// This model represents a post in the community, including fields for the author, 
// title, content, category, AI summary, topics, and embedding for 
// search functionality.
import mongoose from 'mongoose';

const CommunityPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true, enum: ['news', 'discussion'] },
  aiSummary: { type: String },
  topics: { type: [String], default: [] },              // 🆕 list of AI-tagged topics
  embedding: { type: [Number], default: [] },
  createdAt: { type: Date, default: Date.now },
});

CommunityPostSchema.index({ embedding: '2dsphere' });
CommunityPostSchema.index({ createdAt: -1 });             // 🆕 for sorting latest posts

export default mongoose.model('CommunityPost', CommunityPostSchema);
