import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Charger le fichier .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

// Vérifier les variables critiques
const requiredEnvVars = ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️  ${envVar} non défini. Certaines fonctionnalités peuvent ne pas marcher.`);
  }
}

console.log('✅ Variables d\'env chargées');
