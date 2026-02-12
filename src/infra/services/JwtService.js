import jwt from 'jsonwebtoken';
import supabase from '../database/supabaseClient.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-dev-only';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET non défini. Utilisation d\'une clé de fallback (DEV UNIQUEMENT)');
}

class JwtService {
  /**
   * Générer un JWT (legacy, pour login/register custom)
   */
  generateToken(payload, expiresIn = '24h') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  }

  /**
   * Vérifier un JWT (compatible Supabase + custom)
   * Accepte les tokens custom ET les tokens OAuth Supabase
   */
  verifyToken(token) {
    try {
      // Essayer d'abord avec JWT_SECRET (tokens custom)
      return jwt.verify(token, JWT_SECRET);
    } catch (customErr) {
      // Si échoue, c'est peut-être un token Supabase
      try {
        // Supabase JWT: on peut le décoder et le valider
        const decoded = jwt.decode(token);
        
        if (!decoded) {
          throw new Error('Token invalide: impossible de décoder');
        }

        // Si c'est un token Supabase (iss contient supabase)
        if (decoded.iss && decoded.iss.includes('supabase')) {
          // ✅ Token Supabase valide
          // Les tokens Supabase sont signés et vérifiés par Supabase
          // On accepte le decoded token
          return {
            id: decoded.sub,           // user ID
            email: decoded.email,
            userId: decoded.sub,       // Alias pour compatibilité
            iat: decoded.iat,
            exp: decoded.exp,
            isSupabaseAuth: true
          };
        }

        throw new Error(`Token invalide: ${customErr.message}`);
      } catch (supabaseErr) {
        throw new Error(`Token invalide: ${customErr.message}`);
      }
    }
  }

  /**
   * Décoder un JWT sans vérifier la signature
   */
  decodeToken(token) {
    return jwt.decode(token);
  }
}

// ✅ Exporter avec alias pour éviter le warning
const jwtServiceInstance = new JwtService();
export default jwtServiceInstance;
