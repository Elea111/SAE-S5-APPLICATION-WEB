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

const OLLAMA_API = 'http://localhost:11434/api/generate';
const MODEL = 'neural-chat'; // ou 'llama2', 'mistral', etc.

class ChatService {
  /**
   * Chat principal
   * @param {string} message - Question de l'utilisateur
   * @param {string} userId - ID utilisateur pour contexte personnalisé
   * @returns {Promise<string>} Réponse IA
   */
  async chat(message, userId) {
    try {
      // ✅ Déterminer si on a besoin contexte BD
      const needsContext = this.needsSearchContext(message);
      
      let context = '';
      if (needsContext) {
        context = await this.buildContextFromDatabase(message, userId);
      }
      
      // ✅ Construire le prompt système
      const systemPrompt = this.buildSystemPrompt();
      
      // ✅ Construire prompt utilisateur enrichi
      const userPrompt = context 
        ? `Contexte Outillio:\n${context}\n\nQuestion: ${message}`
        : message;
      
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
      // Récupérer location utilisateur si possible
      const user = await di.userRepository.findById(userId);
      const userLocation = user?.location || 'France';
      
      // Chercher outils disponibles (top 5)
      const items = await di.itemRepository.search({
        limit: 5,
        sortBy: 'rating',
        available: true
      });
      
      if (items.length === 0) {
        return '';
      }
      
      // Formater les outils
      let context = `📍 Localisation: ${userLocation}\n\n`;
      context += '🔧 Outils disponibles:\n';
      
      items.forEach((item, idx) => {
        const rating = item.average_rating ? `⭐ ${item.average_rating}/5` : '⭐ Non noté';
        context += `${idx + 1}. ${item.name}\n`;
        context += `   Prix: ${item.price}€/jour | ${rating}\n`;
        context += `   Propriétaire: ${item.owner_name}\n\n`;
      });
      
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
    return `Tu es Assistant IA Outillio, une plateforme de location d'équipements entre professionnels.

Tes responsabilités:
- Répondre en FRANÇAIS aux questions sur Outillio
- Aider les utilisateurs à trouver des outils
- Donner des conseils sur les prix
- Expliquer comment utiliser la plateforme
- Recommander les meilleurs outils basés sur leurs besoins
- Diriger vers l'équipe support pour problèmes graves

Ton ton: Professionnel, sympa, concis.
Limite tes réponses à 2-3 phrases max.
Si tu ne sais pas, dis-le franchement.`;
  }

  /**
   * Appeler Ollama API
   */
  async callOllama(systemPrompt, userMessage) {
    try {
      console.log('🤖 Appel Ollama...');
      console.log('  Model:', MODEL);
      console.log('  Message:', userMessage.substring(0, 50) + '...');
      
      const payload = {
        model: MODEL,
        prompt: userMessage,
        system: systemPrompt,
        stream: false,
        temperature: 0.7,
        num_predict: 150, // Limiter à 150 tokens pour réponses courtes
      };
      
      const response = await fetch(OLLAMA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeout: 30000 // 30s timeout
      });
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }
      
      const data = await response.json();
      const botResponse = data.response?.trim() || 'Je n\'ai pas pu générer une réponse.';
      
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
