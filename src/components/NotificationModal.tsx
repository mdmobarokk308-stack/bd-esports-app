import React from 'react';
import { Bell, CheckCheck, Clock, Gamepad2, Sparkles, Trash2, X } from 'lucide-react';
import { AppNotification, TabType } from '../types';

interface NotificationModalProps {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onNotificationClick: (notification: AppNotification) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notifications,
  onClose,
  onMarkAllRead,
  onClearAll,
  onNotificationClick,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-xs">
              <Bell className="w-5 h-5 fill-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-rajdhani text-lg font-black text-slate-900 flex items-center gap-2">
                NOTIFICATIONS
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold font-rajdhani">
                    {unreadCount} NEW
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Tournament & App updates</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 bg-slate-100/60 border-b border-slate-100 flex items-center justify-between text-xs font-rajdhani font-bold">
            <button
              onClick={onMarkAllRead}
              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>

            <button
              onClick={onClearAll}
              className="text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="p-3 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-14 h-14 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-3">
                <Bell className="w-7 h-7 stroke-[1.5]" />
              </div>
              <p className="font-rajdhani font-bold text-base text-slate-600">No Notifications</p>
              <p className="text-xs text-slate-400 mt-1">You're all caught up with match alerts!</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => onNotificationClick(item)}
                className={`pt-2.5 pb-1 px-3 rounded-2xl transition cursor-pointer flex gap-3 items-start ${
                  item.read
                    ? 'bg-transparent hover:bg-slate-50'
                    : 'bg-amber-50/70 border border-amber-200/60 hover:bg-amber-100/60'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.category === 'deposit'
                      ? 'bg-emerald-100 text-emerald-700'
                      : item.category === 'room'
                      ? 'bg-blue-100 text-blue-700'
                      : item.category === 'offer'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {item.category === 'offer' ? (
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <Gamepad2 className="w-4 h-4 stroke-[2.5]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`text-sm font-bengali leading-tight ${
                        item.read ? 'font-bold text-slate-800' : 'font-black text-slate-950'
                      }`}
                    >
                      {item.title}
                    </h4>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs font-bengali text-slate-600 mt-0.5 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-rajdhani font-semibold mt-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{item.timestamp}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
