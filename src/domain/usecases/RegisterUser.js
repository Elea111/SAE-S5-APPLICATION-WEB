import bcrypt from 'bcryptjs';
import JwtService from '../../infra/services/JwtService.js';

export async function RegisterUser(firstName, lastName, email, password, userRepository = null) {

    if (!firstName || !lastName) {
        throw new Error("Nom et prénom requis");
    }

    if (!email) {
        throw new Error("Email requis");
    }

    if (!password || password.length < 6) {
        throw new Error("Mot de passe trop court");
    }

    // Hash password avant enregistrement (Supabase ou autre)
    const password_hash = await bcrypt.hash(password, 10);

    // Si un repository est injecté (architecture hexagonale), l'utiliser
    if (userRepository && typeof userRepository.create === 'function') {
        const user = await userRepository.create({ 
            first_name: firstName, 
            last_name: lastName, 
            email, 
            password_hash 
        });
        
        // Générer un JWT après création
        const token = JwtService.generateToken({
            id: user.id,
            email: user.email,
            isPro: user.is_pro || false
        });
        
        return { 
            ...user, 
            token,
            isPro: user.is_pro || false
        };
    }

    // If running frontend dev server on localhost:3000, target the mock backend at port 4000
    const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const API_BASE = isLocalDev ? 'http://localhost:4000' : '';

    const url = `${API_BASE}/api/register`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password })
    });

    // Robust parsing: prefer text() when available, otherwise try json()
    let data = {};
    if (response && typeof response.text === 'function') {
        const text = await response.text();
        if (text && text.trim() !== '') {
            try {
                data = JSON.parse(text);
            } catch (e) {
                // fallback to response.json() if available
                if (typeof response.json === 'function') {
                    try {
                        data = await response.json();
                    } catch (e2) {
                        throw new Error("Le serveur n'a pas renvoyé un JSON valide");
                    }
                } else {
                    throw new Error("Le serveur n'a pas renvoyé un JSON valide");
                }
            }
        }
    } else if (response && typeof response.json === 'function') {
        try {
            data = await response.json();
        } catch (e) {
            throw new Error("Le serveur n'a pas renvoyé un JSON valide");
        }
    }

    if (!response.ok) {
        throw new Error((data && data.message) ? data.message : "Erreur lors de l'inscription");
    }

    return data; // retourne le JSON (ou {} si body vide)
}
