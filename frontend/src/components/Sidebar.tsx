import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  Home,
  Flame,
  Target,
  User,
  LogOut
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<Props> = ({ isOpen, toggleSidebar }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Habits', icon: Flame, path: '/habits' },
    { name: 'Goals', icon: Target, path: '/goals' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-4 left-4 z-40 w-20 bg-[#0E0E0E] text-white rounded-[28px] flex flex-col justify-between items-center py-8 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col items-center w-full">
          {/* Header Logo */}
          <div 
            onClick={() => navigate('/')}
            className="flex flex-col items-center justify-center text-center select-none mb-12 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
            title="Level Up"
          >
            <span className="text-[10px] font-black tracking-widest text-white uppercase leading-none">Level</span>
            <span className="text-[9px] font-black tracking-widest text-primary-light uppercase mt-1.5 leading-none">Up</span>
          </div>

          {/* Navigation Icons */}
          <nav className="flex flex-col gap-5 items-center w-full px-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) =>
                  `w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group relative ${
                    isActive
                      ? 'bg-white text-black scale-105 shadow-md shadow-white/5'
                      : 'text-slate-500 hover:bg-white/5 hover:text-white'
                  }`
                }
                title={item.name}
              >
                <item.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                {/* Tooltip on hover */}
                <span className="absolute left-full ml-4 px-2.5 py-1.5 rounded-lg bg-black text-white text-2xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/5">
                  {item.name}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Sign Out */}
        <button
          onClick={handleLogout}
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group relative"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
          <span className="absolute left-full ml-4 px-2.5 py-1.5 rounded-lg bg-black text-red-400 text-2xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/5">
            Sign Out
          </span>
        </button>
      </aside>
    </>
  );
};
export default Sidebar;
