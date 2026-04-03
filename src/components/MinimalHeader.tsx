import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BrandLogo from './BrandLogo';

export default function MinimalHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <BrandLogo className="h-8 w-auto" />

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/upload"
              className="text-neutral-400 hover:text-white transition-colors text-sm font-medium"
            >
              Upload
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="text-neutral-400 hover:text-white transition-colors text-sm font-medium"
                >
                  My Projects
                </Link>
                <Link
                  to="/verify-dccs-code"
                  className="text-neutral-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Verification
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl py-2">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      Settings
                    </Link>
                    <div className="border-t border-neutral-800 my-2" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-neutral-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-white text-neutral-950 rounded-lg text-sm font-medium hover:bg-neutral-100 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
