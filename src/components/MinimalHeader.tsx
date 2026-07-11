import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, LayoutDashboard, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BrandLogo from './BrandLogo';

export default function MinimalHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
    setMobileOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(11, 15, 23, 0.95)' : 'rgba(11, 15, 23, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0" aria-label="DCCS Home">
              <BrandLogo className="h-7 sm:h-8 w-auto" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
              <Link
                to="/upload"
                className="px-3 py-2 text-sm font-medium text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150"
              >
                Upload
              </Link>
              <Link
                to="/verify"
                className="px-3 py-2 text-sm font-medium text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150"
              >
                Verify
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="px-3 py-2 text-sm font-medium text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150"
                >
                  My Projects
                </Link>
              )}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    aria-expanded={profileOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/8 transition-all duration-150 min-h-[44px]"
                  >
                    <div className="w-8 h-8 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate text-white">
                      {user?.name}
                    </span>
                  </button>

                  {profileOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 rounded-xl border shadow-xl py-1.5 overflow-hidden animate-slide-down"
                      style={{
                        background: 'rgba(15, 23, 42, 0.97)',
                        border: '1px solid rgba(148, 163, 184, 0.15)',
                        backdropFilter: 'blur(20px)',
                      }}
                      role="menu"
                    >
                      <div className="px-4 py-2.5 border-b border-neutral-800 mb-1">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/5 hover:text-white transition-colors"
                        onClick={() => setProfileOpen(false)}
                        role="menuitem"
                      >
                        <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                        Dashboard
                      </Link>
                      <Link
                        to="/library"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/5 hover:text-white transition-colors"
                        onClick={() => setProfileOpen(false)}
                        role="menuitem"
                      >
                        <Shield className="h-4 w-4 flex-shrink-0" />
                        My Library
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/5 hover:text-white transition-colors"
                        onClick={() => setProfileOpen(false)}
                        role="menuitem"
                      >
                        <Settings className="h-4 w-4 flex-shrink-0" />
                        Settings
                      </Link>
                      <div className="border-t border-neutral-800 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          role="menuitem"
                        >
                          <LogOut className="h-4 w-4 flex-shrink-0" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 min-h-[44px] flex items-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-white text-neutral-950 rounded-lg text-sm font-semibold hover:bg-neutral-100 transition-colors min-h-[44px] flex items-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-expanded={mobileOpen}
                aria-label="Toggle menu"
                className="md:hidden p-2 text-neutral-400 hover:text-white hover:bg-white/8 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileOpen && (
          <div
            className="md:hidden border-t animate-slide-down"
            style={{ borderColor: 'rgba(148, 163, 184, 0.1)' }}
          >
            <nav className="px-4 py-3 space-y-1">
              <Link to="/upload"  className="mobile-nav-item" onClick={() => setMobileOpen(false)}>Upload</Link>
              <Link to="/verify"  className="mobile-nav-item" onClick={() => setMobileOpen(false)}>Verify</Link>
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>My Projects</Link>
                  <Link to="/library"   className="mobile-nav-item" onClick={() => setMobileOpen(false)}>My Library</Link>
                </>
              )}

              <div className="border-t pt-3 mt-3 space-y-1" style={{ borderColor: 'rgba(148, 163, 184, 0.1)' }}>
                {isAuthenticated ? (
                  <>
                    {user && (
                      <div className="px-3 py-2 flex items-center gap-3">
                        <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-neutral-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={handleLogout}
                      className="mobile-nav-item w-full text-left text-red-400 hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4 flex-shrink-0" />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 px-1">
                    <Link
                      to="/login"
                      className="block text-center py-3 px-4 text-sm font-medium text-neutral-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors min-h-[44px] flex items-center justify-center"
                      onClick={() => setMobileOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block text-center py-3 px-4 bg-white text-neutral-950 rounded-xl text-sm font-semibold hover:bg-neutral-100 transition-colors min-h-[44px] flex items-center justify-center"
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign Up Free
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
