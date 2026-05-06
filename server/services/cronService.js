const cron = require('node-cron');
const Item = require('../models/Item');

async function runExpiryJob() {
  try {
    const now = new Date();

    // ACTIVE → EXPIRED: items past 90-day expiry date
    const expiredResult = await Item.updateMany(
      { status: 'ACTIVE', expiryDate: { $lte: now } },
      { $set: { status: 'EXPIRED' } }
    );

    // EXPIRED → DISPOSED: items expired more than 10 days ago
    const disposalDate = new Date(now);
    disposalDate.setDate(disposalDate.getDate() - 10);

    const disposedResult = await Item.updateMany(
      { status: 'EXPIRED', expiryDate: { $lte: disposalDate } },
      { $set: { status: 'DISPOSED', disposedDate: now } }
    );

    if (expiredResult.modifiedCount > 0 || disposedResult.modifiedCount > 0) {
      console.log(
        `[CRON] Status update: ${expiredResult.modifiedCount} expired, ${disposedResult.modifiedCount} disposed`
      );
    }
  } catch (err) {
    console.error('[CRON] Expiry job error:', err.message);
  }
}

function start() {
  // Run daily at midnight
  cron.schedule('0 0 * * *', runExpiryJob, {
    scheduled: true,
    timezone: 'Asia/Kolkata',
  });

  // Also run once on startup
  runExpiryJob();

  console.log('⏰ Cron service started (daily expiry check at midnight IST)');
}

module.exports = { start, runExpiryJob };
