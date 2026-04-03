import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Home, Upload, Menu, X, Folder, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import GlobalLanguageSwitcher from './GlobalLanguageSwitcher';
import BrandLogo from './BrandLogo';

export default function EnhancedHeader() {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const { currentSector } = useNavigation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-black/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <BrandLogo className="h-7 w-auto" />

          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              Home
            </Link>

            <Link
              to="/upload"
              className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              Upload
            </Link>

            <Link
              to="/downloads"
              className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              Downloads
            </Link>

            <Link
              to="/dccs-system"
              className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              DCCS System
            </Link>

            <Link
              to="/verify"
              className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              Verify
            </Link>

            {isAuthenticated && (
              <Link
                to="/library"
                className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                <Folder className="h-4 w-4" />
                <span>Library</span>
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <GlobalLanguageSwitcher />

            {isAuthenticated ? (
              <div className="hidden lg:flex items-center space-x-4">
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-black px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors"
                >
                  Sign Up Free
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10">
            <nav className="space-y-2">
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                <span>{t('navigation.home')}</span>
              </Link>

              <Link
                to="/upload"
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Upload className="h-4 w-4" />
                <span>{t('navigation.upload')}</span>
              </Link>

              <Link
                to="/downloads"
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Folder className="h-4 w-4" />
                <span>Downloads</span>
              </Link>

              <Link
                to="/dccs-system"
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4" />
                <span>DCCS System</span>
              </Link>

              <Link
                to="/verify"
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4" />
                <span>Verify</span>
              </Link>

              {isAuthenticated && (
                <Link
                  to="/library"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Folder className="h-4 w-4" />
                  <span>Library</span>
                </Link>
              )}

              <Link
                to="/story"
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4" />
                <span>Our Story</span>
              </Link>

              <Link
                to="/safety"
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4" />
                <span>Safety</span>
              </Link>

              <Link
                to="/careers"
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4" />
                <span>Careers</span>
              </Link>

              {isAuthenticated ? (
                <div className="border-t border-white/10 pt-4 mt-4">
                  <div className="flex items-center space-x-2 px-4 py-2 text-gray-300">
                    <User className="h-5 w-5 text-purple-400" />
                    <span>{user?.name}</span>
                    <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>{t('navigation.logout')}</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-white/10 pt-4 mt-4 space-y-2 px-4">
                  <Link
                    to="/login"
                    className="block text-center py-2 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('navigation.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
