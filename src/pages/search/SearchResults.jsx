import React, { useEffect, useState } from 'react';
import './SearchResults.css';

const SAMPLE_SUGGESTIONS = ['perceuse', 'ponceuse', 'scie', 'marteau', 'ponceuse à bande'];

const SearchResults = () => {
  const [q, setQ] = useState(new URLSearchParams(window.location.search).get('q') || '');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState(SAMPLE_SUGGESTIONS);

  useEffect(() => {
    const doSearch = async () => {
      const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
      const res = await fetch(`${API_BASE}/api/equipments?q=${encodeURIComponent(q)}`);
      if (!res.ok) return setResults([]);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : (data.items || []));
    };
    if (q) doSearch();
  }, [q]);

  const selectSuggestion = (s) => {
    setQ(s);
    window.location.search = `?q=${encodeURIComponent(s)}`;
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher un outil (ex: perceuse)" />
        <button onClick={() => window.location.search = `?q=${encodeURIComponent(q)}`}>Rechercher</button>
      </div>

      <div className="suggestions">
        {suggestions.filter(s => (!q || s.includes(q))).map(s => (
          <button key={s} className="suggestion" onClick={() => selectSuggestion(s)}>{s}</button>
        ))}
      </div>

      <div className="results">
        {results.length === 0 ? <p>Aucun résultat</p> : results.map(r => (
          <div key={r.id} className="result-card">
            <h4>{r.title || r.name}</h4>
            <p>{r.description}</p>
            <button onClick={()=>window.location.href=`/equipments/${r.id}`}>Voir</button>
            <button onClick={()=>{ window.location.href=`/profil?userId=${r.ownerId || r.owner_id}` }}>Voir le propriétaire</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
