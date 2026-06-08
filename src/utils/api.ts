/**
 * Resolves the backend API URL dynamically based on the environment.
 * - In Development (Vite Dev Server): Returns the relative path to leverage Vite's local proxy.
 * - In Production (Vercel Build): Returns the direct local loopback address (http://127.0.0.1:3001)
 *   which modern browsers exempt from Mixed Content secure/insecure connection blocks.
 */
export const getApiUrl = (path: string): string => {
  if (import.meta.env.DEV) {
    return path;
  }
  return `http://127.0.0.1:3001${path}`;
};
