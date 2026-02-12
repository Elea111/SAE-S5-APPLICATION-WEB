import JwtService from '../services/JwtService.js';
import supabase from '../database/supabaseClient.js';

/**
 * Créer ou mettre à jour l'utilisateur dans la table users
 * Gère les cas: nouvel utilisateur OAuth, utilisateur existant, doublons email
 */
async function ensureUserExists(userId, email) {
  try {
    // 1️⃣ Vérifier si utilisateur existe par ID
    const { data: userById, error: checkByIdError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userById) {
      // L'utilisateur existe déjà par ID - rien à faire
      console.log(`✅ User ${userId} existe déjà`);
      return;
    }

    // 2️⃣ Vérifier si email existe déjà (depuis email/password ou OAuth différent)
    const { data: userByEmail, error: checkByEmailError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userByEmail) {
      // L'email existe déjà mais pas cet ID - c'est un utilisateur existant
      console.log(`⚠️  Email ${email} existe déjà (user ${userByEmail.id}). Pas de duplication.`);
      return;
    }

    // 3️⃣ Créer nouvel utilisateur
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
      }])
      .select();

    if (insertError) {
      if (insertError.code === '23505') {
        // Duplicate key - l'email existe déjà
        console.warn(`⚠️  Email ${email} existe déjà (création en doublon évitée)`);
        return;
      }
      console.error('❌ Erreur création user OAuth:', insertError);
      throw insertError;
    }

    console.log(`✅ User OAuth créé: ${userId} (${email})`);
  } catch (err) {
    console.error('❌ Exception ensureUserExists:', err.message);
    // Ne pas throw - l'authentification peut continuer même si la création échoue
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
