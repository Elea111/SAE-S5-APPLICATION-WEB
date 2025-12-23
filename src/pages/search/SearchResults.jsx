import React, { useEffect, useState } from 'react';
import './SearchResults.css';

const SearchResults = () => {
  const [q, setQ] = useState(new URLSearchParams(window.location.search).get('q') || '');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const doSearch = async () => {
      const res = await fetch(`${window.location.hostname === 'localhost' ? 'http://localhost:4000' : ''}/api/equipments?q=${encodeURIComponent(q)}`);
      if (!res.ok) return setResults([]);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : (data.items || []));
    };
    if (q) doSearch();
  }, [q]);

  return (
    <div className="search-page">
      <div className="search-header">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher un outil (ex: perceuse)" />
        <button onClick={() => window.location.search = `?q=${encodeURIComponent(q)}`}>Rechercher</button>
      </div>
      <div className="results">
        {results.length === 0 ? <p>Aucun résultat</p> : results.map(r => (
          <div key={r.id} className="result-card">
            <h4>{r.title || r.name}</h4>
            <p>{r.description}</p>
            <button onClick={()=>window.location.href=`/equipments/${r.id}`}>Voir</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
