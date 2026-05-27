import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function CreateDiscussion() {
  const [fields, setFields] = useState({ title: '', description: '', category: 'Tech Pipeline' });
  const navigate = useNavigate();

  const handlePublish = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('forum_token');
      await axios.post('http://localhost:5002/api/discussions', fields, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/dashboard');
    } catch(err) { 
      console.error('Publish connection fail.', err); 
    }
  };

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '40px', borderRadius: '24px', maxWidth: '500px', width: '100%' }}>
        <Link to="/dashboard" style={{ color: '#22d3ee', textDecoration: 'none', display: 'block', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' }}>◀ Cancel Vector Deployment</Link>
        <h2 style={{ margin: '0 0 24px 0', fontWeight: '800' }}>Deploy Discussion Stream Pipeline</h2>
        <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" placeholder="Topic Hub Title" required style={ui.input} value={fields.title} onChange={e => setFields({...fields, title: e.target.value})} />
          <textarea placeholder="Parameter description specifications structural mapping rules..." required rows="4" style={{ ...ui.input, fontFamily: 'sans-serif', resize: 'none' }} value={fields.description} onChange={e => setFields({...fields, description: e.target.value})} />
          <select style={ui.input} value={fields.category} onChange={e => setFields({...fields, category: e.target.value})}>
            <option value="Tech Pipeline">Tech Pipeline</option>
            <option value="Career Track">Career Track</option>
            <option value="Sandbox Lounge">Sandbox Lounge</option>
          </select>
          <button type="submit" style={{ ...ui.btnCyan, backgroundColor: '#4f46e5' }}>Broadcast Topic Vector Live (+15 XP)</button>
        </form>
      </div>
    </div>
  );
}

// Declaring the style dictionary locally inside this file to fix the reference crash
const ui = {
  input: { backgroundColor: '#020617', border: '1px solid #334155', color: '#fff', padding: '12px 16px', borderRadius: '10px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  btnCyan: { backgroundColor: '#0891b2', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', width: '100%' }
};