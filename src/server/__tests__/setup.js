/**
 * Setup global pour les tests Node.js/Jest
 * Charge les polyfills fetch AVANT toute autre import
 */

import dotenv from 'dotenv';
import * as crossFetch from 'cross-fetch';

// Charger les variables d'env
dotenv.config();

// Polyfills globaux pour Node.js
global.fetch = crossFetch.default;
global.Headers = crossFetch.Headers;
global.Request = crossFetch.Request;
global.Response = crossFetch.Response;
