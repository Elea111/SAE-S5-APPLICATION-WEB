import JwtService from '../services/JwtService.js';
import supabase from '../database/supabaseClient.js';

/**
 * Créer l'utilisateur dans la table users s'il n'existe pas
 * (pour les utilisateurs OAuth qui n'ont pas passé par RegisterUser)
 */
async function ensureUserExists(userId, email) {
  try {
    // Vérifier si l'utilisateur existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows found (normal)
      console.error('❌ Erreur vérification user:', checkError);
      return;
    }

    if (existingUser) {
      // L'utilisateur existe déjà
      return;
    }

    // Créer l'utilisateur
    const { error: insertError } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email: email,
        password_hash: '', // OAuth users n'ont pas de password
        first_name: email.split('@')[0],
        last_name: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (insertError) {
      console.error('❌ Erreur création user OAuth:', insertError);
    } else {
      console.log('✅ User OAuth créé:', userId);
    }
  } catch (err) {
    console.error('❌ Exception ensureUserExists:', err);
  }
}

/**
 * Middleware pour vérifier le JWT
 * Extrait le token du header Authorization: Bearer <token>
 * Crée l'utilisateur dans la BD s'il n'existe pas (pour OAuth)
 */
export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token requis' });
    }

    const token = authHeader.slice(7); // Enlever "Bearer "
    const decoded = JwtService.verifyToken(token);
    req.user = decoded;

    // Si c'est un token Supabase OAuth, créer l'user dans la table users
    if (decoded.isSupabaseAuth && decoded.email) {
      await ensureUserExists(decoded.id || decoded.userId, decoded.email);
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
}

/**
 * Middleware optionnel : charge l'utilisateur s'il existe un token valide
 * Mais ne retourne pas d'erreur si absent
 */
export async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = JwtService.verifyToken(token);
      req.user = decoded;

      // Si c'est un token Supabase OAuth, créer l'user dans la table users
      if (decoded.isSupabaseAuth && decoded.email) {
        await ensureUserExists(decoded.id || decoded.userId, decoded.email);
      }
    }
  } catch (err) {
    // Ignore les erreurs de token, l'utilisateur est optionnel
  }
  next();
}
