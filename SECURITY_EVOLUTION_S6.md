# 🔒 PLAN DE SÉCURITÉ S6 - ÉVOLUTION AXE SECURITY

**Date:** 5 février 2026  
**Objectif:** Corriger 5+ vulnérabilités et obtenir score SonarQube A

---

## 📋 TABLE DES MATIÈRES

1. [Vulnérabilités Identifiées](#vulnérabilités-identifiées)
2. [Plan Corretion](#plan-correction)
3. [Implementation](#implementation)
4. [Testing](#testing)

---

## 🔍 VULNÉRABILITÉS IDENTIFIÉES

### 1. ❌ JWT Stocké en localStorage (XSS Vulnerability)

**Problème:**
```javascript
// ❌ DANGEREUX: localStorage est accessible au JavaScript
localStorage.setItem('auth', JSON.stringify({ token: '...' }))

// Un script XSS peut faire:
const token = localStorage.getItem('auth')
```

**Impact:** Un attaquant XSS peut voler le token

**Severity:** 🔴 **CRITIQUE**

**Correction:**
```javascript
// ✅ BON: HttpOnly cookie (pas accessible via JS)
res.cookie('auth', token, {
  httpOnly: true,      // Pas accessible via JS
  secure: true,        // HTTPS only
  sameSite: 'Strict',  // CSRF protection
  maxAge: 24 * 60 * 60 * 1000 // 24h
})
```

---

### 2. ❌ Pas de Rate Limiting (Brute Force Attack)

**Problème:**
```javascript
// ❌ DANGEREUX: Un attaquant peut essayer infini de mots de passe
POST /api/login
{ "email": "user@example.com", "password": "tries 1000 times" }
```

**Impact:** Attaque brute force sur login

**Severity:** 🟠 **HIGH**

**Correction:**
```javascript
// ✅ BON: Limiter 5 tentatives par IP par 5 minutes
import rateLimit from 'express-rate-limit'

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 tentatives
  message: 'Trop de tentatives de login, réessayez plus tard'
})

app.post('/api/login', loginLimiter, (req, res) => { ... })
```

---

### 3. ❌ Pas de CSRF Protection (Cross-Site Request Forgery)

**Problème:**
```html
<!-- ❌ DANGEREUX: Attaque CSRF -->
<!-- Attaquant crée un site avec: -->
<img src="https://outillio.com/api/bookings?action=delete&id=123" />
<!-- Le cookie de l'user est envoyé automatiquement -->
```

**Impact:** Attaquant peut modifier/supprimer des réservations

**Severity:** 🟠 **HIGH**

**Correction:**
```javascript
// ✅ BON: CSRF tokens
import csrf from 'csurf'

const csrfProtection = csrf({ cookie: false })

app.post('/api/bookings', csrfProtection, (req, res) => {
  // Vérifier que le token CSRF du body == token en session
  // Si différent → erreur 403
})
```

---

### 4. ❌ Exposition de Données Sensibles (Data Exposure)

**Problème:**
```javascript
// ❌ DANGEREUX: API retourne password_hash
GET /api/users/123
{
  id: '123',
  email: 'user@example.com',
  password_hash: 'bcrypt$2a$10$...', // ❌ NE PAS RETOURNER
  first_name: 'John',
  last_name: 'Doe'
}
```

**Impact:** Hash password peut être utilisé pour rainbow table attack

**Severity:** 🟠 **HIGH**

**Correction:**
```javascript
// ✅ BON: Ne jamais retourner password_hash
const { password_hash, ...safeUser } = user
res.json(safeUser)

// Ou utiliser une classe User avec getter/setter
class User {
  getPublicData() {
    return {
      id: this.id,
      email: this.email,
      first_name: this.first_name,
      last_name: this.last_name
      // Pas de password_hash!
    }
  }
}
```

---

### 5. ❌ Pas de Input Validation Stricte (Injection Attacks)

**Problème:**
```javascript
// ❌ DANGEREUX: Pas de validation
const { title, description } = req.body

const item = await db.items.insert({
  title: title, // Pourrait être: '); DROP TABLE items; --
  description: description
})
```

**Impact:** SQL Injection, NoSQL Injection

**Severity:** 🔴 **CRITIQUE**

**Correction:**
```javascript
// ✅ BON: Valider avec Zod (déjà fait!)
import { z } from 'zod'

const PublishEquipmentSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(5000),
  price: z.number().positive(),
  category: z.enum(['outils', 'équipement', 'véhicule'])
})

const validated = PublishEquipmentSchema.parse(req.body)
// Si parse échoue → erreur 400 automatiquement
```

---

### 6. ❌ Pas de HTTPS en Production (Man-in-the-Middle)

**Problème:**
```javascript
// ❌ DANGEREUX: Connexion HTTP (pas chiffrée)
http://outillio.com/api/login
```

**Impact:** Attaquant peut intercepter le token en transit

**Severity:** 🔴 **CRITIQUE**

**Correction:**
```javascript
// ✅ BON: Forcer HTTPS en production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.protocol !== 'https') {
    return res.redirect(`https://${req.get('host')}${req.url}`)
  }
  next()
})
```

---

## 📋 PLAN CORRECTION

### Semaine 1: Implémentation (6-12 fév)

| Jour | Tâche | Status |
|---|---|---|
| **6 fév** | Rate limiting + CSRF tokens | ☐ |
| **7-8 fév** | HttpOnly cookies + validation stricte | ☐ |
| **9 fév** | HTTPS redirection + security headers | ☐ |
| **10 fév** | SonarQube scan + analyse | ☐ |
| **11-12 fév** | Fixer vulnérabilités détectées | ☐ |

### Semaine 2: Testing & Audit (13-19 fév)

| Jour | Tâche | Status |
|---|---|---|
| **13 fév** | Pentest OWASP ZAP | ☐ |
| **14-15 fév** | Fixer vulnérabilités trouvées | ☐ |
| **16 fév** | Documentation sécurité | ☐ |
| **17-19 fév** | Tests finaux + QA | ☐ |

---

## 💻 IMPLEMENTATION

### 1️⃣ RATE LIMITING

**Installer:**
```bash
npm install express-rate-limit
```

**Implémenter dans `src/server/index.js`:**
```javascript
import rateLimit from 'express-rate-limit'

// Rate limiter pour login
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 tentatives
  skipSuccessfulRequests: true, // Reset après succès
  message: 'Trop de tentatives de login. Réessayez dans 5 minutes.'
})

