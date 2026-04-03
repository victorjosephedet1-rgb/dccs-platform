import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Home, ShoppingBag, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GlobalLanguageSwitcher from './GlobalLanguageSwitcher';
import BrandLogo from './BrandLogo';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <BrandLogo className="h-8 w-auto" />

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/marketplace"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Utility Store</span>
            </Link>
            <Link
              to="/safety"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              <Shield className="h-4 w-4" />
              <span>Safety</span>
            </Link>
            {isAuthenticated && user?.role === 'artist' && (
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <GlobalLanguageSwitcher />

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-cyan-400" />
                  <span className="text-sm text-gray-300">{user?.name}</span>
                  <span className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded-full">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}