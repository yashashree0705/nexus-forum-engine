import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

export default function DiscussionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [chatText, setChatText] = useState('');
  const [alert, setAlert] = useState('');
  const [typingAgent, setTypingAgent] = useState('');
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create a reactive state mapping container specifically for tracking points live on screen
  const [currentUserPoints, setCurrentUserPoints] = useState(0);

  const socketRef = useRef();
  const token = localStorage.getItem('forum_token');
  const user = JSON.parse(localStorage.getItem('forum_user') || '{}');

  useEffect(() => {
    const fetchCorePayloads = async () => {
      try {
        setLoading(true);
        const headers = { headers: { Authorization: `Bearer ${token}` } };
        
        const topicData = await axios.get(`http://localhost:5002/api/discussions/${id}`);
        setTopic(topicData.data);

        const commentsData = await axios.get(`http://localhost:5002/api/comments/${id}`);
        setComments(commentsData.data);

        const chatHistory = await axios.get(`http://localhost:5002/api/messages/${id}`);
        setMessages(chatHistory.data);
        
        // Load the initial points values out of local storage state matrices safely
        setCurrentUserPoints(user.points || 0);
        setLoading(false);
      } catch (err) {
        console.error("Error loading terminal workspace pipelines:", err);
        setLoading(false);
      }
    };

    if (id) {
      fetchCorePayloads();

      // Establish WebSocket connection
      socketRef.current = io('http://localhost:5002');
      
      // Emit connection data packet down pipeline array
      socketRef.current.emit('joinRoom', { roomId: id, username: user.username || 'AgentNode' });

      socketRef.current.on('incomingMessage', (msg) => {
        setMessages(prev => [...prev, msg]);
      });

      // HEAR ALERT BROADCAST ENGINES
      socketRef.current.on('notification', (data) => {
        console.log("🔔 Notification payload landed:", data);
        setAlert(data.message);
        setTimeout(() => setAlert(''), 4000); // Display for exactly 4 seconds
      });

      socketRef.current.on('agentTypingState', (data) => {
        if (data.isTyping) {
          setTypingAgent(`Agent @${data.username} is compiling transmission packet...`);
        } else {
          setTypingAgent('');
        }
      });

      socketRef.current.on('updateOnlineStatus', (agentsList) => {
        console.log("🟢 Live agent telemetry updated map sync:", agentsList);
        setRoster(agentsList);
      });

      socketRef.current.on('xpMetricUpdate', (data) => {
        if (data.userId === user._id) {
          setCurrentUserPoints(data.newPoints);
          // Sync changes deep into local storage system vectors
          const updatedStorageObj = { ...user, points: data.newPoints };
          localStorage.setItem('forum_user', JSON.stringify(updatedStorageObj));
        }
      });
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [id]);

  const pushComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await axios.post(`http://localhost:5002/api/comments/${id}`, { content: commentText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setComments(prev => [...prev, res.data]);
      
      // EMIT NOTIFICATION ACTION EVENT LOOP
      socketRef.current.emit('newCommentPosted', { roomId: id, username: user.username });
      
      // Add +5 XP instantly on screen and sync profile state vectors
      const updatedPoints = currentUserPoints + 5;
      setCurrentUserPoints(updatedPoints);
      localStorage.setItem('forum_user', JSON.stringify({ ...user, points: updatedPoints }));

      setCommentText('');
    } catch (err) {
      console.error("Failed to append comment matrix data:", err);
    }
  };

  const pushChatMessage = async (e) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    socketRef.current.emit('sendMessage', { discussionId: id, senderId: user._id, text: chatText });
    socketRef.current.emit('typing', { roomId: id, username: user.username, isTyping: false });
    
    // Add +2 XP instantly on screen for sending chat packets
    const updatedPoints = currentUserPoints + 2;
    setCurrentUserPoints(updatedPoints);
    localStorage.setItem('forum_user', JSON.stringify({ ...user, points: updatedPoints }));

    setChatText('');
  };

  const watchTyping = (value) => {
    setChatText(value);
    socketRef.current.emit('typing', { roomId: id, username: user.username, isTyping: value.length > 0 });
  };

  const calculateLevel = (score) => {
    return Math.floor(score / 20) + 1; // Elevates level tier every time user logs 20 accumulated XP points
  };

  if (loading || !topic) {
    return (
      <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#22d3ee', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', fontWeight: 'bold' }}>
        🔄 SYNCHRONIZING COMMUNICATION CHANNELS...
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      
      {/* GLOBAL SYSTEM NOTIFICATION RIBBON ELEMENT */}
      {alert && (
        <div style={{ backgroundColor: '#1e1b4b', borderBottom: '2px solid #22d3ee', padding: '14px 40px', color: '#22d3ee', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', transition: 'all 0.3s' }}>
          {alert}
        </div>
      )}
      
      <header style={{ padding: '20px 40px', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/dashboard')} style={{ color: '#94a3b8', textDecoration: 'none', background: 'none', border: '1px solid #334155', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>◀ Terminal Mainboard</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right', backgroundColor: '#070a13', border: '1px solid #334155', padding: '6px 14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>MY TELEMETRY RANK</span>
            <span style={{ color: '#22d3ee', fontWeight: 'bold', fontSize: '13px' }}>Lvl {calculateLevel(currentUserPoints)} Node ({currentUserPoints} XP)</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', backgroundColor: '#1e1b4b', color: '#818cf8', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{topic.category || "General Pipeline"}</span>
            <h2 style={{ margin: '6px 0 0 0', color: '#fff', fontSize: '18px' }}>{topic.title}</h2>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: '#1e293b', gap: '1px' }}>
        
        {/* Module A: Threaded Forum Post & Comments Platform */}
        <div style={{ backgroundColor: '#020617', padding: '40px', overflowY: 'auto' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#cbd5e1', lineHeight: '1.6' }}>{topic.description}</p>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Vector Originator: @{topic.creator ? topic.creator.username : 'Unknown Agent'} [Lvl {topic.creator ? calculateLevel(topic.creator.points || 0) : 1}]
            </span>
          </div>

          <h3 style={{ borderBottom: '1px solid #1e293b', paddingBottom: '8px', color: '#94a3b8', fontSize: '14px', textTransform: 'uppercase' }}>Structured Comments Matrix</h3>
          <form onSubmit={pushComment} style={{ display: 'flex', gap: '12px', margin: '20px 0' }}>
            <input type="text" placeholder="Compile reply block..." required style={ui.input} value={commentText} onChange={e => setCommentText(e.target.value)} />
            <button type="submit" style={{ ...ui.btnCyan, backgroundColor: '#064e3b', color: '#34d399', padding: '0 20px', width: 'auto' }}>Submit (+5 XP)</button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {comments.map(c => (
              <div key={c._id} style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '16px', borderRadius: '12px' }}>
                <span style={{ color: '#22d3ee', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                  @{c.author ? c.author.username : 'Agent'} [Lvl {c.author ? calculateLevel(c.author.points || 0) : 1}]
                </span>
                <p style={{ margin: 0, fontSize: '14px', color: '#e2e8f0' }}>{c.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Module B: Socket.IO Instant Real-Time Chat Infrastructure Terminal */}
        <div style={{ backgroundColor: '#020617', padding: '40px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ color: '#94a3b8', margin: 0, fontSize: '14px', textTransform: 'uppercase' }}>Live Synchronization Radio Feed</h3>
            <span style={{ fontSize: '13px', color: '#34d399', fontWeight: 'bold', backgroundColor: '#064e3b', padding: '4px 12px', borderRadius: '6px' }}>🟢 Active Users: {roster.length}</span>
          </div>
          
          <div style={{ flex: 1, backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '300px' }}>
            {messages.map((m, idx) => {
              const senderObjId = m.sender?._id || m.sender;
              const mine = senderObjId === user._id;
              return (
                <div key={idx} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block', textAlign: mine ? 'right' : 'left', marginBottom: '2px' }}>@{m.sender?.username || 'System Agent'}</span>
                  <div style={{ backgroundColor: mine ? '#4f46e5' : '#1e293b', padding: '10px 14px', borderRadius: '12px', fontSize: '14px', color: '#fff' }}>{m.text}</div>
                </div>
              );
            })}
          </div>
          
          {typingAgent && <div style={{ color: '#a78bfa', fontSize: '12px', margin: '8px 0 4px 4px', fontStyle: 'italic' }}>{typingAgent}</div>}
          
          <form onSubmit={pushChatMessage} style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <input type="text" placeholder="Type transmission wire matrix packet text..." required style={ui.input} value={chatText} onChange={e => watchTyping(e.target.value)} />
            <button type="submit" style={{ ...ui.btnCyan, padding: '0 24px', width: 'auto' }}>Transmit</button>
          </form>
        </div>

      </div>
    </div>
  );
}

const ui = {
  input: { backgroundColor: '#020617', border: '1px solid #334155', color: '#fff', padding: '12px 16px', borderRadius: '10px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  btnCyan: { backgroundColor: '#0891b2', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }
};