import { playNotificationChime } from './sound';

export async function requestDeviceNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return false;
    }
  }

  return false;
}

export function isNotificationPermissionGranted(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}

export function sendSystemDeviceNotification(title: string, message: string, id?: string) {
  // 1. Play synthesized audio chime
  playNotificationChime();

  // 2. Mobile device vibration pattern (200ms pulse, 100ms pause, 200ms pulse)
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch (e) {
      // Vibrate API might require user activation in some browsers
    }
  }

  // 3. System Push Notification (Device Lock screen / Notification Tray)
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body: message,
        icon: '/app_icon.png',
        badge: '/app_icon.png',
        tag: id || `notif-${Date.now()}`,
        requireInteraction: false,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (e) {
      console.warn('System push notification creation error:', e);
    }
  }
}
