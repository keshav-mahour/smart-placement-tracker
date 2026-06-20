const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

console.log('Gemini API key configured:', !!process.env.GEMINI_API_KEY);

const connectDB = require('./config/db');
const { startScheduler } = require('./services/reminderService');

// Import routes
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// Connect to MongoDB Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
  res.send('Smart Placement Tracker API is Running');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API server is running fine.' });
});

// Serve frontend in production (optional setup for Vercel/Render)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[SERVER ERROR] ${err.stack}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// Start reminder scheduler
startScheduler();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
