import { playNotificationChime } from './sound';

// Helper function to convert base64 VAPID public key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

export function isNotificationPermissionGranted(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}

export async function requestDeviceNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }

  if (Notification.permission === 'granted') {
    // Already granted, ensure subscription is active
    await subscribeDeviceToPushNotifications().catch(() => {});
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await subscribeDeviceToPushNotifications().catch(() => {});
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return false;
    }
  }

  return false;
}

// Subscribes this mobile device/browser to Web Push via VAPID so it receives notifications even when app is closed!
export async function subscribeDeviceToPushNotifications(): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    if (!reg || !reg.pushManager) {
      return false;
    }

    // 1. Fetch VAPID public key from backend
    const keyRes = await fetch('/api/push/vapid-public-key');
    if (!keyRes.ok) return false;
    const { publicKey } = await keyRes.json();
    if (!publicKey) return false;

    // 2. Check existing subscription or create new
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      const convertedKey = urlBase64ToUint8Array(publicKey);
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
    }

    // 3. Send subscription to server
    if (subscription) {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });
      localStorage.setItem('bd_push_subscribed', 'true');
      return true;
    }
  } catch (err) {
    console.warn('[Push Subscribe Error]:', err);
  }
  return false;
}

// Fetch active subscribed devices count from server
export async function fetchPushSubscribersCount(): Promise<number> {
  try {
    const res = await fetch('/api/push/vapid-public-key');
    if (res.ok) {
      const data = await res.json();
      return typeof data.totalSubscribers === 'number' ? data.totalSubscribers : 0;
    }
  } catch {}
  return 0;
}

// System device notification (works on Android Chrome, PWA, lock screen, status bar)
export async function sendSystemDeviceNotification(
  title: string,
  message: string,
  id?: string,
  linkTab?: string
) {
  // 1. Play chime audio
  try {
    playNotificationChime();
  } catch {}

  // 2. Mobile device vibration pattern (200ms pulse, 100ms pause, 200ms pulse)
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([300, 100, 300]);
    } catch {}
  }

  // 3. System Push Notification (Device Lock screen / Notification Tray)
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    const tag = id || `bdesports-${Date.now()}`;
    const options: any = {
      body: message,
      icon: '/app_icon.png',
      badge: '/app_icon.png',
      tag,
      renotify: true,
      requireInteraction: true,
      vibrate: [300, 100, 300],
      data: {
        linkTab: linkTab || 'play',
        url: `/?tab=${linkTab || 'play'}`,
      },
    };

    // Chrome on Android REQUIRES Service Worker registration.showNotification!
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && 'showNotification' in reg) {
          await reg.showNotification(title, options);
          return;
        }
      } catch (swErr) {
        console.warn('ServiceWorker showNotification failed, trying postMessage / fallback:', swErr);
      }
    }

    // Fallback for desktop Safari / older browsers
    try {
      const notif = new Notification(title, options);
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (e) {
      console.warn('Standard Notification fallback failed:', e);
    }
  }
}

// Send instant test notification to this specific phone
export async function sendTestNotificationToThisDevice(
  title: string,
  message: string,
  linkTab: string = 'play'
): Promise<boolean> {
  // Try local native trigger first
  await sendSystemDeviceNotification(title, message, `test-${Date.now()}`, linkTab);

  // Also try sending through backend Web Push if subscribed
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager?.getSubscription();
      if (subscription) {
        await fetch('/api/push/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription, title, message, linkTab }),
        });
      }
    } catch {}
  }

  return true;
}
