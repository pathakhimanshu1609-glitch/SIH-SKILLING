import { supabase, isSupabaseConfigured } from './supabaseClient';

const CHANNEL_NAME = 'employment_sync';

/**
 * Broadcast an employment status change to all open tabs/portals in real-time.
 */
export function notifyEmploymentChange(action, payload = {}) {
  const eventData = { action, payload, timestamp: Date.now() };

  // 1. BroadcastChannel (modern cross-tab sync)
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage(eventData);
      bc.close();
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }
  }

  // 2. LocalStorage fallback for older cross-tab sync
  try {
    localStorage.setItem('employment_sync_signal', JSON.stringify(eventData));
  } catch (e) {
    // Ignore storage quota or access errors
  }

  // 3. In-window custom event dispatch
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('employment_local_sync', { detail: eventData }));
  }
}

/**
 * Subscribe to employment record & check-in changes via Supabase Realtime + local BroadcastChannel.
 * @param {Function} onChange - Callback function invoked on any change event.
 * @returns {Function} Unsubscribe cleanup function.
 */
export function subscribeEmploymentSync(onChange) {
  let isCleanedUp = false;

  const handleMessage = (data) => {
    if (!isCleanedUp && typeof onChange === 'function') {
      onChange(data);
    }
  };

  // 1. BroadcastChannel listener
  let bc = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (event) => handleMessage(event.data);
    } catch (e) {
      console.warn('Failed to initialize BroadcastChannel:', e);
    }
  }

  // 2. Storage event listener (fires across tabs when localStorage key changes)
  const storageHandler = (e) => {
    if (e.key === 'employment_sync_signal' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        handleMessage(parsed);
      } catch (err) {
        // ignore JSON parse error
      }
    }
  };
  window.addEventListener('storage', storageHandler);

  // 3. Local window event listener
  const localHandler = (e) => {
    handleMessage(e.detail);
  };
  window.addEventListener('employment_local_sync', localHandler);

  // 4. Supabase Realtime subscription (if configured)
  let supabaseChannel = null;
  if (isSupabaseConfigured()) {
    try {
      supabaseChannel = supabase
        .channel('employment_realtime_channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'employment_records' },
          (payload) => handleMessage({ action: 'supabase_record_change', payload })
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'checkins' },
          (payload) => handleMessage({ action: 'supabase_checkin_change', payload })
        )
        .subscribe();
    } catch (err) {
      console.warn('Supabase realtime subscription failed:', err);
    }
  }

  // Return cleanup function
  return () => {
    isCleanedUp = true;
    if (bc) {
      try {
        bc.close();
      } catch (e) {}
    }
    window.removeEventListener('storage', storageHandler);
    window.removeEventListener('employment_local_sync', localHandler);
    if (supabaseChannel) {
      supabase.removeChannel(supabaseChannel);
    }
  };
}
