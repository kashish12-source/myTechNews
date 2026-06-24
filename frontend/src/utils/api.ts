/**
 * Resolves the backend API URL dynamically based on the environment.
 * - In Development (Vite Dev Server): Returns the relative path to leverage Vite's local proxy.
 * - In Production (Vercel Build): Returns the direct local loopback address (http://127.0.0.1:3001)
 *   which modern browsers exempt from Mixed Content secure/insecure connection blocks.
 */
export const getApiUrl = (path: string): string => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  // If we are on localhost in a built production environment (PM2 static serve),
  // route API requests directly to the FastAPI server on port 3001.
  if (isLocalhost && !import.meta.env.DEV) {
    return `http://${window.location.hostname}:3001${path}`;
  }
  // Fall back to relative path for Vite dev server proxy or Vercel deployments
  return path;
};
