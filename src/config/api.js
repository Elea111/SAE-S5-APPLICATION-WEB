/**
 * Configuration API - Points vers le bon backend selon l'environnement
 */

export const API_BASE = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:4000' 
    : `https://api.${window.location.hostname}`);

console.log('🔌 API_BASE configuré:', API_BASE);
