/**
 * User Data Model
 * 
 * This file defines the structure of User data for authentication purposes.
 * It will store user information including email, password (hashed), and creation timestamp.
 */

// Import the mongoose library so we can create schemas and models
import mongoose from 'mongoose';

/**
 * User Schema Definition
 * 
 * This defines what user entries will contain in the database.
 */
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  createdAt: { 
    type: Date,
    default: Date.now
  },
});

/**
 * Model Export with Development Mode Protection
 * 
 * This uses a pattern to prevent errors during development by checking if
 * the model already exists before creating a new one.
 */
export default mongoose.models.User || mongoose.model('User', UserSchema); 