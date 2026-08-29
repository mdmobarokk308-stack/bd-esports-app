import React, { useState } from 'react';
import { Send, MessageSquare, PhoneCall, ShieldAlert, X, ExternalLink, HelpCircle } from 'lucide-react';

interface FloatingSupportProps {
  telegramLink?: string;
}

export const FloatingSupport: React.FC<FloatingSupportProps> = ({ telegramLink }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentTelegram = telegramLink || localStorage.getItem('admin_telegram_link') || 'https://t.me/esportsclubbd';
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'আসসালামু আলাইকুম! Esports Club সাপোর্টে আপনাকে স্বাগতম। আপনার কি ধরনের সাহায্য প্রয়োজন?',
      time: 'Just now',
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'user', text: userText, time }]);
    setChatMessage('');

    setTimeout(() => {
      let reply = 'ধন্যবাদ! আমাদের কাস্টমার সাপোর্ট টিম দ্রুত আপনার সাথে যোগাযোগ করবে। জরুরি সহায়তার জন্য আমাদের অফিসিয়াল টেলিগ্রাম চ্যানেলে জয়েন করুন।';
      if (userText.toLowerCase().includes('room') || userText.includes('রুম')) {
        reply = 'ম্যাচ শুরু হওয়ার ঠিক ১০ মিনিট আগে "My Matches" ট্যাবে রুম আইডি ও পাসওয়ার্ড পাওয়া যাবে।';
      } else if (userText.toLowerCase().includes('deposit') || userText.includes('টাকা') || userText.includes('ডিপোজিট')) {
        reply = 'ওয়ালেট থেকে bKash/Nagad/Rocket এ টাকা সেন্ড মানি করে TrxID সাবমিট করুন, ৫ মিনিটে ব্যালেন্স যোগ হবে।';
      } else if (userText.toLowerCase().includes('withdraw') || userText.includes('উইথড্র')) {
        reply = 'মিনিমাম ৫০ টাকা হলে Profile > Withdraw অপশন থেকে উইথড্র রিকোয়েস্ট করতে পারবেন।';
      }
      setMessages((prev) => [...prev, { sender: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 800);
  };

  return (
    <>
      {/* Floating Mascot Button */}
      <button
        id="floating-support-button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 group cursor-pointer transform transition-all duration-300 hover:scale-110 active:scale-95 filter drop-shadow-xl"
        title="24/7 Support Desk"
      >
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 p-1 border-2 border-white shadow-2xl flex items-center justify-center">
          {/* Mascot Face Icon from Screenshot */}
          <div className="w-full h-full rounded-full bg-indigo-900 flex items-center justify-center relative overflow-hidden">
            {/* Mascot Head with Headphones */}
            <div className="w-10 h-10 rounded-full bg-[#fcd34d] flex items-center justify-center relative border border-amber-600">
              {/* Eyes */}
              <div className="absolute top-3 left-2.5 w-1.5 h-1.5 rounded-full bg-slate-900" />
              <div className="absolute top-3 right-2.5 w-1.5 h-1.5 rounded-full bg-slate-900" />
              {/* Smile */}
              <div className="absolute bottom-2.5 w-4 h-2 border-b-2 border-slate-900 rounded-full" />
              {/* Headset arc */}
              <div className="absolute -top-1 w-9 h-6 border-t-2 border-l-2 border-r-2 border-indigo-700 rounded-t-full" />
              {/* Headset ear cushions */}
              <div className="absolute top-2 -left-1 w-2 h-4 rounded-full bg-indigo-700" />
              <div className="absolute top-2 -right-1 w-2 h-4 rounded-full bg-indigo-700" />
              {/* Mic boom */}
              <div className="absolute bottom-1 right-0 w-3 h-1 bg-indigo-800 rounded-full rotate-45" />
            </div>
          </div>
          {/* Ping indicator */}
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white" />
          </span>
        </div>
      </button>

      {/* Support Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div
            id="support-modal-card"
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-800 p-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-slate-900 font-bold">
                  🎧
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Esports Club Help Desk</h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    24/7 Live Helpline & Support
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Channels */}
            <div className="bg-slate-50 border-b border-slate-200 p-3 grid grid-cols-2 gap-2 text-xs">
              <a
                href={currentTelegram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Telegram Giveaway</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-75" />
              </a>
              <a
                href="https://wa.me/8801612456053"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
              >
                <PhoneCall className="w-4 h-4" />
                <span>WhatsApp Admin</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-75" />
              </a>
            </div>

            {/* Chat conversation area */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[220px] bg-slate-100/70 font-bengali">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <span
                      className={`block text-[10px] mt-1 ${
                        msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto text-xs whitespace-nowrap">
              <button
                onClick={() => setChatMessage('রুম আইডি পাচ্ছি না')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full cursor-pointer"
              >
                🔑 রুম আইডি প্রবলেম
              </button>
              <button
                onClick={() => setChatMessage('ডিপোজিট ব্যালেন্স যোগ হয়নি')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full cursor-pointer"
              >
                💳 ডিপোজিট ইস্যু
              </button>
              <button
                onClick={() => setChatMessage('হ্যাকার রিপোর্ট করতে চাই')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full cursor-pointer"
              >
                ⚠️ হ্যাকার রিপোর্ট
              </button>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="মেসেজ লিখুন..."
                className="flex-1 px-4 py-2 bg-slate-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bengali text-slate-800"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
