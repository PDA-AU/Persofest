import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { User, LogOut, Menu, X } from 'lucide-react';

const Sidebar = ({ isOpen, onToggle }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Header Bar - fixed at top */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-primary border-b-4 border-black z-40 flex items-center px-4">
        <button
          onClick={onToggle}
          className="p-2 border-2 border-black bg-white hover:bg-accent transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-sm active:translate-x-0 active:translate-y-0"
          data-testid="mobile-menu-toggle"
        >
          {isOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
        </button>
        <div className="flex items-center gap-2 ml-3">
          <img src="/persofest.png" alt="PERSOFEST'26" className="h-8 w-auto" />
          <span className="font-heading text-xs text-black tracking-tight">PERSOFEST'26</span>
        </div>
      </div>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-14" />

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 lg:top-0 left-0 h-full w-64 bg-surface border-r-4 border-black z-40 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        data-testid="sidebar"
      >
        {/* Logo */}
        <div className="p-6 border-b-4 border-black bg-primary">
          <Link to="/dashboard" className="flex flex-col items-center gap-2">
            <img src="/persofest.png" alt="PERSOFEST'26" className="h-12 w-auto" />
            <span className="font-heading text-sm text-black tracking-tight">PERSOFEST'26</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b-4 border-black bg-accent">
          <p className="font-heading text-xs uppercase tracking-widest mb-1">Welcome</p>
          <p className="font-body text-sm font-bold truncate">{user?.name}</p>
          <p className="font-body text-xs text-gray-700 truncate">{user?.register_number}</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path} className="stagger-item">
                  <Link
                    to={item.path}
                    onClick={() => onToggle()}
                    className={`flex items-center gap-3 px-4 py-3 font-body text-sm font-bold uppercase tracking-wider border-2 border-black transition-all duration-200 ${
                      isActive
                        ? 'bg-secondary text-white shadow-brutal translate-x-[-2px] translate-y-[-2px]'
                        : 'bg-white hover:bg-accent hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal'
                    }`}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <Icon size={18} strokeWidth={2.5} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t-4 border-black">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 font-body text-sm font-bold uppercase tracking-wider border-2 border-black bg-white hover:bg-primary transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal"
            data-testid="logout-button"
          >
            <LogOut size={18} strokeWidth={2.5} />
            Logout
          </button>
        </div>

        {/* Decorative element */}
        <div className="absolute bottom-24 right-4 w-16 h-16 border-2 border-black bg-secondary rotate-12 -z-10" />
      </aside>
    </>
  );
};

export default Sidebar;
