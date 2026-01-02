import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import './Messages.css';

const Messages = () => {
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [me, setMe] = useState(null);
  const [otherUserData, setOtherUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  
  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  const loadConversations = async () => {
    const authRaw = localStorage.getItem('auth');
    if (!authRaw) return;
    const auth = JSON.parse(authRaw);
    
    try {
      // Récupérer les conversations depuis le backend
      const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
      const response = await fetch(`${API_BASE}/api/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur chargement conversations: ' + response.status);
      }
      
      const convos = await response.json();
      console.log('📬 Conversations reçues:', convos);
      
      // Charger les infos de chaque utilisateur
      const convosWithInfo = await Promise.all(
        convos.map(async (conv) => {
          try {
            const userRes = await fetch(`${API_BASE}/api/users/${conv.userId}/public`);
            if (userRes.ok) {
              const userData = await userRes.json();
              return {
                userId: conv.userId,
                userName: `${userData.first_name} ${userData.last_name}`,
                avatar: userData.avatar_url,
                lastMessage: conv.lastMessage,
                unreadCount: conv.unreadCount
              };
            }
          } catch (err) {
            console.error('❌ Erreur chargement utilisateur:', err);
          }
          return null;
        })
      );
      
      setConversations(convosWithInfo.filter(c => c !== null));
      console.log('✅ Conversations avec infos:', convosWithInfo);
    } catch (err) {
      console.error('❌ Erreur chargement conversations:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    // ✅ RÉCUPÉRER otherUser DEPUIS L'URL À CHAQUE CHANGEMENT
    const params = new URLSearchParams(window.location.search);
    const other = params.get('other');
    setOtherUser(other);
    setLoading(true);
    
    // Si aucun otherUser, charger les conversations récentes
    if (!other) {
      loadConversations();
    }
  }, []);

  useEffect(() => {
    if (!otherUser) return;
    
    const authRaw = localStorage.getItem('auth');
    if (!authRaw) return;
    const auth = JSON.parse(authRaw);
    const currentUserId = auth.userId || auth.id;
    setMe(currentUserId);
    
    console.log('📍 Messages - Current User:', currentUserId, '| Other User:', otherUser);
    
    setLoading(true);
    
    Promise.all([
      // 1️⃣ Charger les infos de l'utilisateur
      fetch(`${API_BASE}/api/users/${otherUser}/public`)
        .then(r => r.json())
        .then(user => {
          console.log('✅ Utilisateur chargé:', user);
          setOtherUserData(user);
        })
        .catch(err => {
          console.error('❌ Erreur chargement utilisateur:', err);
          setOtherUserData(null);
        }),
      
      // 2️⃣ Charger les messages
      fetch(`${API_BASE}/api/messages?userA=${currentUserId}&userB=${otherUser}`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      })
        .then(r => {
          if (!r.ok) throw new Error('Erreur chargement messages: ' + r.status);
          return r.json();
        })
        .then(data => {
          console.log('📦 Messages reçus:', data);
          const msgs = Array.isArray(data) ? data : (data.data || []);
          setMessages(msgs);
        })
        .catch(err => {
          console.error('❌ Erreur messages:', err);
          setMessages([]);
        })
    ]).finally(() => setLoading(false));
  }, [otherUser, API_BASE]);

  const send = async () => {
    if (!text.trim()) return;
    
    const authRaw = localStorage.getItem('auth');
    if (!authRaw) return alert('Connectez-vous.');
    const auth = JSON.parse(authRaw);
    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          receiver_id: otherUser,
          content: text
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        alert(`Erreur: ${err.message}`);
        return;
      }
      
      const m = await res.json();
      setMessages(prev => [...prev, m]);
      setText('');
    } catch (e) {
      console.error('Erreur envoi message:', e);
      alert('Erreur lors de l\'envoi du message.');
    }
  };

  if (!otherUser) {
    return (
      <>
        <Header />
        <div className="messages-page">
          <div className="messages-container">
            <div className="conversations-list">
              <h2>📬 Mes conversations</h2>
              
              {loading ? (
                <p className="loading">⏳ Chargement...</p>
              ) : conversations.length === 0 ? (
                <div className="no-conversations">
                  <p>Aucune conversation pour le moment</p>
                  <p className="hint">Vos conversations apparaîtront ici après avoir réservé ou offert un objet 💬</p>
                </div>
              ) : (
                <div className="conv-list">
                  {conversations.map(conv => (
                    <div 
                      key={conv.userId} 
                      className="conversation-item"
                      onClick={() => window.location.href = `/messages?other=${conv.userId}`}
                      style={{ cursor: 'pointer' }}
                    >
                      {conv.avatar && (
                        <img src={conv.avatar} alt="avatar" className="conv-avatar" />
                      )}
                      <div className="conv-info">
                        <h3>{conv.userName}</h3>
                      </div>
                      <span className="arrow">→</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="messages-page">
          <div className="messages-container">
            <p>⏳ Chargement...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="messages-page">
        <div className="messages-container">
          
          {/* ✅ HEADER AVEC INFOS DU PROPRIO */}
          <div className="conversation-header">
            {otherUserData?.avatar_url && (
              <img src={otherUserData.avatar_url} alt="avatar" className="user-avatar" />
            )}
            <div className="user-info">
              <h2 className="user-name">
                {otherUserData?.first_name} {otherUserData?.last_name}
              </h2>
              <div className="user-meta">
                {otherUserData?.rating && (
                  <span className="user-rating">⭐ {otherUserData.rating.toFixed(1)}</span>
                )}
                {otherUserData?.review_count !== undefined && (
                  <span className="review-count">({otherUserData.review_count} avis)</span>
                )}
              </div>
            </div>
          </div>

          {/* ✅ LISTE DES MESSAGES */}
          <div className="messages-list">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>Aucun message pour le moment</p>
                <p className="hint">Commencez la conversation 👋</p>
              </div>
            ) : (
              messages.map(m => (
                <div key={m.id} className={`message ${m.sender_id === me ? 'sent' : 'received'}`}>
                  <div className="message-bubble">
                    <div className="message-text">{m.content}</div>
                    <div className="message-time">
                      {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ✅ FORMULAIRE D'ENVOI */}
          <div className="message-composer">
            <textarea 
              value={text} 
              onChange={e => setText(e.target.value)}
              placeholder="Écrivez votre message..."
              className="message-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button 
              className="send-btn" 
              onClick={send}
              disabled={!text.trim()}
            >
              📤 Envoyer
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Messages;
