import React, { useEffect, useState } from 'react';
import { Bell, ChevronDown, Gamepad2, X } from 'lucide-react';
import { AppNotification } from '../types';

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

  useEffect(() => {
    if (notification) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification || !visible) return null;

  return (
    <div className="fixed top-2 left-0 right-0 z-50 px-3 flex justify-center pointer-events-none animate-in slide-in-from-top-4 duration-300">
      <div
        id={`push-notification-${notification.id}`}
        onClick={() => {
          if (onClick) onClick(notification);
        }}
        className="w-full max-w-sm bg-white/95 backdrop-blur-md text-slate-900 rounded-3xl p-3.5 sm:p-4 shadow-[0_12px_36px_rgba(0,0,0,0.35)] border border-slate-200/90 pointer-events-auto cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] select-none"
      >
        {/* Top bar: App Icon + App Name + Time + Bell matching Screenshot 2 */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-['Rajdhani',sans-serif]">
          <div className="flex items-center gap-2">
            {/* App Icon Circle */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-xs border border-amber-300">
              <Gamepad2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>

            <span className="font-bold text-slate-700 tracking-wide text-xs flex items-center gap-1">
              BD ESPORTS MS
              <span className="text-slate-400">•</span>
              <span className="text-[11px] text-slate-400 font-normal">{notification.timestamp || 'now'}</span>
              <Bell className="w-3 h-3 text-slate-400 fill-slate-400 ml-0.5 inline" />
            </span>
          </div>

          <div className="flex items-center gap-1">
            <ChevronDown className="w-4 h-4 text-slate-400" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setVisible(false);
                setTimeout(onClose, 250);
              }}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title and Message matching Screenshot 2 */}
        <div className="pl-8 pr-1">
          <h4 className="text-sm font-black text-slate-950 font-bengali leading-snug tracking-tight">
            {notification.title}
          </h4>
          <p className="text-xs font-semibold text-slate-700 font-bengali mt-0.5 leading-relaxed">
            {notification.message}
          </p>
        </div>
      </div>
    </div>
  );
};
