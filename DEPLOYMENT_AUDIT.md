# 🔍 AUDIT DE DÉPLOIEMENT - OUTILLIO

**Date:** 2 janvier 2026  
**Status:** ⚠️ 9 PROBLÈMES TROUVÉS

---

## 📋 RÉSUMÉ DES PROBLÈMES

| # | Sévérité | Titre | Fichiers | Impact |
|---|----------|-------|----------|--------|
| 1 | 🔴 CRITIQUE | API_BASE en production vide | Tous les pages | API inaccessible en prod |
| 2 | 🟠 GRAVE | Parsage localStorage double | Reservation.jsx:255 | Performance + bugs |
| 3 | 🟠 GRAVE | Logout incomplet | Header.jsx | Sessions actives |
| 4 | 🟡 MOYEN | Erreurs silencieuses | Plusieurs pages | Debugging difficile |
| 5 | 🟡 MOYEN | Pas de validation côté frontend | Publish, Reservation | UX mauvaise |
| 6 | 🟡 MOYEN | Routes avec window.location.href | App.js | UX mauvaise (rechargements) |
| 7 | 🟡 MOYEN | Pas de gestion erreur Stripe | Paiement.jsx | Erreurs invisibles |
| 8 | 🟡 MOYEN | CORS pas configuré explicitement | server/index.js | Problèmes cross-origin |
| 9 | 🔵 INFO | Secrets en .env public | .env | Risque sécurité |

---

## 🔴 PROBLÈME #1: API_BASE EN PRODUCTION (CRITIQUE)

### Description
```javascript
// ❌ ACTUELLEMENT (tous les fichiers)
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
```

En production (`hostname !== 'localhost'`), `API_BASE = ''`, donc toutes les appels vont vers `https://ton-domaine.com/api/...`  
Mais le backend Express écoute sur un port différent (4000) ou un serveur différent.

### Impact
- ✗ Erreurs 404 ou CORS sur TOUS les appels API
- ✗ App complètement non-fonctionnelle en prod

### Fix
Créer un fichier `.env` de production ET lire depuis process.env:

```javascript
// config/api.js (NEW)
export const API_BASE = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://api.outillio.com');
```

Ensuite dans `.env.production`:
```
REACT_APP_API_URL=https://api.outillio.com
```

Et utiliser partout:
```javascript
import { API_BASE } from '../../config/api.js';
```

---

## 🟠 PROBLÈME #2: PARSAGE DOUBLE LOCALSTORAGE (GRAVE)

### Description
```javascript
// ❌ Reservation.jsx ligne 255
disabled={submitting || !equipment.is_available || 
  (equipment && equipment.user_id === 
    (JSON.parse(localStorage.getItem('auth') || '{}').userId || 
     JSON.parse(localStorage.getItem('auth') || '{}').id)
  )
}
```

**Parsage 2x !** Inefficace + mauvaise pratique

### Fix
```javascript
// ✅ 
const auth = JSON.parse(localStorage.getItem('auth') || '{}');
const isOwnItem = equipment?.user_id === (auth.userId || auth.id);
// ... puis utiliser isOwnItem
disabled={submitting || !equipment.is_available || isOwnItem}
```

---

## 🟠 PROBLÈME #3: LOGOUT INCOMPLET (GRAVE)

### Description
```javascript
// ❌ Header.jsx ligne 63
<button onClick={() => { 
  localStorage.removeItem('auth'); 
  window.location.reload(); 
}}>
```

Pas d'appel API pour invalider la session serveur. Les tokens JWT resteront valides.

### Impact
- Sessions potentiellement toujours actives
- Failles de sécurité si backend ne timeout pas les tokens

### Fix
Créer endpoint `/api/logout`:
```javascript
// server/index.js
app.post('/api/logout', authMiddleware, (req, res) => {
  // Backend peut blacklister le token ici si nécessaire
  res.json({ message: 'Logged out' });
});
```

Frontend:
```javascript
const handleLogout = async () => {
  try {
    await fetch(`${API_BASE}/api/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${auth.token}` }
    });
  } finally {
    localStorage.removeItem('auth');
    window.location.href = '/';
  }
};
```

---

## 🟡 PROBLÈME #4: ERREURS SILENCIEUSES

### Exemples
```javascript
// ❌ Profil.jsx ligne 109
.catch(() => setReviews([]));

// ❌ Messages.jsx ligne 49
.catch(() => setMessages([]));
```

Les erreurs sont silencieuses (pas de console.error)

### Fix
```javascript
// ✅
.catch(err => {
  console.error('Erreur chargement reviews:', err);
  setReviews([]);
});
```

---

