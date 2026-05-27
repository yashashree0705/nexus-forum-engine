import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const [topics, setTopics] = useState([]);
  const user = JSON.parse(localStorage.getItem('forum_user') || '{}');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      const res = await axios.get('http://localhost:5002/api/discussions');
      setTopics(res.data);
    };
    fetchListings();
  }, []);

  const upvote = async (id) => {
    try {
      const token = localStorage.getItem('forum_token');
      await axios.post(`http://localhost:5002/api/discussions/${id}/upvote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh state values live
      const res = await axios.get('http://localhost:5002/api/discussions');
      setTopics(res.data);
    } catch(err) { console.log('Vote action redundant.'); }
  };

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '20px', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: '900' }}>TRACKFLOW NEXUS FEED</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Operator: <Link to="/profile" style={{ color: '#22d3ee', textDecoration: 'none', fontWeight: 'bold' }}>@{user.username}</Link></p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/create-discussion" style={{ backgroundColor: '#4f46e5', color: '#fff', textDecoration: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', display: 'inline-block' }}>+ Forge Discussion Channel</Link>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} style={{ backgroundColor: '#1e1b4b', border: '1px solid #311042', color: '#f87171', padding: '0 16px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Disconnect</button>
        </div>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ textTransform: 'uppercase', fontSize: '13px', color: '#94a3b8', letterSpacing: '1px' }}>Active Topic Vectors</h3>
        {topics.map(t => (
          <div key={t._id} style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', backgroundColor: '#020617', border: '1px solid #334155', padding: '10px', borderRadius: '10px', minWidth: '40px' }}>
              <button onClick={() => upvote(t._id)} style={{ background: 'none', border: 'none', color: '#22d3ee', cursor: 'pointer', fontSize: '18px' }}>▲</button>
              <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{t.upvotes?.length || 0}</div>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '11px', backgroundColor: '#1e1b4b', color: '#818cf8', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold' }}>{t.category}</span>
              <h3 style={{ margin: '10px 0 6px 0', fontSize: '20px' }}><Link to={`/discussion/${t._id}`} style={{ color: '#fff', textDecoration: 'none' }}>{t.title}</Link></h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>{t.description}</p>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '12px' }}>Deployed by @{t.creator?.username} [Lvl {t.creator?.level || 1}]</span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}