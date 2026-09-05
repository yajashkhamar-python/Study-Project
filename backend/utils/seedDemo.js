const connectDB = require('../config/db');
const User = require('../models/User');
const Task = require('../models/Task');
const Exam = require('../models/Exam');
require('dotenv').config();

const seedDemoData = async () => {
  try {
    await connectDB();

    let demoUser = await User.findOne({ email: 'demo@student.edu' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Alex Rivera',
        email: 'demo@student.edu',
        passwordHash: 'password123',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        reminderDaysBefore: 2,
        theme: 'dark',
      });
      console.log('✅ Demo user created');
    } else {
      console.log('ℹ️ Demo user already exists');
    }

    // Seed sample tasks if empty
    const taskCount = await Task.countDocuments({ user: demoUser._id });
    if (taskCount === 0) {
      await Task.create([
        {
          user: demoUser._id,
          title: 'Complete Advanced Calculus Problem Set',
          subject: 'Mathematics',
          dueDate: new Date(Date.now() + 86400000 * 2),
          priority: 'high',
          status: 'in-progress',
        },
        {
          user: demoUser._id,
          title: 'Review Data Structures & Algorithms Graphs Chapter',
          subject: 'Computer Science',
          dueDate: new Date(Date.now() + 86400000 * 4),
          priority: 'urgent',
          status: 'pending',
        },
        {
          user: demoUser._id,
          title: 'Quantum Mechanics Lab Summary',
          subject: 'Physics',
          dueDate: new Date(Date.now() - 86400000),
          priority: 'medium',
          status: 'completed',
          completedAt: new Date(),
        },
      ]);
      console.log('✅ Sample demo tasks created');
    }

    // Seed sample exam if empty
    const examCount = await Exam.countDocuments({ user: demoUser._id });
    if (examCount === 0) {
      await Exam.create({
        user: demoUser._id,
        subject: 'Computer Science Midterm',
        examDate: new Date(Date.now() + 86400000 * 5),
        examTime: '10:00 AM',
        venue: 'Auditorium Hall B',
        syllabusNotes: 'Data Structures, Binary Trees, Dynamic Programming',
        colorTag: '#6366f1',
      });
      console.log('✅ Sample demo exam created');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error seeding demo data:', err);
    process.exit(1);
  }
};

seedDemoData();
