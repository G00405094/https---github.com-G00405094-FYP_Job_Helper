import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { withSessionRoute } from '../../../lib/session';

/**
 * API route for user login
 * 
 * This handles user authentication by validating credentials
 * and creating a session if valid.
 */
async function loginHandler(req, res) {
  // Only allow POST requests for this endpoint
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Connect to the database
  await dbConnect();

  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    
    // If user doesn't exist or password is wrong
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create the session
    req.session.set("user", {
      id: user._id,
      name: user.name,
      email: user.email,
      isLoggedIn: true
    });

    // Save the session
    await req.session.save();

    // Return success response
    return res.status(200).json({ 
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

// Wrap the handler with session support
export default withSessionRoute(loginHandler); 