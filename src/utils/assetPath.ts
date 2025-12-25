/**
 * Resolves asset paths to work correctly in both development and production.
 * In production (GitHub Pages subdirectory), prepends the base URL.
 * In development, uses the path as-is.
 */
export function getAssetPath(path: string): string {
  // If the path is already absolute (starts with http/https) or a blob URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }

  // Get the base URL from Vite's environment
  // In development: '/'
  // In production on GitHub Pages: '/Recap2025/'
  const baseUrl = import.meta.env.BASE_URL;

  // Remove leading slash from path if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;

  // Combine base URL with the clean path
  return `${baseUrl}${cleanPath}`;
}
