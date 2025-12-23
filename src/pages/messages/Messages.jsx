import React, { useEffect, useState } from 'react';
import './Messages.css';

const parseQuery = () => {
  const q = new URLSearchParams(window.location.search);
  return { otherUser: q.get('other') };
};

const Messages = () => {
  const { otherUser } = parseQuery();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [me, setMe] = useState(null);

  useEffect(() => {
    const authRaw = localStorage.getItem('auth');
    if (!authRaw) return;
    const auth = JSON.parse(authRaw);
    setMe(auth.userId || null);
    if (!auth.userId || !otherUser) return;
    fetch(`/api/messages?userA=${auth.userId}&userB=${otherUser}`)
      .then(r => r.json())
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [otherUser]);

  const send = async () => {
    const authRaw = localStorage.getItem('auth');
    if (!authRaw) return alert('Connectez-vous (mock).');
    const auth = JSON.parse(authRaw);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: auth.userId,
          receiverId: otherUser,
          content: text
        })
      });
      const m = await res.json();
      setMessages(prev => [...prev, m]);
      setText('');
    } catch (e) {
      alert('Erreur (mock).');
    }
  };

  if (!otherUser) return <div className="messages-page"><p>Conversation non spécifiée (paramètre 'other').</p></div>;

  return (
    <div className="messages-page">
      <div className="messages-container">
        <h3>Conversation avec {otherUser}</h3>
        <div className="messages-list">
          {messages.map(m => (
            <div key={m.id} className={`message ${m.sender_id === me ? 'out' : 'in'}`}>
              <div className="message-text">{m.content}</div>
              <div className="message-meta">{new Date(m.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div className="composer">
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Écrire un message..." />
          <button className="btn-primary" onClick={send}>Envoyer</button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
