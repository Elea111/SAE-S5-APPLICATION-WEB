export async function LoginUser(email, password) {
    if (!email) {
        throw new Error("Email requis");
    }

    if (!password || password.length < 6) {
        throw new Error("Mot de passe trop court");
    }

    const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    let data;
    try {
        data = await response.json(); // lire la réponse JSON une seule fois
    } catch (e) {
        throw new Error("Le serveur n'a pas renvoyé un JSON valide");
    }

    if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la connexion");
    }

    return data; // retourne le JSON du backend
}
