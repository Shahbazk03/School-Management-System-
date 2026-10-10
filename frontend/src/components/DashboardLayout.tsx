'use client';

import { useAuth } from '@/auth/AuthContext';
import { LogOut, User as UserIcon, Bell, Search, Menu, X, MoreHorizontal, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function DashboardLayout({
  children,
  menuItems,
}: {
  children: React.ReactNode;
  menuItems: { label: string; href: string; icon: any; group?: string }[];
}) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  // Group items for desktop sidebar
  const groups = menuItems.reduce((acc, item) => {
    const group = item.group || 'MAIN';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  // Determine top 4 for mobile nav + 'More'
  const mobileNavItems = menuItems.slice(0, 4);
  const mobileMoreItems = menuItems.slice(4);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 z-10 sticky top-0 h-screen">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 text-blue-700">
          <GraduationCap size={28} className="text-blue-600" />
          <span className="font-bold text-xl tracking-tight text-slate-900">Demo School</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              {group !== 'MAIN' && (
                <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {group}
                </p>
              )}
              <nav className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-50 text-blue-700 shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-blue-700' : 'text-slate-400'} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={logout} 
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut size={18} className="text-slate-400" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:h-screen md:overflow-hidden pb-16 md:pb-0">
        
        {/* Top Header (Desktop & Mobile) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-20 sticky top-0">
          <div className="flex items-center gap-3 md:hidden">
            <GraduationCap size={24} className="text-blue-600" />
            <span className="font-bold text-lg text-slate-900">Demo School</span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full w-96 border border-transparent focus-within:bg-white focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Search..." className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-700" />
          </div>
          
          <div className="flex-1 md:hidden" />
          
          <div className="flex items-center gap-3 md:gap-5">
            <button className="text-slate-400 hover:text-slate-600 relative transition-colors bg-slate-50 p-2 rounded-full hover:bg-slate-100">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 hidden md:block" />
            <Link href={`/${user.role.toLowerCase()}/profile`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900 leading-tight">{user.loginId}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-2 ring-white">
                <UserIcon size={18} />
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50 w-full relative">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-2 pb-safe pt-1">
        <div className="flex items-center justify-around h-16">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                }`}
                onClick={() => setMobileMoreOpen(false)}
              >
                <Icon size={20} className={isActive ? 'fill-blue-50 text-blue-600' : ''} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          {mobileMoreItems.length > 0 && (
            <button 
              onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                mobileMoreOpen ? 'text-blue-600' : 'text-slate-500'
              }`}
            >
              <MoreHorizontal size={20} />
              <span className="text-[10px] font-medium">More</span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile "More" Menu Overlay */}
      {mobileMoreOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setMobileMoreOpen(false)}>
          <div 
            className="absolute bottom-16 left-0 right-0 bg-white rounded-t-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-3" />
            <div className="p-4 grid grid-cols-3 gap-4 pb-8">
              {mobileMoreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMoreOpen(false)}
                    className="flex flex-col items-center p-3 rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-colors gap-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-1">
                      <Icon size={24} />
                    </div>
                    <span className="text-xs font-medium text-slate-700 text-center">{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => { setMobileMoreOpen(false); logout(); }}
                className="flex flex-col items-center p-3 rounded-2xl hover:bg-red-50 active:bg-red-100 transition-colors gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-1">
                  <LogOut size={24} />
                </div>
                <span className="text-xs font-medium text-red-700 text-center">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
