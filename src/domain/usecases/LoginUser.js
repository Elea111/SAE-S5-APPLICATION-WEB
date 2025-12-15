export async function LoginUser(email, password, userRepository = null) {
    if (!email || !password) {
        throw new Error('Email et mot de passe requis');
    }

    if (userRepository && typeof userRepository.findByCredentials === 'function') {
        return await userRepository.findByCredentials(email, password);
    }

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    let data;
    try {
        data = await response.json();
    } catch (e) {
        throw new Error('Serveur: JSON invalide');
    }

    if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
    }

    return data;
}
