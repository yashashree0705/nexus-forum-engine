require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

// Route Packets
const authRoutes = require('./routes/authRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const commentRoutes = require('./routes/commentRoutes');
const Message = require('./models/Message');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// Bind REST Enclaves
app.use('/api/auth', authRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/comments', commentRoutes);

// History Log Sync Gateway Endpoint
app.get('/api/messages/:discussionId', async (req, res) => {
  try {
    const historicalLogs = await Message.find({ discussionId: req.params.discussionId }).populate('sender', 'username level badge');
    res.json(historicalLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const server = http.createServer(app);
// Bind real-time WebSockets structure over HTTP core interface port
const io = new Server(server, { cors: { origin: "*" } });

connectDB();

// Global active connections map tracking object
// Global active trackers mapped by socket ID
let socketUsersMap = {};

io.on('connection', (socket) => {
  console.log('📡 New hardware node linked to socket pipeline ID:', socket.id);
  
  socket.on('joinRoom', ({ roomId, username }) => {
    socket.join(roomId);
    
    // Explicitly bind username tracking variables to this precise socket instance ID
    socketUsersMap[socket.id] = { roomId, username: username || 'Agent_Node' };
    
    // Recalculate how many unique active agents are sitting inside this room vector
    const activeInThisRoom = Object.values(socketUsersMap)
      .filter(agent => agent.roomId === roomId)
      .map(agent => agent.username);

    // 1. Broadcast an explicit welcome text alert notification down the wire to EVERYONE ELSE
    socket.to(roomId).emit('notification', { 
      message: `🔔 Alert: Node @${username || 'Agent'} has initialized stream synchronization.` 
    });

    // 2. FORCE immediate sync update down the wire back to EVERYONE inside the room to update user counters
    io.to(roomId).emit('updateOnlineStatus', activeInThisRoom);
  });

  socket.on('sendMessage', async ({ discussionId, senderId, text }) => {
    try {
      const msg = new Message({ discussionId, sender: senderId, text });
      await msg.save();
      
      // Award communication XP parameters directly to user document profile configuration
      const updatedUser = await User.findByIdAndUpdate(senderId, { $inc: { points: 2 } }, { new: true });

      const distributedMsg = await msg.populate('sender', 'username level badge');
      io.to(discussionId).emit('incomingMessage', distributedMsg);
      
      // Update xp metrics values across terminals instantly
      io.to(discussionId).emit('xpMetricUpdate', { userId: senderId, newPoints: updatedUser.points });
    } catch (err) {
      console.error('Socket messaging drop anomaly:', err);
    }
  });

  // CRITICAL NOTIFICATION EMITTER HOOK
  socket.on('newCommentPosted', ({ roomId, username }) => {
    console.log(`💬 Notification trigger intercepted from @${username} inside room ${roomId}`);
    // Broadcast notification metrics down out to everyone else currently viewing this terminal section
    socket.to(roomId).emit('notification', { 
      message: `💬 New Reply: @${username} just posted a structured comment block in this thread!` 
    });
  });

  socket.on('typing', ({ roomId, username, isTyping }) => {
    socket.to(roomId).emit('agentTypingState', { username, isTyping });
  });

  socket.on('disconnect', () => {
    const disconnectedAgent = socketUsersMap[socket.id];
    if (disconnectedAgent) {
      const { roomId, username } = disconnectedAgent;
      delete socketUsersMap[socket.id];
      
      // Re-compile active room arrays post-disconnection event mapping loop
      const remainingAgents = Object.values(socketUsersMap)
        .filter(agent => agent.roomId === roomId)
        .map(agent => agent.username);
        
      io.to(roomId).emit('updateOnlineStatus', remainingAgents);
    }
    console.log('🔌 Socket pipeline link terminated safely:', socket.id);
  });
});
  

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => console.log(`Trackflow Core Server Online on Local Interface Port: ${PORT}`));