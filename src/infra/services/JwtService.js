import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-dev-only';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET non défini. Utilisation d\'une clé de fallback (DEV UNIQUEMENT)');
}

class JwtService {
  /**
   * Générer un JWT
   */
  generateToken(payload, expiresIn = '24h') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  }

  /**
   * Vérifier un JWT
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new Error(`Token invalide: ${err.message}`);
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
