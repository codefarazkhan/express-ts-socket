const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb+srv://root:root@cluster0.vrvpvgg.mongodb.net/socket-chat');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

const SECRET = 'your_secret_key';

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

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
