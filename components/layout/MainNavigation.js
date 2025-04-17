/**
 * Main Navigation Component
 * 
 * This component provides the primary navigation header for the application.
 * It displays the application name/logo and navigation links to the main
 * application features: CV generation, job search, and CV history.
 * 
 * Technologies:
 * - React: For component-based UI rendering
 * - Next.js: For routing and navigation via the Link component
 * - CSS Modules: For component-scoped styling
 */

// Import component-specific styles from CSS module
import classes from './MainNavigation.module.css';
// Import Next.js Link component for client-side navigation without page refresh
import Link from 'next/link'
// Import authentication hook
import { useAuth } from '../../lib/AuthContext';

/**
 * MainNavigation Component
 * 
 * Renders the application header with navigation links.
 * This appears on all pages of the application via the Layout component.
 * 
 * @returns {JSX.Element} The rendered navigation header
 */
function MainNavigation() {
  // Use authentication context
  const { user, isAuthenticated, logout } = useAuth();

  return (
    // Header container with styling from CSS module
    <header className={classes.header}>
      {/* Application logo/name display */}
      <div className={classes.logo}>AI Job Helper</div>
      
      {/* Navigation menu container */}
      <nav>
        {/* Unordered list of navigation links */}
        <ul>
          {/* Navigation item: CV Generation (homepage) */}
          <li>
            {/* Next.js Link component for client-side navigation */}
            <Link href='/'>Generate CV</Link>
          </li>
          
          {/* Navigation item: Job Search feature */}
          <li>
            <Link href='/job-search'>Job Search</Link>
          </li>
          
          {/* Navigation item: CV History (view saved CVs) */}
          <li>
            <Link href="/cv-history">CV History</Link>
          </li>
          
          {/* Navigation item: CV Grader */}
          <li>
            <Link href="/cv-grader">CV Grader</Link>
          </li>

          {/* Authentication related navigation items */}
          {isAuthenticated ? (
            <>
              <li>
                <span className={classes.userName}>Hello, {user.name}</span>
              </li>
              <li>
                <button onClick={logout} className={classes.logoutButton}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/auth/login">Login</Link>
              </li>
              <li>
                <Link href="/auth/signup">Signup</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

// Export the component for use in the application layout
export default MainNavigation;
