import { withIronSession } from "next-iron-session";

// Session configuration
export const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || "complex_password_at_least_32_characters_long",
  cookieName: "user_session",
  cookieOptions: {
    // secure should be true in production, but can be false in development
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week in seconds
    httpOnly: true, // The cookie is only accessible by the server
    sameSite: "strict",
  },
};

// Wrapper for API routes
export function withSessionRoute(handler) {
  return withIronSession(handler, sessionOptions);
}

// Wrapper for pages
export function withSessionPage(handler) {
  return withIronSession(handler, sessionOptions);
}

// Helper to get user from session
export async function getUserFromSession(req) {
  try {
    const user = req.session.get("user");
    console.log("Session user data:", user ? { ...user, password: '[FILTERED]' } : null);
    if (!user) {
      return null;
    }
    return user;
  } catch (error) {
    console.error("Error getting user from session:", error);
    return null;
  }
}

// Helper to check if user is authenticated
export async function isAuthenticated(req) {
  try {
    const user = await getUserFromSession(req);
    return user !== null && user.isLoggedIn === true;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
} 