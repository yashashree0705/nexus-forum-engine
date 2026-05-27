import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

export default function ForumRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [topic, setTopic] = useState(null);
  
  const socketRef = useRef();
  const user = JSON.parse(localStorage.getItem('forum_user') || '{}');
  const token = localStorage.getItem('forum_token');

  useEffect(() => {
    // 1. Fetch channel info and existing historical database logs
    const bootstrapRoom = async () => {
      try {
        const headerConfig = { headers: { Authorization: `Bearer ${token}` } };
        const topicRes = await axios.get(`http://localhost:5002/api/topics/${id}`, headerConfig);
        setTopic(topicRes.data);

        const msgRes = await axios.get(`http://localhost:5002/api/messages/${id}`, headerConfig);
        setMessages(msgRes.data);
      } catch (err) {
        console.error('Handshake verification failed.', err);
        navigate('/dashboard');
      }
    };
    bootstrapRoom();

    // 2. Open bidirectional WebSockets Pipeline link
    socketRef.current = io('http://localhost:5002');
    socketRef.current.emit('joinRoom', id);

    // Receive live incoming message socket signals
    socketRef.current.on('incomingMessage', (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      // Direct message post packet dispatch
      await axios.post('http://localhost:5002/api/messages', { topicId: id, text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setText('');
    } catch (err) {
      console.error('Message payload drop.', err);
    }
  };

  if (!topic) return <div style={{color: '#fff', padding: '40px'}}>Decrypting stream lines...</div>;

  return (
    <div style={roomStyles.container}>
      <header style={roomStyles.header}>
        <button onClick={() => navigate('/dashboard')} style={roomStyles.backBtn}>← Terminal Hub</button>
        <div style={{textAlign: 'right'}}>
          <h2 style={{margin: 0, fontSize: '20px'}}>{topic.title}</h2>
          <p style={{margin: '4px 0 0 0', color: '#64748b', fontSize: '13px'}}>{topic.description}</p>
        </div>
      </header>

      {/* Real-time Message Stream Area */}
      <div style={roomStyles.chatWall}>
        {messages.map((msg, index) => {
          const isMe = msg.sender?._id === user._id || msg.sender === user._id;
          return (
            <div key={index} style={{
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: isMe ? 'flex-end' : 'flex-start',
              marginBottom: '16px'
            }}>
              <span style={{fontSize: '11px', color: '#64748b', marginBottom: '4px'}}>
                {msg.sender?.username || 'System Agent'}
              </span>
              <div style={{
                backgroundColor: isMe ? '#4f46e5' : '#1e293b',
                color: '#ffffff',
                padding: '12px 16px',
                borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                maxWidth: '60%',
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Form Dock */}
      <form onSubmit={handleSend} style={roomStyles.dockForm}>
        <input 
          type="text" placeholder="Type encrypted transmission message..." required style={roomStyles.dockInput}
          value={text} onChange={e => setText(e.target.value)}
        />
        <button type="submit" style={roomStyles.sendBtn}>Transmit</button>
      </form>
    </div>
  );
}

const roomStyles = {
  container: { backgroundColor: '#020617', minHeight: '100vh', color: '#ffffff', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid #1e293b', backgroundColor: '#0f172a' },
  backBtn: { backgroundColor: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' },
  chatWall: { flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  dockForm: { padding: '20px 40px', backgroundColor: '#0f172a', borderTop: '1px solid #1e293b', display: 'flex', gap: '16px' },
  dockInput: { flex: 1, backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '12px', padding: '16px', color: '#ffffff', fontSize: '14px', outline: 'none' },
  sendBtn: { backgroundColor: '#0891b2', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '0 24px', fontWeight: 'bold', cursor: 'pointer' }
};