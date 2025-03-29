
// seedCommunityPosts.js to seed community posts into the database.
// This script reads community posts from a text file, generates embeddings 
// for each post using the Google Generative AI API, and saves them to the database.
// This is useful for initializing the database with sample data for testing and development.
//
// Load environment variables
// Updated seedCommunityPosts.js
// seedCommunityPosts.js
// This script seeds community discussion posts into MongoDB with embeddings.
// It currently skips optional fields like aiSummary and topics due to rate limits.

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import CommunityPost from './models/CommunityPost.js';
import { generateEmbedding } from './utils/embedding.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/community-engagement-lab-db-v2';

const seedPosts = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('📦 Connected to MongoDB. Seeding posts...');

  const loader = new TextLoader('./data/community_posts.txt');
  const docs = await loader.load();

  for (const doc of docs) {
    const sentences = doc.pageContent.split(/\r?\n/).filter(line => line.trim());

    for (const sentence of sentences) {
      try {
        const embedding = await generateEmbedding(sentence);

        const post = new CommunityPost({
          author: '000000000000000000000000', // Replace with a valid ObjectId in production
          title: sentence.substring(0, 40) + '...',
          content: sentence,
          category: 'discussion',
          embedding,
          // aiSummary and topics are omitted for now due to API rate limits
          // You can re-enable this when quota is available:
          // aiSummary: await generateSummary(sentence),
          // topics: await detectTopics(sentence),
        });

        await post.save();
        console.log(`✅ Saved: ${post.title}`);
      } catch (error) {
        console.error(`❌ Failed to save post:`, error.message);
      }
    }
  }

  console.log('✅ Finished seeding posts.');
  mongoose.disconnect();
};

seedPosts();
