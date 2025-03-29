// utils/embedding.js
// This module generates embeddings using Google's Generative AI API.
// Ensure consistent role-free Gemini format
import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const embeddingResponse = await model.embedContent({
      content: {
        parts: [{ text }]
      }
    });

    if (!embeddingResponse.embedding) throw new Error("No embedding generated");
    return embeddingResponse.embedding.values;
  } catch (error) {
    console.error("❌ Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}
