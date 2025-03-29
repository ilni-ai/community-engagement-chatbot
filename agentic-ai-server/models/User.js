// User.js - model for MongoDB
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['resident', 'business_owner', 'community_organizer'] 
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);
export default User;
