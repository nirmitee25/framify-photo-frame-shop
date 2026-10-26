// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (req, res) => {
  res.json({ success: true, app: 'Framify', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// --- MongoDB connection ---
// Connect before accepting requests, so a missing/invalid URI is obvious.
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri || !mongoUri.trim()) {
  console.error('MongoDB connection is not configured. Create E:\\framify\\.env and add MONGODB_URI=your_connection_string');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Framify server running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection failed. Check MONGODB_URI and confirm MongoDB/Atlas is available.');
    console.error(err.message);
    process.exit(1);
  });

// --- Schema for Customize Page ---
const customizeSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  frameType: String,
  frameSize: String,
  message: String,
  photoUrl: String,
  createdAt: { type: Date, default: Date.now }
});
const Customize = mongoose.model('Customize', customizeSchema);

// --- Schema for Checkout Orders ---
const orderSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  cart: Array,
  total: Number,
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// --- Multer config for file uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safeExtension = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
    cb(null, `${Date.now()}-${require('crypto').randomBytes(6).toString('hex')}${safeExtension}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Please upload an image file.'));
  }
});

// --- API for Customize Page ---
app.post('/api/customize', upload.single('photo'), async (req, res) => {
  try {
    const { name, email, phone, frameType, frameSize, message } = req.body;
    if (!name?.trim() || !email?.trim() || !phone?.trim() || !frameType || !frameSize || !req.file) {
      return res.status(400).json({ success: false, error: 'Please complete all required fields and upload an image.' });
    }
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const doc = new Customize({ name, email, phone, frameType, frameSize, message, photoUrl });
    await doc.save();
    res.json({ success: true, data: doc });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// --- API for Checkout Orders ---
app.post('/api/order', async (req, res) => {
  try {
    const { name, email, phone, address, cart, total } = req.body;
    if (!name?.trim() || !email?.trim() || !phone?.trim() || !address?.trim() || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide contact details, delivery address and at least one cart item.' });
    }
    const safeCart = cart.map(item => ({ id: String(item.id || ''), name: String(item.name || 'Frame').slice(0, 150), price: Math.max(0, Number(item.price) || 0), quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1)) }));
    const verifiedTotal = safeCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = new Order({ name, email, phone, address, cart: safeCart, total: verifiedTotal });
    await order.save();
    res.json({ success: true, data: order });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === 'Please upload an image file.') {
    return res.status(400).json({ success: false, error: err.message === 'File too large' ? 'Image must be 5 MB or smaller.' : err.message });
  }
  next(err);
});

