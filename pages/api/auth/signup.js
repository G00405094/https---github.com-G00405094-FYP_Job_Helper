import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { withSessionRoute } from '../../../lib/session';

/**
 * API route for user registration
 * 
 * This handles the creation of new user accounts.
 * It validates input, hashes passwords, and creates user records in the database.
 */
async function signupHandler(req, res) {
  // Only allow POST requests for this endpoint
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to the database
    await dbConnect();

    const { name, email, password } = req.body;

    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password (12 rounds of salting)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save user to database
    await user.save();

    // Return success response (don't include password in response)
    return res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle MongoDB authentication errors
    if (error.message?.includes('bad auth') || 
        error.message?.includes('authentication failed') ||
        error.code === 8000 ||
        error.codeName === 'AtlasError') {
      return res.status(500).json({ 
        message: 'Database authentication error. Please check your MongoDB credentials.' 
      });
    }
    
    // Handle MongoDB connection errors
    if (error.name === 'MongooseServerSelectionError' || 
        error.name === 'MongoNetworkError' ||
        error.message?.includes('ETIMEOUT')) {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.' 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    // Generic error response
    return res.status(500).json({ 
      message: 'Something went wrong. Please try again later.' 
    });
  }
}

// Wrap the handler with session support
export default withSessionRoute(signupHandler); 