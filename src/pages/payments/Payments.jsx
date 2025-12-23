import React, { useEffect, useState } from 'react';
import './Payments.css';

const Payments = () => {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  const userId = auth.userId;
  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
  const [list, setList] = useState([]);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE}/api/users/${userId}/payments`).then(r=>r.ok?r.json():[]).then(setList).catch(()=>setList([]));
  }, []);

  return (
    <div className="payments-page">
      <h2>Mes paiements</h2>
      {list.length === 0 ? <p>Aucun paiement</p> : (
        <ul>
          {list.map(p => (
            <li key={p.id}>{p.amount} {p.currency || 'EUR'} — {p.status} — {new Date(p.paid_at || p.created_at).toLocaleString()}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Payments;
