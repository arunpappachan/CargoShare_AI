/**
 * Centralized API configuration.
 *
 * Reads the base URL from the VITE_API_URL environment variable
 * (set in .env or .env.local), falling back to localhost for development.
 */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
