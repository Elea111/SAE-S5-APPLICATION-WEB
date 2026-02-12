import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

// Icône Robot SVG
const RobotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="16" rx="2"></rect>
    <path d="M8 6h8"></path>
    <path d="M8 12h8"></path>
    <circle cx="8" cy="18" r="2"></circle>
    <circle cx="16" cy="18" r="2"></circle>
  </svg>
);

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Bonjour! 👋 Je suis Assistant IA Outillio. Je peux répondre à vos questions et vous aider à naviguer la plateforme. Pour des questions spécifiques, contactez notre équipe via la messagerie de la plateforme.',
      sender: 'bot',
      timestamp: new Date(Date.now() - 10000)
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    { id: 1, text: 'Comment réserver un équipement ?' },
    { id: 2, text: 'Comment publier mon outil ?' },
    { id: 3, text: 'Comment fonctionne le paiement ?' },
    { id: 4, text: 'Est-ce sécurisé ?' }
  ];

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    // Ajouter le message utilisateur
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputValue('');

    // Appeler le backend pour la réponse IA
    try {
      const authRaw = localStorage.getItem('auth');
      const auth = authRaw ? JSON.parse(authRaw) : null;
      
      if (!auth || !auth.token) {
        const botMessage = {
          id: messages.length + 2,
          text: '❌ Vous devez être connecté pour utiliser le chat.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        return;
      }

      const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
      
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ message: inputValue })
      });

      if (!response.ok) {
        throw new Error('Erreur API');
      }

      const data = await response.json();
      const botMessage = {
        id: messages.length + 2,
        text: data.message || '❌ Pas de réponse',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Erreur chat:', err);
      const botMessage = {
        id: messages.length + 2,
        text: '⚠️ Erreur de connexion. Assurez-vous que Ollama est lancé (ollama serve).',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }
  };

  const handleQuickQuestion = async (question) => {
    const userMessage = {
      id: messages.length + 1,
      text: question,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);

    // Appeler le backend pour la réponse
    try {
      const authRaw = localStorage.getItem('auth');
      const auth = authRaw ? JSON.parse(authRaw) : null;
      
      if (!auth || !auth.token) {
        const botMessage = {
          id: messages.length + 2,
          text: '❌ Vous devez être connecté pour utiliser le chat.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        return;
      }

      const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
      
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ message: question })
      });

      if (!response.ok) {
        throw new Error('Erreur API');
      }

      const data = await response.json();
      const botMessage = {
        id: messages.length + 2,
        text: data.message || '❌ Pas de réponse',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Erreur chat:', err);
      const botMessage = {
        id: messages.length + 2,
        text: '⚠️ Erreur de connexion. Assurez-vous que Ollama est lancé (ollama serve).',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Bouton flottant */}
      <button 
        className="chatbot-toggle-btn"
        onClick={handleToggleChat}
        title="Assistant IA"
        aria-label="Ouvrir le chat"
      >
        <RobotIcon />
      </button>

      {/* Chat Widget */}
      <div className={`chatbot-container ${isOpen ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-left">
            <span className="chatbot-icon">
              <RobotIcon />
            </span>
            <span className="chatbot-title">Assistant IA Outillio</span>
          </div>
          <div className="chatbot-header-right">
            <button 
              className="chatbot-minimize-btn"
              onClick={handleToggleChat}
              title="Réduire"
            >
              ▲
            </button>
            <button 
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              title="Fermer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="message-content">
                <p>{msg.text}</p>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="chatbot-quick-questions">
            <p className="quick-questions-title">Questions fréquentes :</p>
            <div className="quick-questions-list">
              {quickQuestions.map((q) => (
                <button
                  key={q.id}
                  className="quick-question-btn"
                  onClick={() => handleQuickQuestion(q.text)}
                >
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="chatbot-input-area">
          <input
            type="text"
            className="chatbot-input"
            placeholder="Posez votre question ici..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <button 
            className="chatbot-send-btn"
            onClick={handleSendMessage}
            title="Envoyer"
          >
            ➤
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
