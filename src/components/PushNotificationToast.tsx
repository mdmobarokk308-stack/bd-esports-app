import React, { useEffect, useState } from 'react';
import { Bell, X, ExternalLink, Gamepad2 } from 'lucide-react';
import { PushNotificationItem } from '../types';

interface PushNotificationToastProps {
  onNotificationClick?: (item: PushNotificationItem) => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({ onNotificationClick }) => {
  const [currentToast, setCurrentToast] = useState<PushNotificationItem | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  useEffect(() => {
    // Check Notification permission
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setPermissionGranted(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            setPermissionGranted(true);
          }
        });
      }
    }

    // Poll for new broadcast notifications from localStorage
    const checkBroadcasts = () => {
      try {
        const stored = localStorage.getItem('bd_esports_latest_broadcast');
        if (stored) {
          const item: PushNotificationItem = JSON.parse(stored);
          const lastShownId = localStorage.getItem('bd_esports_last_shown_broadcast_id');
          if (item.id !== lastShownId) {
            setCurrentToast(item);
            localStorage.setItem('bd_esports_last_shown_broadcast_id', item.id);

            // Also trigger native browser Notification if granted and app is in background
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                const notif = new Notification(item.title, {
                  body: item.message,
                  tag: item.id
                });
                notif.onclick = () => {
                  window.focus();
                  notif.close();
                  if (onNotificationClick) onNotificationClick(item);
                };
              } catch (e) {
                console.error(e);
              }
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    const interval = setInterval(checkBroadcasts, 2000);
    return () => clearInterval(interval);
  }, [onNotificationClick]);

  if (!currentToast) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto animate-slide-down">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl p-4 shadow-2xl text-slate-100 flex items-start gap-3 backdrop-blur-md bg-opacity-95">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-lg shadow-amber-500/30">
          <Gamepad2 className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1 cursor-pointer" onClick={() => {
          if (onNotificationClick) onNotificationClick(currentToast);
          setCurrentToast(null);
        }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1">
              BD ESPORTS MS <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping"></span> Just now
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentToast(null);
              }}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h4 className="text-base font-bold text-white mt-0.5">{currentToast.title}</h4>
          <p className="text-sm text-slate-300 mt-0.5">{currentToast.message}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-400 font-semibold">
            <span>অ্যাপে প্রবেশ করতে ক্লিক করুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
