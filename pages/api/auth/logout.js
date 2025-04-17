import { withSessionRoute } from '../../../lib/session';

/**
 * API route for user logout
 * 
 * This handles destroying the user session to log them out.
 */
async function logoutHandler(req, res) {
  // Only allow POST requests for this endpoint
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Destroy the session
    req.session.destroy();
    
    // Return success response
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

// Wrap the handler with session support
export default withSessionRoute(logoutHandler); 