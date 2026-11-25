require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');
const { EventEmitter } = require('events');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. EVENT-DRIVEN FEATURES (EventEmitter)
const appEvents = new EventEmitter();
appEvents.on('userRegistered', (user) => console.log(`[Event] New user registered: ${user.email}`));
appEvents.on('noteCreated', (note) => console.log(`[Event] Note created by owner: ${note.owner}`));
appEvents.on('chatMessage', (data) => console.log(`[${data.room}] ${data.username}: ${data.message}`));

// 2. DATABASE MODELS
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});
const User = mongoose.model('User', userSchema);

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt
const Note = mongoose.model('Note', noteSchema);

// 3. MIDDLEWARE (Auth & RBAC)
const authenticateToken = (req, res, next) => {
  const token = req.headers['token']; // Matches expected output header
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

const authorizeRole = (requiredRole) => (req, res, next) => {
  if (req.user.role !== requiredRole) {
    return res.status(403).json({ message: 'Forbidden: Insufficient Role' });
  }
  next();
};

// 4. API ROUTES
// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, role: 'user' });
    await newUser.save();
    appEvents.emit('userRegistered', newUser);
    res.status(201).json({ message: 'User registered', id: newUser._id, username: newUser.username, email: newUser.email });
  } catch (error) {
    res.status(400).json({ message: 'Email already exists or invalid data' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Notes API (Protected)
app.get('/api/notes', authenticateToken, async (req, res) => {
  try {
    const notes = await Note.find({ owner: req.user.id });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/notes', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newNote = new Note({ title, content, owner: req.user.id });
    await newNote.save();
    appEvents.emit('noteCreated', newNote);
    res.status(201).json(newNote);
  } catch (error) {
    res.status(400).json({ message: 'Invalid note data' });
  }
});

// RBAC Demonstration Route (Admin Only)
app.get('/api/admin', authenticateToken, authorizeRole('admin'), (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard' });
});

// 5. SOCKET.IO (Real-Time Chat)
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinRoom', (data) => {
    const { username, room } = data;
    socket.username = username;
    socket.room = room;
    socket.join(room);
    console.log(`${socket.id} joined room ${room}`);
    io.to(room).emit('systemMessage', `${username} joined room ${room}`);
  });

  socket.on('sendMessage', (data) => {
    const { message, room } = data;
    const chatData = { username: socket.username, message, room, timestamp: new Date() };
    io.to(room).emit('receiveMessage', chatData);
    appEvents.emit('chatMessage', chatData); // Event-driven logging
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// 6. START SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});