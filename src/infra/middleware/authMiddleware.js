import JwtService from '../services/JwtService.js';

/**
 * Middleware pour vérifier le JWT
 * Extrait le token du header Authorization: Bearer <token>
 */
export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token requis' });
    }

    const token = authHeader.slice(7); // Enlever "Bearer "
    const decoded = JwtService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
}

/**
 * Middleware optionnel : charge l'utilisateur s'il existe un token valide
 * Mais ne retourne pas d'erreur si absent
 */
export function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = JwtService.verifyToken(token);
      req.user = decoded;
    }
  } catch (err) {
    // Ignore les erreurs de token, l'utilisateur est optionnel
  }
  next();
}
