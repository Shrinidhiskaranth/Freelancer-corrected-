require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const clientRoutes = require('./routes/clientRoutes');
const freelancerRoutes = require('./routes/freelancerRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reviewRoutes  = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const aiRoutes      = require('./routes/aiRoutes');

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to DB for serverless environment
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/freelancer', freelancerRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai',       aiRoutes);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running' }));

// Central error handler (e.g. multer file-size errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  async function startServer() {
    await connectDB();
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  }
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = app;
