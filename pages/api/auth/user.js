import { withSessionRoute, getUserFromSession } from '../../../lib/session';

/**
 * API route for getting the current logged-in user
 * 
 * This retrieves the user information from the session.
 */
async function userHandler(req, res) {
  // Only allow GET requests for this endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get user from session
    const user = await getUserFromSession(req);
    
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Return user data
    return res.status(200).json({ user });
  } catch (error) {
    console.error('User fetch error:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

// Wrap the handler with session support
export default withSessionRoute(userHandler); 