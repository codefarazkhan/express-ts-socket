const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const app = express();
const server = http.createServer(app);

// Create Redis clients
const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

// Initialize Socket.IO with Redis adapter
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Connect Redis clients and setup adapter
Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  console.log('Redis adapter connected successfully');
}).catch(console.error);

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb+srv://root:root@cluster0.vrvpvgg.mongodb.net/socket-chat');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

const chatSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema);

const SECRET = 'your_secret_key';

// Store multiple socket connections by user ID using Redis
const REDIS_USER_SOCKETS_KEY = 'userSockets';

// Helper functions for Redis operations
const getUserSockets = async (userId) => {
  try {
    const sockets = await pubClient.sMembers(`${REDIS_USER_SOCKETS_KEY}:${userId}`);
    return sockets;
  } catch (error) {
    console.error('Error getting user sockets:', error);
    return [];
  }
};

const addUserSocket = async (userId, socketId) => {
  try {
    await pubClient.sAdd(`${REDIS_USER_SOCKETS_KEY}:${userId}`, socketId);
    console.log(`User ${userId} joined with socket ${socketId}`);
    const socketCount = await pubClient.sCard(`${REDIS_USER_SOCKETS_KEY}:${userId}`);
    console.log(`User ${userId} now has ${socketCount} active sessions`);
  } catch (error) {
    console.error('Error adding user socket:', error);
  }
};

const removeUserSocket = async (userId, socketId) => {
  try {
    await pubClient.sRem(`${REDIS_USER_SOCKETS_KEY}:${userId}`, socketId);
    const socketCount = await pubClient.sCard(`${REDIS_USER_SOCKETS_KEY}:${userId}`);
    
    if (socketCount === 0) {
      await pubClient.del(`${REDIS_USER_SOCKETS_KEY}:${userId}`);
      console.log(`User ${userId} has no more active sessions`);
    } else {
      console.log(`User ${userId} still has ${socketCount} active sessions`);
    }
  } catch (error) {
    console.error('Error removing user socket:', error);
  }
};

const removeSocketFromAllUsers = async (socketId) => {
  try {
    const keys = await pubClient.keys(`${REDIS_USER_SOCKETS_KEY}:*`);
    for (const key of keys) {
      const userId = key.split(':')[1];
      const isMember = await pubClient.sIsMember(key, socketId);
      if (isMember) {
        await removeUserSocket(userId, socketId);
        console.log(`Removed socket ${socketId} from user ${userId}`);
        break;
      }
    }
  } catch (error) {
    console.error('Error removing socket from all users:', error);
  }
};

setInterval(async () => {
  try {
    const keys = await pubClient.keys(`${REDIS_USER_SOCKETS_KEY}:*`);
    const userSockets = {};
    for (const key of keys) {
      const userId = key.split(':')[1];
      const sockets = await pubClient.sMembers(key);
      userSockets[userId] = sockets;
    }
    console.log("userSockets", userSockets);
  } catch (error) {
    console.error('Error logging user sockets:', error);
  }
}, 5000);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', async (userId) => {
    await addUserSocket(userId, socket.id);
    socket.join(`user:${userId}`);
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    await removeSocketFromAllUsers(socket.id);
  });
});

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Signup
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  
  // Check if username already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  
  const user = new User({ username, password });
  await user.save();
  res.json({ message: 'User created' });
});

// Signin
app.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id }, SECRET);
  res.json({ token });
});

// Get users except self
app.get('/users', authMiddleware, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.userId } }, { password: 0 });
  res.json(users);
});

// Send message
app.post('/chat', authMiddleware, async (req, res) => {
  const { receiverId, message } = req.body;
  
  if (!receiverId || !message) {
    return res.status(400).json({ message: 'Receiver ID and message are required' });
  }
  
  const chat = new Chat({
    senderId: req.userId,
    receiverId,
    message
  });

  
  await chat.save();

  // Populate the latest message
  const latestMessage = await Chat.findById(chat._id)
    .populate('senderId', 'username')
    .populate('receiverId', 'username');

  // Emit to all receiver's active sessions if online using room-based approach
  const receiverSockets = await getUserSockets(receiverId);
  if (receiverSockets.length > 0) {
    io.to(`user:${receiverId}`).emit('newMessage', latestMessage);
    console.log(`Message sent to ${receiverSockets.length} sessions of receiver ${receiverId}`);
  }
  
  // Emit to all sender's active sessions for confirmation using room-based approach
  const senderSockets = await getUserSockets(req.userId);
  if (senderSockets.length > 0) {
    io.to(`user:${req.userId}`).emit('messageSent', latestMessage);
    console.log(`Message confirmation sent to ${senderSockets.length} sessions of sender ${req.userId}`);
  }
  
  res.json({ message: 'Message sent successfully', chat: latestMessage });
});

// Get chat messages between current user and another user
app.get('/chat/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  
  const messages = await Chat.find({
    $or: [
      { senderId: req.userId, receiverId: userId },
      { senderId: userId, receiverId: req.userId }
    ]
  })
  .populate('senderId', 'username')
  .populate('receiverId', 'username')
  .sort({ timestamp: 1 });
  
  res.json(messages);
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
