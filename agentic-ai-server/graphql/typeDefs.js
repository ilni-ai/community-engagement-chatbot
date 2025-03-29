// typeDefs.js - contains the GraphQL schema definition 
// language (SDL) for the API
const typeDefs = `#graphql
  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
    createdAt: String!
  }

  type CommunityPost {
    id: ID!
    author: User!
    title: String!
    content: String!
    category: String!
    aiSummary: String
    createdAt: String!
    updatedAt: String
  }

  type AIResponse {
    text: String!
    suggestedQuestions: [String]!
    retrievedPosts: [String]!
  }

  type UserInteraction {
    id: ID!
    userId: String!
    query: String!
    aiResponse: String!
    createdAt: String!
  }

  type Query {
    getUserInteractions(userId: String!): [UserInteraction]!
    communityAIQuery(input: String!, userId: String!): AIResponse!
  }
`;

export default typeDefs;
