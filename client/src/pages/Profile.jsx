import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Profile() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem('forum_token');
      const res = await axios.get('http://localhost:5002/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccount(res.data);
    };
    fetchProfileData();
  }, []);

  if (!account) return <div style={{ color: '#fff', padding: '40px' }}>Decrypting signature tokens...</div>;

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '40px', borderRadius: '24px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <Link to="/dashboard" style={{ color: '#22d3ee', textDecoration: 'none', fontSize: '13px', display: 'block', textAlign: 'left', marginBottom: '20px', fontWeight: 'bold' }}>◀ Terminal Mainboard</Link>
        
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#1e1b4b', border: '2px solid #818cf8', color: '#818cf8', fontSize: '28px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px auto' }}>
          {account.username.substring(0,2).toUpperCase()}
        </div>

        <h2 style={{ margin: 0 }}>@{account.username}</h2>
        <p style={{ margin: '4px 0 24px 0', color: '#64748b', fontSize: '14px' }}>{account.email}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid #1e293b', paddingTop: '24px' }}>
          <div style={{ backgroundColor: '#020617', padding: '14px', borderRadius: '12px', border: '1px solid #1e293b' }}>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>System Title</span>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#34d399', display: 'block', marginTop: '4px' }}>{account.points >= 100 ? "Elite Vanguard" : "Novice Node"}</span>
          </div>
          <div style={{ backgroundColor: '#020617', padding: '14px', borderRadius: '12px', border: '1px solid #1e293b' }}>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Accumulated EXP</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#22d3ee', display: 'block', marginTop: '4px' }}>{account.points} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}