## 🟡 PROBLÈME #5: VALIDATIONS FRONTEND INSUFFISANTES

### Exemples
- Publish.jsx: Valide titre min 3 chars ✅ mais pas max
- Reservation.jsx: Valide dates mais pas future dates
- Messages.jsx: Valide pas le contenu avant envoi

### Fix
Ajouter limites max:
```javascript
// Titre: 3-255 caractères
if (formData.title.length > 255) {
  setError('Titre max 255 caractères');
  return false;
}

// Description: 10-5000 caractères
if (formData.description.length > 5000) {
  setError('Description max 5000 caractères');
  return false;
}

// Prix: 0-99999 euros
if (parseFloat(formData.dailyPrice) > 99999) {
  setError('Prix max 99999€');
  return false;
}
```

---

## 🟡 PROBLÈME #6: UX - ROUTES AVEC window.location.href

### Impact
- Chaque navigation = rechargement complet de la page
- Pertes de state React
- Lenteur perçue

### Exemple mauvais
```javascript
// ❌ Reservation.jsx
window.location.href = `/paiement?bookingId=${data.id}`;
```

### Bon mais nécessite un vrai routeur
Mais App.js utilise déjà des routes avec pathname. C'est OK pour MVP mais à refactoriser avec React Router.

---

## 🟡 PROBLÈME #7: GESTION D'ERREURS STRIPE MANQUANTE

### Fichier: Paiement.jsx

```javascript
// ❌ Pas de gestion erreur Stripe checkout
window.location.href = sessionUrl;
```

Si Stripe retourne une erreur, l'utilisateur ne le sait pas.

### Fix
```javascript
// ✅
if (!sessionUrl) {
  setMsg('❌ Erreur création session paiement');
  return;
}
window.location.href = sessionUrl;
```

---

## 🟡 PROBLÈME #8: CORS PAS EXPLICITE

### Fichier: server/index.js

```javascript
// ❌ Pas de app.use(cors()) trouvé explicitement
```

Vérifier si CORS est configuré.

### Fix
Au début du server/index.js:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 🔵 PROBLÈME #9: SECRETS EN .env PUBLIC

### Fichier: .env

```dotenv
SUPABASE_SERVICE_ROLE_KEY=sb_secret_bay2R-DHI8SVOSximwKyPA_J78HVPKB
```

Cette clé **NE DOIT JAMAIS** être en .env du repo public!

### Fix
1. Régénérer la clé dans Supabase
2. Stocker SEULEMENT en secrets du serveur (Vercel, Heroku, etc.)
3. Ne jamais commiter .env à git

### .gitignore
```
.env
.env.local
.env.*.local
```

---

## ✅ CHECKLIST DE DÉPLOIEMENT

- [ ] Problem #1: Créer config/api.js + .env.production
- [ ] Problem #3: Créer endpoint /api/logout
- [ ] Problem #4: Ajouter console.error sur tous les `.catch()`
- [ ] Problem #5: Ajouter validations max sur formulaires
- [ ] Problem #7: Tester Stripe error handling
- [ ] Problem #8: Ajouter app.use(cors()) explicite
- [ ] Problem #9: Régénérer clés Supabase + remove .env du git
- [ ] Tester authentification complète (register → login → logout)
- [ ] Tester publication équipement + images
- [ ] Tester réservation + paiement Stripe
- [ ] Tester messagerie + profils
- [ ] Vérifier pas de 404 sur API en prod

---

## 🚀 DÉPLOIEMENT RECOMMANDÉ

**Plateforme:** Vercel + Backend Express sur Heroku/Railway

### Frontend (Vercel)
1. Push code sur GitHub
2. Connecter repo Vercel
3. Ajouter env vars:
   ```
   REACT_APP_API_URL=https://outillio-api.herokuapp.com
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

### Backend (Heroku/Railway)
1. Ajouter env vars:
   ```
   NODE_ENV=production
   SUPABASE_URL=https://...
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   JWT_SECRET=strong_random_secret
   FRONTEND_URL=https://outillio.vercel.app
   ```

---

## 📊 SCORES

| Aspect | Score | Notes |
|--------|-------|-------|
| **Logique métier** | 8/10 | Bonne, mais quelques edge cases |
| **Gestion erreurs** | 6/10 | Erreurs silencieuses |
| **Sécurité** | 7/10 | JWT OK, mais pas de validation serveur |
| **UX** | 6/10 | Fonctionne mais rechargements pages |
| **Performance** | 7/10 | OK, quelques inefficacités |
| **Prêt prod** | ❌ NON | À corriger avant déploiement |

**Estimation temps fix:** 4-6 heures

