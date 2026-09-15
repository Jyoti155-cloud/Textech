import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Volume2, LogOut, ChevronDown, CheckCircle2, UserCheck } from 'lucide-react';

interface NavbarProps {
  onOpenApiDocs?: () => void;
  activeTab: 'convert' | 'history';
  setActiveTab: (tab: 'convert' | 'history') => void;
  historyCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenApiDocs,
  activeTab,
  setActiveTab,
  historyCount = 0,
}) => {
  const { user, logout, openAuthModal } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Textech(Text -&gt; Speech)</span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Indian & Global Voice Synthesis</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              id="nav-tab-convert"
              onClick={() => setActiveTab('convert')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'convert'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Synthesizer
            </button>
            <button
              id="nav-tab-history"
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Saved Audio</span>
              {historyCount > 0 && (
                <span className="text-[11px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full">
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="relative">
                <button
                  id="btn-user-profile-menu"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
                >
                  <img
                    src={
                      user.avatarUrl ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
                    }
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-900 leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{user.email}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900">{user.name}</p>
                        <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded">
                          {user.role || 'Member'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <button
                      id="menu-item-view-history"
                      onClick={() => {
                        setActiveTab('history');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span>Personal Audio Library</span>
                      <span className="text-indigo-600 font-mono text-[11px] font-bold">
                        {historyCount} items
                      </span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      id="menu-item-logout"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-navbar-login"
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Sign In
                </button>
                <button
                  id="btn-navbar-signup"
                  onClick={() => openAuthModal('register')}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
