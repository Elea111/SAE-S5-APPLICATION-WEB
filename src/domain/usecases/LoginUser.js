import JwtService from '../../infra/services/JwtService.js';
import bcryptjs from 'bcryptjs';

// ❌ PAS d'import jsonwebtoken côté frontend
// Le token est REÇU du backend via l'API

export async function LoginUser(email, password, userRepository = null) {
    if (!email || !password) {
        throw new Error('Email et mot de passe requis');
    }

    // Si un repository est injecté (côté serveur)
    if (userRepository && typeof userRepository.findByEmail === 'function') {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        // Vérifier le mot de passe
        const isValid = await bcryptjs.compare(password, user.password_hash);
        if (!isValid) {
            throw new Error('Mot de passe incorrect');
        }

        // Générer le token
        const token = JwtService.generateToken({
            id: user.id,
            email: user.email,
            isPro: user.is_pro
        });

        // ✅ RETOURNER TOUS LES CHAMPS NECESSAIRES
        return {
            id: user.id,
            email: user.email,
            token,
            isPro: user.is_pro || false,
            first_name: user.first_name || '',
            last_name: user.last_name || ''
        };
    }

    // Frontend : appeler l'API (ne sera jamais utilisé en production)
    throw new Error('Repository non fourni');
}
