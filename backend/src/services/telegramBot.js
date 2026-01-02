const TelegramBot = require('node-telegram-bot-api');
const Job = require('../models/Job');
const User = require('../models/User');
const { parseJobText } = require('./geminiService');

let bot;
const userStates = new Map(); // Track user conversation states

function initBot() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.log('Telegram bot token not configured');
    return null;
  }

  bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

  // Start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, 
      `👋 Welcome to Job Tracker Bot!\n\n` +
      `I help you track job applications effortlessly.\n\n` +
      `📝 *How to use:*\n` +
      `• Just send me any job info and I'll log it\n` +
      `• Use /link <email> to connect your account\n` +
      `• Use /list to see recent applications\n` +
      `• Use /stats to see your summary\n\n` +
      `Try sending: "Applied at Google for SDE role"`,
      { parse_mode: 'Markdown' }
    );
  });

  // Link account command - not needed in single user mode, just confirm
  bot.onText(/\/link(.*)/, async (msg) => {
    const chatId = msg.chat.id;
    
    // Get or create the single user and link telegram
    let user = await User.findOne({});
    if (!user) {
      user = await User.create({
        email: 'user@jobtracker.local',
        password: 'not-used',
        telegramChatId: chatId.toString()
      });
    } else {
      user.telegramChatId = chatId.toString();
      await user.save();
    }

    bot.sendMessage(chatId, `✅ Telegram linked!\n\nNow just send me any job info to track it.`);
  });

  // List command
  bot.onText(/\/list/, async (msg) => {
    const chatId = msg.chat.id;
    
    // Get or create user and link telegram automatically
    let user = await User.findOne({});
    if (!user) {
      user = await User.create({
        email: 'user@jobtracker.local',
        password: 'not-used',
        telegramChatId: chatId.toString()
      });
    } else if (!user.telegramChatId) {
      user.telegramChatId = chatId.toString();
      await user.save();
    }

    const jobs = await Job.find({ userId: user._id })
      .sort({ appliedDate: -1 })
      .limit(10);

    if (jobs.length === 0) {
      return bot.sendMessage(chatId, '📭 No jobs tracked yet. Send me your first application!');
    }

    let message = '📋 *Recent Applications:*\n\n';
    jobs.forEach((job, index) => {
      const statusEmoji = getStatusEmoji(job.status);
      message += `${index + 1}. ${job.companyName} – ${job.role || 'N/A'}\n   ${statusEmoji} ${job.status}\n\n`;
    });

    message += `\nUse /select <number> to manage a job`;

    userStates.set(chatId, { jobs });
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  });

  // Select job command
  bot.onText(/\/select (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const index = parseInt(match[1]) - 1;

    const state = userStates.get(chatId);
    if (!state || !state.jobs || !state.jobs[index]) {
      return bot.sendMessage(chatId, '❌ Invalid selection. Use /list first.');
    }

    const job = state.jobs[index];
    userStates.set(chatId, { selectedJob: job, action: 'menu' });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔄 Change Status', callback_data: `status_${job.id}` },
          { text: '📝 Add Note', callback_data: `note_${job.id}` }
        ],
        [
          { text: '📅 Set Follow-up', callback_data: `followup_${job.id}` },
          { text: '🗓️ Set Interview', callback_data: `interview_${job.id}` }
        ],
        [
          { text: '❌ Mark Rejected', callback_data: `reject_${job.id}` },
          { text: '🎉 Mark Offer', callback_data: `offer_${job.id}` }
        ]
      ]
    };

    bot.sendMessage(chatId,
      `📌 *${job.companyName}*\n` +
      `Role: ${job.role || 'N/A'}\n` +
      `Status: ${job.status}\n` +
      `Applied: ${new Date(job.appliedDate).toLocaleDateString()}\n\n` +
      `What would you like to do?`,
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );
  });

  // Stats command
  bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;
    
    // Get or create user
    let user = await User.findOne({});
    if (!user) {
      user = await User.create({
        email: 'user@jobtracker.local',
        password: 'not-used',
        telegramChatId: chatId.toString()
      });
    }

    const stats = await Job.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const total = await Job.countDocuments({ userId: user._id });
    const statsMap = {};
    stats.forEach(s => statsMap[s._id] = s.count);

    bot.sendMessage(chatId,
      `📊 *Your Job Stats*\n\n` +
      `📝 Total Applied: ${total}\n` +
      `💼 Interviews: ${statsMap['Interview'] || 0}\n` +
      `⭐ Shortlisted: ${statsMap['Shortlisted'] || 0}\n` +
      `🎉 Offers: ${statsMap['Offer'] || 0}\n` +
      `❌ Rejected: ${statsMap['Rejected'] || 0}\n` +
      `👻 Ghosted: ${statsMap['Ghosted'] || 0}`,
      { parse_mode: 'Markdown' }
    );
  });

  // Handle callback queries (button clicks)
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    const [action, jobId] = data.split('_');

    // Get the single user
    let user = await User.findOne({});
    if (!user) {
      user = await User.create({
        email: 'user@jobtracker.local',
        password: 'not-used',
        telegramChatId: chatId.toString()
      });
    }

    const job = await Job.findOne({ id: jobId, userId: user._id });
    if (!job) {
      return bot.answerCallbackQuery(query.id, { text: 'Job not found' });
    }

    if (action === 'status') {
      userStates.set(chatId, { selectedJob: job, action: 'status' });
      const keyboard = {
        inline_keyboard: [
          [
            { text: '📝 Applied', callback_data: `setstatus_Applied_${jobId}` },
            { text: '📞 Interview', callback_data: `setstatus_Interview_${jobId}` }
          ],
          [
            { text: '⭐ Shortlisted', callback_data: `setstatus_Shortlisted_${jobId}` },
            { text: '🎉 Offer', callback_data: `setstatus_Offer_${jobId}` }
          ],
          [
            { text: '❌ Rejected', callback_data: `setstatus_Rejected_${jobId}` },
            { text: '👻 Ghosted', callback_data: `setstatus_Ghosted_${jobId}` }
          ]
        ]
      };
      bot.editMessageText('Select new status:', {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: keyboard
      });
    } else if (action === 'setstatus') {
      const [, status, jId] = data.split('_');
      const jobToUpdate = await Job.findOne({ id: jId, userId: user._id });
      if (jobToUpdate) {
        jobToUpdate.status = status;
        await jobToUpdate.save();
        bot.answerCallbackQuery(query.id, { text: `Status updated to ${status}!` });
        bot.editMessageText(`✅ ${jobToUpdate.companyName} status updated to ${status}`, {
          chat_id: chatId,
          message_id: query.message.message_id
        });
      }
    } else if (action === 'note') {
      userStates.set(chatId, { selectedJob: job, action: 'add_note' });
      bot.answerCallbackQuery(query.id);
      bot.sendMessage(chatId, '📝 Send me the note to add:');
    } else if (action === 'followup') {
      userStates.set(chatId, { selectedJob: job, action: 'set_followup' });
      bot.answerCallbackQuery(query.id);
      bot.sendMessage(chatId, '📅 Send follow-up date (e.g., "2026-01-15" or "next Monday"):');
    } else if (action === 'interview') {
      userStates.set(chatId, { selectedJob: job, action: 'set_interview' });
      bot.answerCallbackQuery(query.id);
      bot.sendMessage(chatId, '🗓️ Send interview date (e.g., "2026-01-15" or "tomorrow 2pm"):');
    } else if (action === 'reject') {
      job.status = 'Rejected';
      await job.save();
      bot.answerCallbackQuery(query.id, { text: 'Marked as Rejected' });
      bot.editMessageText(`❌ ${job.companyName} marked as Rejected`, {
        chat_id: chatId,
        message_id: query.message.message_id
      });
    } else if (action === 'offer') {
      job.status = 'Offer';
      await job.save();
      bot.answerCallbackQuery(query.id, { text: 'Congratulations! 🎉' });
      bot.editMessageText(`🎉 ${job.companyName} marked as Offer! Congratulations!`, {
        chat_id: chatId,
        message_id: query.message.message_id
      });
    }
  });

  // Handle regular messages (job input or state responses)
  bot.on('message', async (msg) => {
    if (msg.text && msg.text.startsWith('/')) return; // Ignore commands

    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

    // Get or create user automatically
    let user = await User.findOne({});
    if (!user) {
      user = await User.create({
        email: 'user@jobtracker.local',
        password: 'not-used',
        telegramChatId: chatId.toString()
      });
    } else if (!user.telegramChatId) {
      user.telegramChatId = chatId.toString();
      await user.save();
    }

    const state = userStates.get(chatId);

    // Handle state-based responses
    if (state && state.action === 'add_note' && state.selectedJob) {
      const job = await Job.findOne({ id: state.selectedJob.id, userId: user._id });
      if (job) {
        job.notes = job.notes ? `${job.notes}\n${text}` : text;
        await job.save();
        bot.sendMessage(chatId, `✅ Note added to ${job.companyName}`);
      }
      userStates.delete(chatId);
      return;
    }

    if (state && state.action === 'set_followup' && state.selectedJob) {
      const job = await Job.findOne({ id: state.selectedJob.id, userId: user._id });
      if (job) {
        const date = parseDate(text);
        job.followUpDate = date;
        await job.save();
        bot.sendMessage(chatId, `✅ Follow-up set for ${job.companyName} on ${date.toLocaleDateString()}`);
      }
      userStates.delete(chatId);
      return;
    }

    if (state && state.action === 'set_interview' && state.selectedJob) {
      const job = await Job.findOne({ id: state.selectedJob.id, userId: user._id });
      if (job) {
        const date = parseDate(text);
        job.interviewDate = date;
        job.status = 'Interview';
        await job.save();
        bot.sendMessage(chatId, `✅ Interview scheduled for ${job.companyName} on ${date.toLocaleDateString()}`);
      }
      userStates.delete(chatId);
      return;
    }

    // Default: Parse as new job application
    const parseResult = await parseJobText(text);

    if (parseResult.success) {
      const jobData = {
        ...parseResult.data,
        userId: user._id,
        source: 'Telegram',
        appliedDate: new Date(),
        status: 'Applied'
      };

      // Check for duplicate
      const existing = await Job.findOne({
        userId: user._id,
        companyName: jobData.companyName,
        role: jobData.role
      });

      if (existing) {
        return bot.sendMessage(chatId,
          `⚠️ *Duplicate detected!*\n\n` +
          `You already applied to ${existing.companyName} for ${existing.role || 'this role'}.\n` +
          `Status: ${existing.status}\n` +
          `Applied: ${new Date(existing.appliedDate).toLocaleDateString()}`,
          { parse_mode: 'Markdown' }
        );
      }

      const job = await Job.create(jobData);

      const keyboard = {
        inline_keyboard: [
          [
            { text: '🔄 Update Status', callback_data: `status_${job.id}` },
            { text: '📝 Add Note', callback_data: `note_${job.id}` }
          ],
          [
            { text: '📅 Set Follow-up', callback_data: `followup_${job.id}` }
          ]
        ]
      };

      bot.sendMessage(chatId,
        `✅ *Job Added!*\n\n` +
        `🏢 Company: ${job.companyName}\n` +
        `💼 Role: ${job.role || 'N/A'}\n` +
        `📊 Status: Applied\n` +
        `📅 Date: ${new Date().toLocaleDateString()}\n` +
        (job.platform !== 'Unknown' ? `🌐 Platform: ${job.platform}\n` : '') +
        (job.jobLink ? `🔗 Link: ${job.jobLink}\n` : ''),
        { parse_mode: 'Markdown', reply_markup: keyboard }
      );
    }
  });

  console.log('Telegram bot initialized');
  return bot;
}

