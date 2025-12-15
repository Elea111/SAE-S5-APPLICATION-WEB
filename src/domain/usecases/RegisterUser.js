export async function RegisterUser(firstName, lastName, email, password) {

    if (!firstName || !lastName) {
        throw new Error("Nom et prénom requis");
    }

    if (!email) {
        throw new Error("Email requis");
    }

    if (!password || password.length < 6) {
        throw new Error("Mot de passe trop court");
    }

    const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password })
    });

    let data;
    try {
        data = await response.json(); // on lit le JSON **une seule fois**
    } catch (e) {
        throw new Error("Le serveur n'a pas renvoyé un JSON valide");
    }

    if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'inscription");
    }

    return data; // ✅ retourne le JSON déjà parsé
}
