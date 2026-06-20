const cron = require('node-cron');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Setup log directory for simulated emails
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const emailLogPath = path.join(logDir, 'simulated_emails.log');

// Setup email transporter (checks env, fallback to simulated mode)
const getTransporter = () => {
  const isMock = !process.env.SMTP_USER || process.env.SMTP_USER === 'mock_user';
  if (isMock) {
    return null;
  }
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendEmail = async (to, subject, htmlContent) => {
  const transporter = getTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'notifications@smartplacement.com',
    to,
    subject,
    html: htmlContent
  };

  if (!transporter) {
    const logEntry = `[${new Date().toISOString()}] To: ${to} | Subject: ${subject}\nBody: ${htmlContent.replace(/<[^>]*>/g, '')}\n----------------------------------------\n`;
    fs.appendFileSync(emailLogPath, logEntry);
    console.log(`[EMAIL SIMULATOR] Mock email logged in server/logs/simulated_emails.log to: ${to}`);
    return true;
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SENT] Real email sent to: ${to} for subject: ${subject}`);
    return true;
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}: ${err.message}. Logging email instead.`);
    const logEntry = `[${new Date().toISOString()}] (FAILED REAL SEND) To: ${to} | Subject: ${subject}\nBody: ${htmlContent.replace(/<[^>]*>/g, '')}\n----------------------------------------\n`;
    fs.appendFileSync(emailLogPath, logEntry);
    return true; // Return true so we don't spam attempts
  }
};

// Main task runner
const checkReminders = async () => {
  console.log(`[CRON RUNNER] Checking job application dates at ${new Date().toISOString()}`);
  
  try {
    const now = new Date();
    
    // 1. Check OA Tomorrow (OA testDate is within the next 24 hours, and reminders.oaSent is false)
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const upcomingOAs = await Company.find({
      testDate: { $gte: now, $lte: twentyFourHoursFromNow },
      'reminders.oaSent': false,
      status: 'Online Assessment'
    }).populate('userId');

    for (let comp of upcomingOAs) {
      if (comp.userId && comp.userId.email) {
        const title = `🚨 Upcoming OA Reminder: ${comp.name}`;
        const message = `Your Online Assessment for ${comp.name} (${comp.role}) is scheduled for ${new Date(comp.testDate).toLocaleString()}. Please prepare accordingly.`;
        
        // Save in-app notification
        await Notification.create({
          userId: comp.userId._id,
          companyId: comp._id,
          type: 'OA',
          title,
          message
        });

        // Send Email
        const html = `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Online Assessment Reminder</h2>
            <p>Hi ${comp.userId.name},</p>
            <p>This is a reminder that your Online Assessment for <strong>${comp.name}</strong> for the <strong>${comp.role}</strong> role is scheduled within the next 24 hours.</p>
            <p><strong>OA Time:</strong> ${new Date(comp.testDate).toLocaleString()}</p>
            <p>Good luck!</p>
            <hr />
            <p style="font-size: 12px; color: #777;">Smart Placement Tracker Notifications</p>
          </div>
        `;
        await sendEmail(comp.userId.email, title, html);

        // Update Flag
        comp.reminders.oaSent = true;
        await comp.save();
      }
    }

    // 2. Check Interview in 2 Hours (interviewDate is within the next 2 hours, and interviewReminderSent is false)
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const upcomingInterviews = await Company.find({
      interviewDate: { $gte: now, $lte: twoHoursFromNow },
      'reminders.interviewSent': false,
      status: { $in: ['Technical Interview', 'HR Interview'] }
    }).populate('userId');

    for (let comp of upcomingInterviews) {
      if (comp.userId && comp.userId.email) {
        const title = `📅 Interview starting soon: ${comp.name}`;
        const message = `Your interview with ${comp.name} for the ${comp.role} role is starting in less than 2 hours (at ${new Date(comp.interviewDate).toLocaleTimeString()}). Get ready!`;
        
        await Notification.create({
          userId: comp.userId._id,
          companyId: comp._id,
          type: 'Interview',
          title,
          message
        });

        const html = `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Interview Starting Soon</h2>
            <p>Hi ${comp.userId.name},</p>
            <p>Your interview for <strong>${comp.name}</strong> (Role: ${comp.role}) is starting in less than 2 hours.</p>
            <p><strong>Interview Time:</strong> ${new Date(comp.interviewDate).toLocaleString()}</p>
            <p>Make sure your connection is stable and quiet. You've got this!</p>
            <hr />
            <p style="font-size: 12px; color: #777;">Smart Placement Tracker Notifications</p>
          </div>
        `;
        await sendEmail(comp.userId.email, title, html);

        comp.reminders.interviewSent = true;
        await comp.save();
      }
    }

    // 3. Check Deadline Today (application deadline is within the next 24 hours, and deadlineReminderSent is false)
    const upcomingDeadlines = await Company.find({
      deadline: { $gte: now, $lte: twentyFourHoursFromNow },
      'reminders.deadlineSent': false,
      status: 'Applied' // Only remind if they haven't moved it forward
    }).populate('userId');

    for (let comp of upcomingDeadlines) {
      if (comp.userId && comp.userId.email) {
        const title = `⚠️ Application Deadline Today: ${comp.name}`;
        const message = `The application deadline for ${comp.name} (${comp.role}) is today (${new Date(comp.deadline).toLocaleDateString()}). Make sure you complete your submission!`;
        
        await Notification.create({
          userId: comp.userId._id,
          companyId: comp._id,
          type: 'Deadline',
          title,
          message
        });

        const html = `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Application Deadline Alert</h2>
            <p>Hi ${comp.userId.name},</p>
            <p>The application deadline for <strong>${comp.name}</strong> (Role: ${comp.role}) is today!</p>
            <p><strong>Deadline Date:</strong> ${new Date(comp.deadline).toLocaleDateString()}</p>
            <p>Ensure your application forms and resume are fully submitted before the portal closes.</p>
            <hr />
            <p style="font-size: 12px; color: #777;">Smart Placement Tracker Notifications</p>
          </div>
        `;
        await sendEmail(comp.userId.email, title, html);

        comp.reminders.deadlineSent = true;
        await comp.save();
      }
    }

  } catch (error) {
    console.error(`[CRON ERROR] Reminder service failed: ${error.message}`);
  }
};

const startScheduler = () => {
  // Run every hour
  cron.schedule('0 * * * *', checkReminders);
  
  // Run once immediately on server startup for testing/validation
  setTimeout(checkReminders, 5000);
  
  console.log('[CRON SCHEDULER] Background reminder service active.');
};

module.exports = { startScheduler };
