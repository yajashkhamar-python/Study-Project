const cron = require('node-cron');
const Task = require('../models/Task');
const Exam = require('../models/Exam');
const Notification = require('../models/Notification');
const User = require('../models/User');

const initCronScheduler = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON Scheduler] Running hourly reminder & overdue check...');

    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      // 1. Mark overdue tasks
      const overdueTasks = await Task.find({
        status: { $ne: 'completed' },
        dueDate: { $lt: now },
      });

      for (const task of overdueTasks) {
        if (task.status !== 'overdue') {
          task.status = 'overdue';
          await task.save();

          await Notification.create({
            user: task.user,
            message: `Task "${task.title}" is now OVERDUE!`,
            type: 'overdue_alert',
            referenceId: task._id,
          });
        }
      }

      // 2. Upcoming Task Reminders (within 24 hours)
      const upcomingTasks = await Task.find({
        status: { $in: ['pending', 'in-progress'] },
        dueDate: { $gte: now, $lte: in24Hours },
      });

      for (const task of upcomingTasks) {
        // Prevent duplicate notification within last 12 hrs
        const existingNotif = await Notification.findOne({
          user: task.user,
          referenceId: task._id,
          type: 'task_reminder',
          createdAt: { $gte: new Date(now.getTime() - 12 * 60 * 60 * 1000) },
        });

        if (!existingNotif) {
          await Notification.create({
            user: task.user,
            message: `Reminder: Task "${task.title}" is due soon (${task.dueDate.toLocaleDateString()}).`,
            type: 'task_reminder',
            referenceId: task._id,
          });
        }
      }

      // 3. Upcoming Exam Reminders (within 48 hours)
      const upcomingExams = await Exam.find({
        examDate: { $gte: now, $lte: in48Hours },
      });

      for (const exam of upcomingExams) {
        const existingNotif = await Notification.findOne({
          user: exam.user,
          referenceId: exam._id,
          type: 'exam_reminder',
          createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        });

        if (!existingNotif) {
          await Notification.create({
            user: exam.user,
            message: `Exam Alert: "${exam.subject}" is scheduled on ${exam.examDate.toLocaleDateString()} at ${exam.examTime}!`,
            type: 'exam_reminder',
            referenceId: exam._id,
          });
        }
      }

      console.log(`[CRON Scheduler] Hourly check complete. Processed ${overdueTasks.length} overdue tasks.`);
    } catch (err) {
      console.error('[CRON Scheduler] Error executing cron job:', err);
    }
  });

  console.log('[CRON Scheduler] Node-cron initialized and scheduled (0 * * * *).');
};

module.exports = { initCronScheduler };
