import React, { useState } from 'react';
import { Menu, Bell, Sun, Moon, Search } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
  toggleSidebar: () => void;
}

export const Navbar: React.FC<Props> = ({ toggleSidebar }) => {
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Toggle Dark Mode
  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    const html = document.documentElement;
    if (!darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  };

  const notifications = [
    { id: 1, text: 'Level Up Unlocked: First Habit! 🏅', time: '5m ago', read: false },
    { id: 2, text: 'Streak Warning: Complete "Read 10 pages" soon! ⚡', time: '1h ago', read: false },
    { id: 3, text: 'AI Insight: Consistency improved! 📈', time: '2h ago', read: true },
  ];

  return (
    <header className="h-20 bg-transparent sticky top-0 z-20 px-6 md:px-8 flex items-center justify-between border-none">
      {/* Left section: mobile toggle and search bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-2xl bg-white border border-black/5 text-slate-600 hover:text-black shadow-sm shadow-black/5 transition-all lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search bar matching mockup */}
        <div className="relative hidden md:block w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search habits, goals, settings..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-black/5 text-xs text-slate-800 placeholder-slate-400 shadow-sm shadow-black/5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/5 transition-all font-medium"
          />
        </div>
      </div>

      {/* Right section: notifications, theme, profile */}
      <div className="flex items-center gap-3.5 select-none">
        {/* Theme toggle */}
        <button
          onClick={handleThemeToggle}
          className="p-2.5 rounded-2xl bg-white border border-black/5 text-slate-400 hover:text-black shadow-sm shadow-black/5 transition-all duration-200"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4.5 h-4.5 text-slate-600" /> : <Moon className="w-4.5 h-4.5 text-slate-600" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-2xl bg-white border border-black/5 text-slate-600 hover:text-black shadow-sm shadow-black/5 relative transition-all duration-200"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div
                onClick={() => setShowNotifications(false)}
                className="fixed inset-0 z-30"
              />
              <div className="absolute right-0 mt-3 w-80 bg-white border border-black/5 rounded-[24px] p-4 shadow-2xl z-40">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2.5">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Notifications</h3>
                  <span className="text-[10px] text-slate-500 hover:text-black font-bold hover:underline cursor-pointer">Mark all read</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-2.5 rounded-xl border transition-all text-left ${
                        notif.read
                          ? 'bg-transparent border-transparent text-slate-400'
                          : 'bg-slate-50 border-slate-100 text-slate-700'
                      }`}
                    >
                      <p className="text-xs font-semibold leading-relaxed">{notif.text}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile matching mockup */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-black/5 shadow-sm shadow-black/5">
          <span className="text-xs font-bold text-slate-700 hidden sm:inline">{user?.name}</span>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-black/5 flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-extrabold text-xs text-slate-700">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
