import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User, LogOut, Home, Upload, Download, Menu, X, Folder,
  BookOpen, Shield, Briefcase, ShoppingBag, LayoutDashboard, Search,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import GlobalLanguageSwitcher from './GlobalLanguageSwitcher';
import BrandLogo from './BrandLogo';

const PUBLIC_NAV = [
  { to: '/',            label: 'Home',        icon: Home },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { to: '/dccs-system', label: 'DCCS System', icon: Shield },
  { to: '/verify',      label: 'Verify',      icon: Shield },
];

const AUTH_NAV = [
  { to: '/upload',     label: 'Upload',    icon: Upload },
  { to: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { to: '/library',    label: 'Library',   icon: Folder },
  { to: '/downloads',  label: 'Downloads', icon: Download },
];

const MOBILE_EXTRA = [
  { to: '/story',   label: 'Our Story', icon: BookOpen },
  { to: '/safety',  label: 'Safety',    icon: Shield },
  { to: '/careers', label: 'Careers',   icon: Briefcase },
];

export default function EnhancedHeader() {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const allDesktopLinks = isAuthenticated
    ? [...PUBLIC_NAV.filter((l) => l.to !== '/'), ...AUTH_NAV]
    : PUBLIC_NAV;

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(11, 15, 23, 0.96)' : 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0" aria-label="DCCS Home">
            <BrandLogo className="h-7 sm:h-8 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Primary navigation">
            {allDesktopLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`
                  px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150
                  ${isActive(to)
                    ? 'text-white bg-white/8'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search button */}
            <Link
              to="/search"
              aria-label="Search"
              className={`p-2 rounded-lg transition-colors ${
                isActive('/search') ? 'text-white bg-white/8' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="h-4 w-4" />
            </Link>

            <div className="hidden sm:block">
              <GlobalLanguageSwitcher />
            </div>

            {/* Desktop auth */}
            {isAuthenticated ? (
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-neutral-400" />
                  </div>
                  <span className="text-sm text-neutral-300 max-w-[120px] truncate">{user?.name ?? user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors min-h-[40px]"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors min-h-[40px] flex items-center"
                >
                  {t('navigation.login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors min-h-[40px] flex items-center"
                >
                  Sign Up Free
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/8 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden py-3 border-t animate-slide-down"
            style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
          >
            <div className="sm:hidden px-3 pb-3">
              <GlobalLanguageSwitcher />
            </div>

            <nav className="space-y-0.5">
              {PUBLIC_NAV.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`mobile-nav-item ${isActive(to) ? 'text-white bg-white/8' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{label}</span>
                </Link>
              ))}

              {isAuthenticated && AUTH_NAV.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`mobile-nav-item ${isActive(to) ? 'text-white bg-white/8' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{label}</span>
                </Link>
              ))}

              {MOBILE_EXTRA.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`mobile-nav-item ${isActive(to) ? 'text-white bg-white/8' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            <div
              className="mt-3 pt-3 border-t space-y-1"
              style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
            >
              {isAuthenticated ? (
                <>
                  {user && (
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <div className="w-8 h-8 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-neutral-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{user.name ?? user.email}</p>
                        {user.role && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 text-xs bg-neutral-800 text-neutral-400 rounded-full capitalize">
                            {user.role}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="mobile-nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/8"
                  >
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                    <span>{t('navigation.logout')}</span>
                  </button>
                </>
              ) : (
                <div className="space-y-2 px-1 pb-1">
                  <Link
                    to="/login"
                    className="flex items-center justify-center py-3 px-4 text-sm font-medium text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors min-h-[48px]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('navigation.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center py-3 px-4 bg-white text-black rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors min-h-[48px]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

