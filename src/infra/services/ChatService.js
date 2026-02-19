/**
 * ChatService - Gestion de l'IA avec Ollama
 * 
 * Logique:
 * 1. Récupérer contexte BD si nécessaire (outils, prix, avis)
 * 2. Construire prompt enrichi
 * 3. Appeler Ollama (localhost:11434)
 * 4. Retourner réponse
 */

import di from '../../boot/di.js';
import supabase from '../database/supabaseClient.js';

const OLLAMA_API = 'http://localhost:11434/api/generate';
const MODEL = 'mistral'; // Mistral: meilleur modèle, réponses de qualité

class ChatService {
  /**
   * Chat principal
   * @param {string} message - Question de l'utilisateur
   * @param {string} userId - ID utilisateur pour contexte personnalisé
   * @returns {Promise<string>} Réponse IA
   */
  async chat(message, userId) {
    try {
      // ✅ Determiner si on a besoin contexte BD
      const needsContext = this.needsSearchContext(message);
      
      let context = '';
      if (needsContext) {
        context = await this.buildContextFromDatabase(message, userId);
        if (context) {
          console.log('✅ Contexte BD trouvé');
        } else {
          console.log('⚠️ Pas d\'outils trouvés en BD');
        }
      }
      
      // ✅ Construire le prompt système
      const systemPrompt = this.buildSystemPrompt();
      
      // ✅ Construire prompt utilisateur enrichi
      let userPrompt = message;
      if (context) {
        userPrompt = `Outils disponibles Outillio:\n${context}\n---\nClient demande: ${message}\n\nRECOMMENDE UNIQUEMENT les outils ci-dessus.`;
      } else if (needsContext) {
        userPrompt = `Pas d'outils disponibles maintenant.\n\nClient: ${message}\n\nRéponds: "Aucun outil disponible présentement"`;
      }
      
      // ✅ Appeler Ollama
      const response = await this.callOllama(systemPrompt, userPrompt);
      
      return response;
    } catch (error) {
      console.error('❌ Erreur ChatService:', error);
      return 'Désolé, une erreur s\'est produite. Merci de réessayer.';
    }
  }

  /**
   * Déterminer si la question nécessite contexte BD
   */
  needsSearchContext(message) {
    const keywords = [
      'outil', 'équipement', 'cherch', 'prix', 'disponible',
      'catégorie', 'location', 'loer', 'avis', 'note',
      'location', 'publier', 'réserver', 'recommand'
    ];
    
    const lowerMsg = message.toLowerCase();
    return keywords.some(keyword => lowerMsg.includes(keyword));
  }

  /**
   * Récupérer contexte depuis la BD
   */
  async buildContextFromDatabase(message, userId) {
    try {
      // Requête Supabase: récupérer équipements disponibles
      const { data: items, error } = await supabase
        .from('items')
        .select(`
          id,
          title,
          description,
          daily_price,
          user_id,
          is_available
        `)
        .eq('is_available', true)
        .limit(5);
      
      if (error) {
        console.error('Erreur requête BD:', error);
        return '';
      }
      
      if (!items || items.length === 0) {
        console.log('⚠️ Aucun équipement disponible');
        return '';
      }
      
      console.log(`✅ ${items.length} équipements trouvés`);
      
      // Formater les outils
      let context = '🔧 Équipements disponibles Outillio:\n';
      
      items.forEach((item, idx) => {
        const price = item.daily_price ? `${item.daily_price}€` : 'Prix à confirmer';
        context += `${idx + 1}. ${item.title}\n`;
        context += `   💰 ${price}/jour\n`;
      });
      
      context += '\n→ Ces outils sont disponibles maintenant sur Outillio';
      return context;
    } catch (error) {
      console.error('Erreur récupération contexte BD:', error);
      return '';
    }
  }

  /**
   * Construire le prompt système
   */
  buildSystemPrompt() {
    return `Tu es assistant client Outillio - plateforme de location d'outils.

RÈGLES STRICTES:
1. FRANÇAIS uniquement - JAMAIS anglais
2. RECOMMANDE UNIQUEMENT les outils du contexte donné
3. Si pas d'outils dans le contexte: "Aucun outil disponible maintenant, réessayez plus tard"
4. Réponses courtes (2-3 phrases max)
5. Ignore questions hors-sujet

Action: Recommande par nom + prix/jour + propriétaire`;
  }

  /**
   * Appeler Ollama API
   */
  async callOllama(systemPrompt, userMessage) {
    try {
      console.log('🤖 Appel Ollama...');
      console.log('  Model:', MODEL);
      console.log('  Message:', userMessage.substring(0, 50) + '...');
      
      // Utiliser /api/chat pour meilleure gestion du system prompt
      const payload = {
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        stream: false,
        temperature: 0.2, // Très bas: réponses déterministes
        num_predict: 80, // Court: max 80 tokens
      };
      
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeout: 30000 // 30s timeout
      });
      
      if (!response.ok) {
        // Gestion spéciale du 404 (modèle non trouvé)
        if (response.status === 404) {
          console.error(`❌ Modèle '${MODEL}' non trouvé. Veuillez le télécharger.`);
          return `⚠️ Le modèle IA '${MODEL}' n'est pas installé. Téléchargez-le avec:\n\n$ ollama pull ${MODEL}`;
        }
        throw new Error(`Ollama API error: ${response.status}`);
      }
      
      const data = await response.json();
      // /api/chat retourne {message: {content: "...", role: "assistant"}}
      const botResponse = data.message?.content?.trim() || 'Je n\'ai pas pu générer une réponse.';
      
      console.log('✅ Réponse Ollama reçue');
      return botResponse;
    } catch (error) {
      console.error('❌ Erreur appel Ollama:', error);
      
      // Fallback: vérifier si Ollama est lancé
      if (error.message.includes('ECONNREFUSED')) {
        return '⚠️ Assistant IA hors ligne. Assurez-vous que Ollama est lancé (ollama serve ou interface Ollama).';
      }
      
      throw error;
    }
  }
}

export default new ChatService();
