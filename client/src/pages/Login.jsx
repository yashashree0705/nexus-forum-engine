import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5002/api/auth/login', creds);
      localStorage.setItem('forum_token', response.data.token);
      localStorage.setItem('forum_user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Access authorization rejected.');
    }
  };

  return (
    <div style={ui.container}>
      <div style={ui.card}>
        <div style={ui.badgePurple}>CORE MATRIX AUTH</div>
        <h2 style={ui.title}>Nexus Entry Portal</h2>
        {error && <div style={ui.error}>{error}</div>}
        <form onSubmit={handleAuth} style={ui.form}>
          <input type="email" placeholder="Terminal Account Email" required style={ui.input} value={creds.email} onChange={e => setCreds({...creds, email: e.target.value})} />
          <input type="password" placeholder="Passphrase Code" required style={ui.input} value={creds.password} onChange={e => setCreds({...creds, password: e.target.value})} />
          <button type="submit" style={ui.btnCyan}>Decrypt Dashboard Stream</button>
        </form>
        <p style={ui.footer}>New user node? <Link to="/register" style={ui.link}>Initialize Profile Grid</Link></p>
      </div>
    </div>
  );
}

const ui = {
  container: { backgroundColor: '#020617', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' },
  card: { backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '40px', borderRadius: '24px', maxWidth: '380px', width: '100%', textAlign: 'center' },
  badgePurple: { display: 'inline-block', backgroundColor: '#311042', color: '#c084fc', fontSize: '10px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '6px', marginBottom: '16px', letterSpacing: '0.5px' },
  title: { color: '#ffffff', margin: '0 0 24px 0', fontSize: '26px', fontWeight: '800' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  input: { backgroundColor: '#020617', border: '1px solid #334155', color: '#fff', padding: '12px 16px', borderRadius: '10px', outline: 'none' },
  btnCyan: { backgroundColor: '#0891b2', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  error: { backgroundColor: '#451a03', color: '#f87171', border: '1px solid #7c2d12', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  footer: { color: '#64748b', fontSize: '13px', marginTop: '24px', margin: '24px 0 0 0' },
  link: { color: '#22d3ee', textDecoration: 'none', fontWeight: 'bold' }
};