function getStatusEmoji(status) {
  const emojis = {
    'Applied': '📝',
    'Interview': '💼',
    'Shortlisted': '⭐',
    'Rejected': '❌',
    'Offer': '🎉',
    'Ghosted': '👻'
  };
  return emojis[status] || '📌';
}

function parseDate(text) {
  // Simple date parsing
  const now = new Date();
  const lower = text.toLowerCase();

  if (lower.includes('tomorrow')) {
    now.setDate(now.getDate() + 1);
    return now;
  }
  if (lower.includes('next week')) {
    now.setDate(now.getDate() + 7);
    return now;
  }
  if (lower.includes('monday')) {
    const day = 1;
    const diff = (day - now.getDay() + 7) % 7 || 7;
    now.setDate(now.getDate() + diff);
    return now;
  }
  
  // Try to parse as date string
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  // Default to tomorrow
  now.setDate(now.getDate() + 1);
  return now;
}

// Send reminder function (called by cron)
async function sendReminders() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const jobs = await Job.find({
    followUpDate: { $gte: today, $lt: tomorrow }
  }).populate('userId');

  for (const job of jobs) {
    if (job.userId && job.userId.telegramChatId && bot) {
      bot.sendMessage(job.userId.telegramChatId,
        `⏰ *Follow-up Reminder!*\n\n` +
        `Time to follow up with ${job.companyName}` +
        (job.role ? ` for ${job.role}` : '') +
        `\n\nStatus: ${job.status}`,
        { parse_mode: 'Markdown' }
      );
    }
  }
}

// Mark old applications as ghosted
async function markGhosted() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 21);

  await Job.updateMany(
    {
      status: 'Applied',
      lastUpdated: { $lt: cutoffDate }
    },
    {
      $set: { status: 'Ghosted' },
      $push: { statusHistory: { status: 'Ghosted', changedAt: new Date(), note: 'Auto-marked after 21 days' } }
    }
  );
}

module.exports = { initBot, sendReminders, markGhosted };
