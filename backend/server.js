const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const { setupInMemoryServer } = require('./mockServer');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const examRoutes = require('./routes/examRoutes');
const goalRoutes = require('./routes/goalRoutes');
const noteRoutes = require('./routes/noteRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Student Study Planner API is running' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const mongoConnected = await connectDB();

  if (mongoConnected) {
    app.use('/api/auth', authRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/calendar', calendarRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/exams', examRoutes);
    app.use('/api/goals', goalRoutes);
    app.use('/api/notes', noteRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/tasks', taskRoutes);
  } else {
    // Use the persistent local API only when MongoDB is unavailable.
    setupInMemoryServer(app);
  }

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();
