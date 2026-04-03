import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MinimalHeader from './MinimalHeader';
import EnhancedHeader from './EnhancedHeader';
import Breadcrumbs from './Breadcrumbs';
import NetworkStatus from './NetworkStatus';

interface GlobalLayoutProps {
  children: React.ReactNode;
}

const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const isPremiumRoute = ['/', '/upload', '/dashboard'].includes(location.pathname);

  return (
    <div className="min-h-screen">
      <NetworkStatus />
      {isPremiumRoute ? <MinimalHeader /> : <EnhancedHeader />}
      {!isPremiumRoute && <Breadcrumbs />}

      <main className="min-h-screen">
        {children}
      </main>

      {/* Minimal Footer for Premium Routes */}
      {isPremiumRoute ? (
        <footer className="bg-neutral-950 border-t border-neutral-800 py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="text-neutral-400 text-sm">
                <div>© {new Date().getFullYear()} Digital Creative Copyright System (DCCS) — Instant Ownership Verification</div>
                <div className="text-neutral-500 text-xs mt-1">
                  Powered by <a href="https://victor360brand.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">Victor360 Brand Limited</a>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <Link to="/verify-dccs-code" className="text-neutral-400 hover:text-white transition-colors">
                  Verification
                </Link>
                <Link to="/safety" className="text-neutral-400 hover:text-white transition-colors">
                  Safety
                </Link>
                <a href="/legal/terms-of-service.html" className="text-neutral-400 hover:text-white transition-colors">
                  Terms
                </a>
                <a href="/legal/privacy-policy.html" className="text-neutral-400 hover:text-white transition-colors">
                  Privacy
                </a>
              </div>
            </div>
          </div>
        </footer>
      ) : (
        <footer className="bg-slate-900/90 backdrop-blur-xl text-white py-16 px-6 border-t border-slate-700/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div>
                <div className="mb-6">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    DCCS
                  </span>
                  <div className="text-xs text-slate-500 mt-1">Digital Creative Copyright System</div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-4">
                  {t('footer.description')}
                </p>
                <p className="text-slate-500 text-xs">
                  {t('footer.copyright', { year: new Date().getFullYear() })}
                </p>
              </div>

              <div>
                <h3 className="text-heading text-white font-semibold mb-4">Platform</h3>
                <div className="space-y-3">
                  <Link to="/marketplace" className="block text-slate-400 hover:text-white text-sm transition-colors">
                    Marketplace
                  </Link>
                  <Link to="/dashboard" className="block text-slate-400 hover:text-white text-sm transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/guidelines" className="block text-slate-400 hover:text-white text-sm transition-colors">
                    Guidelines
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="text-heading text-white font-semibold mb-4">Contact</h3>
                <div className="space-y-3">
                  <a href="mailto:info@victor360brand.com" className="block text-slate-400 hover:text-white text-sm transition-colors">
                    info@victor360brand.com
                  </a>
                  <a href="mailto:partnership@victor360brand.com" className="block text-slate-400 hover:text-white text-sm transition-colors">
                    partnership@victor360brand.com
                  </a>
                  <a href="tel:+12023866699" className="block text-slate-400 hover:text-white text-sm transition-colors">
                    +1 (202) 386-6699
                  </a>
                  <a href="tel:+447438929365" className="block text-slate-400 hover:text-white text-sm transition-colors">
                    +44 7438 929365
                  </a>
                  <div className="text-slate-400 text-sm">United Kingdom</div>
                </div>
              </div>
            </div>

            <div className="text-center text-slate-500 text-xs mt-12 pt-8 border-t border-slate-700/50">
              <div>{t('footer.builtBy')}</div>
              <div className="mt-2">
                Powered by <a href="https://victor360brand.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Victor360 Brand Limited</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default GlobalLayout;