// Rate limiter général (API)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: 'Trop de requêtes. Réessayez plus tard.'
})

// Appliquer
app.post('/api/login', loginLimiter, (req, res) => { ... })
app.use('/api/', apiLimiter) // Avant les autres routes
```

---

### 2️⃣ CSRF PROTECTION

**Installer:**
```bash
npm install csurf
```

**Implémenter:**
```javascript
import csrf from 'csurf'
import cookieParser from 'cookie-parser'

app.use(cookieParser())

const csrfProtection = csrf({
  cookie: false, // Utiliser session au lieu de cookie
  value: (req) => {
    // Récupérer token du header X-CSRF-Token
    return req.headers['x-csrf-token'] || req.body._csrf
  }
})

// GET /api/csrf-token: Retourner un token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

// POST routes: Protéger avec CSRF
app.post('/api/bookings', csrfProtection, (req, res) => { ... })
app.patch('/api/items/:id', csrfProtection, (req, res) => { ... })
app.delete('/api/items/:id', csrfProtection, (req, res) => { ... })
```

**Frontend:**
```javascript
// Avant chaque POST/PATCH/DELETE
const csrfToken = localStorage.getItem('csrfToken')

fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
```

---

### 3️⃣ HTTPONLY COOKIES

**Remplacer localStorage par HttpOnly cookies:**

**Backend (authMiddleware.js):**
```javascript
// Après login réussi:
res.cookie('auth_token', token, {
  httpOnly: true,    // ✅ Pas accessible via JS
  secure: true,      // ✅ HTTPS only
  sameSite: 'Strict',// ✅ CSRF protection
  maxAge: 24 * 60 * 60 * 1000, // 24h
  path: '/'
})

