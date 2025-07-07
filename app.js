const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

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

// Store multiple socket connections by user ID (one user can have multiple sessions)
const userSockets = new Map(); // userId -> Set of socketIds

setInterval(() => {
  console.log("userSockets", userSockets);
}, 5000);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (userId) => {
    // Initialize the set if it doesn't exist for this user
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    
    // Add this socket to the user's set of sockets
    userSockets.get(userId).add(socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
    console.log(`User ${userId} now has ${userSockets.get(userId).size} active sessions`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove socket from all users' socket sets
    for (const [userId, socketSet] of userSockets.entries()) {
      if (socketSet.has(socket.id)) {
        socketSet.delete(socket.id);
        console.log(`Removed socket ${socket.id} from user ${userId}`);
        
        // If user has no more active sockets, remove the user entry
        if (socketSet.size === 0) {
          userSockets.delete(userId);
          console.log(`User ${userId} has no more active sessions`);
        } else {
          console.log(`User ${userId} still has ${socketSet.size} active sessions`);
        }
        break;
      }
    }
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

  // Emit to all receiver's active sessions if online
  const receiverSocketSet = userSockets.get(receiverId);
  if (receiverSocketSet && receiverSocketSet.size > 0) {
    receiverSocketSet.forEach(socketId => {
      io.to(socketId).emit('newMessage', latestMessage);
    });
    console.log(`Message sent to ${receiverSocketSet.size} sessions of receiver ${receiverId}`);
  }
  
  // Emit to all sender's active sessions for confirmation
  const senderSocketSet = userSockets.get(req.userId);
  if (senderSocketSet && senderSocketSet.size > 0) {
    senderSocketSet.forEach(socketId => {
      io.to(socketId).emit('messageSent', latestMessage);
    });
    console.log(`Message confirmation sent to ${senderSocketSet.size} sessions of sender ${req.userId}`);
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
