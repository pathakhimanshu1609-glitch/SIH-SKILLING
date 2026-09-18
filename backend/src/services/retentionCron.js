import { sendWhatsAppNotification } from './whatsappService.js';
import { supabase } from '../config/supabaseClient.js';

const isSupabaseConfigured = Boolean(
  process.env.SUPABASE_URL && 
  !process.env.SUPABASE_URL.includes('your-supabase-project') && 
  !process.env.SUPABASE_URL.includes('placeholder')
);

/**
 * Retention Checkpoint Reminder Cron & Anti-Fraud Aging Engine
 * Runs daily to inspect retention_tracking rows where checkpoint_due_date has arrived or passed,
 * sending WhatsApp & Web reminders to both candidate and employer.
 */

// Helper to get date in candidate's local timezone (IST - Asia/Kolkata)
export const getCandidateLocalDate = (date = new Date(), timeZone = 'Asia/Kolkata') => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(date); // YYYY-MM-DD
  } catch (e) {
    return new Date(date).toISOString().split('T')[0];
  }
};

/**
 * Execute retention reminder scan and status check
 * @param {Object} options
 * @param {Array} options.retentionStore - in-memory retention checkpoints array
 * @param {string} [options.simulatedDate] - optional date string override (YYYY-MM-DD)
 * @param {string} [options.timeZone] - timezone (default: 'Asia/Kolkata')
 */
export const runRetentionReminderCheck = async ({
  retentionStore = [],
  simulatedDate = null,
  timeZone = 'Asia/Kolkata'
} = {}) => {
  const todayStr = simulatedDate || getCandidateLocalDate(new Date(), timeZone);
  const todayTime = new Date(`${todayStr}T00:00:00Z`).getTime();

  let remindersSent = 0;
  let missedMarked = 0;
  const dispatchLogs = [];

  console.log(`[RETENTION CRON] Running daily checkpoint scan for reference date: ${todayStr} (${timeZone})...`);

  for (const checkpoint of retentionStore) {
    if (checkpoint.status !== 'pending') continue;

    const dueDate = checkpoint.checkpoint_due_date;
    const dueTime = new Date(`${dueDate}T00:00:00Z`).getTime();
    const daysPastDue = Math.floor((todayTime - dueTime) / (1000 * 60 * 60 * 24));

    // Case 1: Checkpoint is overdue by > 30 days without reaching consensus -> Mark 'missed'
    if (daysPastDue > 30) {
      checkpoint.status = 'missed';
      checkpoint.updated_at = new Date().toISOString();
      checkpoint.notes = (checkpoint.notes ? checkpoint.notes + ' | ' : '') +
        `Automatically marked as missed on ${todayStr} (>30 days overdue without tripartite consensus).`;
      missedMarked++;

      dispatchLogs.push({
        checkpoint_id: checkpoint.id,
        candidate_id: checkpoint.candidate_id,
        checkpoint_day: checkpoint.checkpoint_day,
        action: 'MARKED_MISSED',
        reason: `${daysPastDue} days overdue without reaching 2-of-3 consensus.`
      });

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from('retention_tracking')
            .update({
              status: 'missed',
              notes: checkpoint.notes,
              updated_at: checkpoint.updated_at
            })
            .eq('id', checkpoint.id);
        } catch (err) {
          console.warn('[RETENTION CRON] Supabase missed update warning:', err.message);
        }
      }
      continue;
    }

    // Case 2: Checkpoint is due today or past due within 30-day window -> Dispatch reminder
    if (daysPastDue >= 0) {
      // Avoid spamming if reminder already sent today
      const lastReminderDate = checkpoint.reminder_sent_at
        ? getCandidateLocalDate(new Date(checkpoint.reminder_sent_at), timeZone)
        : null;

      if (lastReminderDate !== todayStr) {
        try {
          // 1. Dispatch WhatsApp notification to Candidate
          const candWaResult = await sendWhatsAppNotification({
            toMobile: 'whatsapp:+919876543210',
            promptType: `retention_day_${checkpoint.checkpoint_day}`,
            lang: 'hi'
          });

          // 2. Dispatch WhatsApp notification to Employer
          const empWaResult = await sendWhatsAppNotification({
            toMobile: 'whatsapp:+919820011223',
            promptType: `employer_retention_check_${checkpoint.checkpoint_day}`,
            lang: 'en'
          });

          checkpoint.reminder_sent_at = new Date().toISOString();
          checkpoint.updated_at = new Date().toISOString();
          remindersSent++;

          dispatchLogs.push({
            checkpoint_id: checkpoint.id,
            candidate_id: checkpoint.candidate_id,
            checkpoint_day: checkpoint.checkpoint_day,
            action: 'REMINDER_DISPATCHED',
            due_date: checkpoint.checkpoint_due_date,
            daysPastDue,
            candidateWhatsApp: candWaResult.messageId,
            employerWhatsApp: empWaResult.messageId
          });

          if (isSupabaseConfigured && supabase) {
            try {
              await supabase
                .from('retention_tracking')
                .update({
                  reminder_sent_at: checkpoint.reminder_sent_at,
                  updated_at: checkpoint.updated_at
                })
                .eq('id', checkpoint.id);
            } catch (err) {
              console.warn('[RETENTION CRON] Supabase reminder update warning:', err.message);
            }
          }
        } catch (err) {
          console.error(`[RETENTION CRON] Failed to dispatch reminder for ${checkpoint.id}:`, err.message);
        }
      }
    }
  }

  console.log(`[RETENTION CRON] Completed: ${remindersSent} reminders dispatched, ${missedMarked} marked missed.`);

  return {
    success: true,
    reference_date: todayStr,
    timezone: timeZone,
    total_tracked: retentionStore.length,
    reminders_sent: remindersSent,
    missed_marked: missedMarked,
    logs: dispatchLogs
  };
};

let cronIntervalHandle = null;

/**
 * Start the daily scheduled job
 * @param {Function} getRetentionStoreFn - callback returning latest RETENTION_TRACKING array
 */
export const startRetentionCron = (getRetentionStoreFn) => {
  if (cronIntervalHandle) {
    clearInterval(cronIntervalHandle);
  }

  // Initial scan 5 seconds after boot
  setTimeout(async () => {
    try {
      const store = getRetentionStoreFn ? getRetentionStoreFn() : [];
      await runRetentionReminderCheck({ retentionStore: store });
    } catch (e) {
      console.warn('[RETENTION CRON] Initial startup run notice:', e.message);
    }
  }, 5000);

  // Daily interval (every 24 hours = 86,400,000 ms)
  cronIntervalHandle = setInterval(async () => {
    try {
      const store = getRetentionStoreFn ? getRetentionStoreFn() : [];
      await runRetentionReminderCheck({ retentionStore: store });
    } catch (e) {
      console.error('[RETENTION CRON] Daily interval execution error:', e.message);
    }
  }, 24 * 60 * 60 * 1000);

  if (cronIntervalHandle.unref) {
    cronIntervalHandle.unref(); // Don't prevent clean Node.js exit
  }

  console.log('⏰ [RETENTION CRON] Post-Placement Retention Daily Scheduler Initialized (24h Interval).');
};