res.json({ success: true, message: 'Connecté' })
```

**Frontend (pas besoin de rien faire!):**
```javascript
// Le cookie est envoyé automatiquement avec chaque requête
fetch('/api/bookings', {
  method: 'POST',
  credentials: 'include', // Envoyer cookies
  body: JSON.stringify(data)
})
```

**Vérifier les cookies:**
```
DevTools → Network → Click requête → Cookies
Request Cookies: auth_token=...
```

---

### 4️⃣ SECURITY HEADERS

**Ajouter dans `src/server/index.js`:**

```javascript
import helmet from 'helmet'

app.use(helmet()) // Active les headers de sécurité

// Ou configurer manuellement:
app.use((req, res, next) => {
  // Content Security Policy: empêche XSS
  res.setHeader("Content-Security-Policy", "default-src 'self'")
  
  // X-Frame-Options: empêche clickjacking
  res.setHeader("X-Frame-Options", "DENY")
  
  // X-Content-Type-Options: empêche MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff")
  
  // Strict-Transport-Security: force HTTPS
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  
  next()
})
```

---

### 5️⃣ HTTPS REDIRECTION

**En production, forcer HTTPS:**

```javascript
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.get('host')}${req.url}`)
    }
  }
  next()
})
```

---

### 6️⃣ VALIDATION STRICTE (Déjà fait ✅)

```javascript
// ✅ Vous utilisez déjà Zod pour validation!
// Juste s'assurer que:
// - Tous les POST/PATCH/DELETE ont un schema Zod
// - Jamais de données nullables si pas nécessaire
// - Énums pour les enums (category, status, etc.)

const BookEquipmentSchema = z.object({
  item_id: z.string().uuid(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  payment_method: z.enum(['card', 'transfer']) // ✅ Enum!
})
```

---

## 🧪 TESTING

### SonarQube Scan

**Installer:**
```bash
npm install -D sonarqube-scanner
```

**Configurer `sonar-project.properties`:**
```properties
sonar.projectKey=outillio
sonar.projectName=Outillio
sonar.projectVersion=1.0.0
sonar.sources=src
sonar.exclusions=node_modules/**,build/**
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

**Lancer scan:**
```bash
npx sonar-scanner
```

---

### OWASP ZAP Pentest

**Installer OWASP ZAP:**
```bash
# macOS
brew install zaproxy

# Ou télécharger: https://www.zaproxy.org/
```

**Lancer pentest:**
```bash
zaproxy -cmd -quickurl http://localhost:3000 -quickout report.html
```

---

## ✅ CHECKLIST SÉCURITÉ

```
☐ Rate limiting implémenté (login + API)
☐ CSRF tokens générés et validés
☐ HttpOnly cookies configurés
☐ Security headers ajoutés (CSP, X-Frame-Options, etc.)
☐ HTTPS redirection en place
☐ Validation Zod stricte partout
☐ Password hashing (bcrypt) utilisé
☐ SQL injection protection (Supabase parameterized)
☐ XSS protection (sanitize inputs)
☐ SonarQube scan: Score A
☐ OWASP ZAP pentest: Pas de vulnérabilités critiques
☐ Documentation sécurité complète
```

---

## 📊 RÉSULTAT ATTENDU

**Avant (S5):**
- ❌ 5+ vulnérabilités trouvées
- ❌ SonarQube score: C/D
- ❌ No CSRF protection
- ❌ JWT en localStorage

**Après (S6):**
- ✅ 0 vulnérabilités critiques
- ✅ SonarQube score: A
- ✅ CSRF tokens + HttpOnly cookies
- ✅ Rate limiting + Security headers
- ✅ Conforme OWASP Top 10

---

**Status:** 📋 Plan préparé - Prêt à implémenter  
**Prochaine action:** Commencer par rate limiting + CSRF tokens
