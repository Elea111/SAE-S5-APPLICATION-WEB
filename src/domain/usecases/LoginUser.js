export async function LoginUser(email, password, userRepository = null) {
    if (!email || !password) {
        throw new Error('Email et mot de passe requis');
    }

    if (userRepository && typeof userRepository.findByCredentials === 'function') {
        return await userRepository.findByCredentials(email, password);
    }

    const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const API_BASE = isLocalDev ? 'http://localhost:4000' : '';
    const url = `${API_BASE}/api/login`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    // tolerate non-json or empty responses
    let data = {};
    if (response && typeof response.text === 'function') {
        const text = await response.text();
        if (text && text.trim() !== '') {
            try {
                data = JSON.parse(text);
            } catch (e) {
                if (typeof response.json === 'function') {
                    try {
                        data = await response.json();
                    } catch (e2) {
                        throw new Error('Serveur: JSON invalide');
                    }
                } else {
                    throw new Error('Serveur: JSON invalide');
                }
            }
        }
    } else if (response && typeof response.json === 'function') {
        try {
            data = await response.json();
        } catch (e) {
            throw new Error('Serveur: JSON invalide');
        }
    }

    if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
    }

    return data;
}
