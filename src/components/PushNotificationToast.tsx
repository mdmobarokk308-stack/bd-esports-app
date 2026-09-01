import React, { useEffect, useState } from 'react';
import { Bell, ChevronDown, ChevronUp, Gamepad2, X } from 'lucide-react';
import { AppNotification } from '../types';
import { sendSystemDeviceNotification } from '../utils/notificationUtils';

interface PushNotificationToastProps {
  notification: AppNotification | null;
  onClose: () => void;
  onClick?: (notification: AppNotification) => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  notification,
  onClose,
  onClick,
}) => {
  const [visible, setVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (notification) {
      // Check if user has app notifications enabled in localStorage (defaults to enabled)
      const isEnabled = localStorage.getItem('bd_esports_app_notifications_enabled') !== 'false';

      if (isEnabled) {
        setVisible(true);
        // Dispatch sound chime, vibration & native device system push notification
        sendSystemDeviceNotification(notification.title, notification.message, notification.id);

        const timer = setTimeout(() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }, 9000);

        return () => clearTimeout(timer);
      }
    }
  }, [notification, onClose]);

  if (!notification || !visible) return null;

  return (
    <div className="fixed top-3 left-3 right-3 z-50 flex justify-center pointer-events-none transition-all duration-300">
      <div
        id={`push-notification-${notification.id}`}
        onClick={() => {
          if (onClick) onClick(notification);
        }}
        className="w-full max-w-sm bg-white/95 backdrop-blur-md text-slate-900 rounded-3xl p-3.5 sm:p-4 shadow-[0_16px_40px_rgba(0,0,0,0.4)] border border-slate-200/90 pointer-events-auto cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] select-none animate-in slide-in-from-top-4"
      >
        {/* Top bar: App Icon + App Name + Time + Bell matching Screenshot */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-rajdhani">
          <div className="flex items-center gap-2">
            {/* App Icon Circle */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-xs border border-amber-300 shrink-0">
              <Gamepad2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>

            <span className="font-bold text-slate-700 tracking-wide text-xs flex items-center gap-1">
              BD ESPORTS MS
              <span className="text-slate-400">•</span>
              <span className="text-[11px] text-slate-400 font-normal">{notification.timestamp || 'just now'}</span>
              <Bell className="w-3 h-3 text-amber-500 fill-amber-500 ml-0.5 inline" />
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setVisible(false);
                setTimeout(onClose, 250);
              }}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title and Message matching Screenshot */}
        <div className="pl-8 pr-1 space-y-1">
          <h4 className="text-sm font-black text-slate-950 font-bengali leading-snug tracking-tight flex items-center gap-1">
            {notification.title}
          </h4>
          {isExpanded && (
            <p className="text-xs font-semibold text-slate-700 font-bengali leading-relaxed transition-all">
              {notification.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};


