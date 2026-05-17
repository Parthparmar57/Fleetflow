import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  MapPin, 
  Wrench, 
  BarChart3, 
  Settings, 
  Bell, 
  Search, 
  Menu, 
  X,
  LogOut,
  Fuel
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../context/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ icon: Icon, label, to, active, collapsed, onClick }: any) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
      active 
        ? "bg-primary text-white shadow-lg shadow-emerald-600/20 active-glow" 
        : "text-slate-500 hover:bg-emerald-50 hover:text-primary"
    )}
  >
    <Icon size={20} className={cn("shrink-0", active ? "text-white" : "group-hover:scale-110 transition-transform")} />
    {!collapsed && <span className="font-bold text-sm tracking-tight">{label}</span>}
    {active && !collapsed && (
      <motion.div 
        layoutId="active-pill"
        className="absolute right-2 w-1.5 h-6 bg-white/40 rounded-full"
      />
    )}
  </Link>
);

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/app' },
    { icon: Truck, label: 'Vehicles', to: '/app/vehicles' },
    { icon: Users, label: 'Drivers', to: '/app/drivers' },
    { icon: MapPin, label: 'Trips', to: '/app/trips' },
    { icon: Wrench, label: 'Maintenance', to: '/app/maintenance' },
    { icon: Fuel, label: 'Expenses', to: '/app/expenses', roles: ['fleet_manager', 'financial_analyst', 'dispatcher'] },
    { icon: BarChart3, label: 'Analytics', to: '/app/analytics', roles: ['fleet_manager', 'financial_analyst'] },
    { icon: Settings, label: 'Settings', to: '/app/settings' },
  ].filter(item => !item.roles || item.roles.includes(user?.role || ''));

  const handleLogout = async () => {
    // ✅ SECURITY FIX: Call async logout to clear HTTPOnly cookie on server
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* --- Sidebar (Desktop) --- */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 sticky top-0 h-screen",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
            <Truck className="text-white" size={20} />
          </div>
          {isSidebarOpen && (
            <span className="font-black text-2xl tracking-tighter text-slate-900">
              Fleet<span className="emerald-gradient-text">Flow</span>
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.label}
              {...item}
              active={location.pathname === item.to}
              collapsed={!isSidebarOpen}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <button 
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            {isSidebarOpen && <span className="text-sm font-medium">Collapse Menu</span>}
          </button>
        </div>
      </aside>

      {/* --- Mobile Menu Overlay --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Truck className="text-white" size={18} />
                  </div>
                  <span className="font-bold text-xl tracking-tight">FleetFlow</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-4 space-y-1 mt-4">
                {menuItems.map((item) => (
                  <SidebarItem
                    key={item.label}
                    {...item}
                    active={location.pathname === item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                ))}
              </nav>
              <div className="p-4 border-t border-slate-100">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut size={20} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center bg-slate-50 rounded-2xl px-4 py-2 w-64 lg:w-96 border border-slate-200 focus-within:border-primary/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-300">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Find anything..." 
                className="bg-transparent border-none focus:ring-0 text-sm w-full ml-3 font-medium text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
            <Link to="/app/profile" className="flex items-center gap-3 pl-2 hover:bg-slate-50 p-1 rounded-xl transition-colors cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none group-hover:text-primary transition-colors">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 mt-1">{user?.role || 'Member'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden group-hover:border-primary transition-all">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} alt="Avatar" referrerPolicy="no-referrer" />
              </div>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
