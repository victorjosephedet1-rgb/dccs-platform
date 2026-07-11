import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Mail, Phone, ExternalLink } from 'lucide-react';
import MinimalHeader from './MinimalHeader';
import EnhancedHeader from './EnhancedHeader';
import Breadcrumbs from './Breadcrumbs';
import NetworkStatus from './NetworkStatus';

interface GlobalLayoutProps {
  children: React.ReactNode;
}

const PREMIUM_ROUTES = ['/', '/upload', '/dashboard'];

const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isPremiumRoute = PREMIUM_ROUTES.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <NetworkStatus />
      {isPremiumRoute ? <MinimalHeader /> : <EnhancedHeader />}
      {!isPremiumRoute && <Breadcrumbs />}

      <main className="flex-1 min-h-0">
        {children}
      </main>

      {isPremiumRoute ? (
        /* ── Minimal footer for hero/premium pages ── */
        <footer
          className="border-t"
          style={{
            background: 'rgba(11, 15, 23, 0.95)',
            borderColor: 'rgba(148, 163, 184, 0.1)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-neutral-400 text-sm">
                  &copy; {new Date().getFullYear()} Digital Creative Copyright System (DCCS)
                </p>
                <p className="text-neutral-600 text-xs mt-0.5">
                  Powered by{' '}
                  <a
                    href="https://victor360brand.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 hover:text-white transition-colors"
                  >
                    Victor360 Brand Limited
                  </a>
                </p>
              </div>

              <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label="Footer navigation">
                <Link to="/verify-dccs-code" className="text-neutral-500 hover:text-white text-sm transition-colors">
                  Verification
                </Link>
                <Link to="/safety" className="text-neutral-500 hover:text-white text-sm transition-colors">
                  Safety
                </Link>
                <a href="/legal/terms-of-service.html" className="text-neutral-500 hover:text-white text-sm transition-colors">
                  Terms
                </a>
                <a href="/legal/privacy-policy.html" className="text-neutral-500 hover:text-white text-sm transition-colors">
                  Privacy
                </a>
              </nav>
            </div>
          </div>
        </footer>
      ) : (
        /* ── Full footer for content pages ── */
        <footer
          className="border-t"
          style={{
            background: 'rgba(9, 13, 20, 0.98)',
            borderColor: 'rgba(148, 163, 184, 0.08)',
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            {/* Main grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">

              {/* Brand column */}
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <span className="text-xl font-bold text-white">DCCS</span>
                </div>
                <p className="text-xs text-neutral-600 mb-4">Digital Creative Copyright System</p>
                <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
                  {t('footer.description', 'The global standard for digital copyright verification. Protect your creative work instantly.')}
                </p>
                <p className="text-neutral-600 text-xs mt-5">
                  {t('footer.copyright', { year: new Date().getFullYear(), defaultValue: `© ${new Date().getFullYear()} Victor360 Brand Limited` })}
                </p>
              </div>

              {/* Platform links */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">Platform</h3>
                <nav className="space-y-2.5" aria-label="Platform links">
                  {[
                    { to: '/upload',      label: 'Upload Work' },
                    { to: '/verify',      label: 'Verify Code' },
                    { to: '/dashboard',   label: 'Dashboard' },
                    { to: '/library',     label: 'My Library' },
                    { to: '/guidelines',  label: 'Guidelines' },
                    { to: '/story',       label: 'Platform Story' },
                    { to: '/safety',      label: 'Safety Center' },
                    { to: '/careers',     label: 'Careers' },
                  ].map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className="block text-sm text-neutral-500 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">Contact</h3>
                <div className="space-y-3">
                  <a
                    href="mailto:info@victor360brand.com"
                    className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors group"
                  >
                    <Mail className="h-3.5 w-3.5 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
                    <span className="truncate">info@victor360brand.com</span>
                  </a>
                  <a
                    href="mailto:partnership@victor360brand.com"
                    className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors group"
                  >
                    <Mail className="h-3.5 w-3.5 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
                    <span className="truncate">partnership@victor360brand.com</span>
                  </a>
                  <a
                    href="tel:+12023866699"
                    className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors group"
                  >
                    <Phone className="h-3.5 w-3.5 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
                    +1 (202) 386-6699
                  </a>
                  <a
                    href="tel:+447438929365"
                    className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors group"
                  >
                    <Phone className="h-3.5 w-3.5 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
                    +44 7438 929365
                  </a>
                  <p className="text-xs text-neutral-700">United Kingdom</p>
                </div>

                <div className="mt-6">
                  <a
                    href="https://victor360brand.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    victor360brand.com
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div
              className="mt-10 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
              style={{ borderColor: 'rgba(148, 163, 184, 0.07)' }}
            >
              <p className="text-neutral-700 text-xs text-center sm:text-left">
                {t('footer.builtBy', 'Built with care by Victor360 Brand Limited')}
              </p>
              <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5" aria-label="Legal links">
                <a href="/legal/terms-of-service.html"  className="text-xs text-neutral-700 hover:text-neutral-400 transition-colors">Terms</a>
                <a href="/legal/privacy-policy.html"    className="text-xs text-neutral-700 hover:text-neutral-400 transition-colors">Privacy</a>
                <a href="/legal/cookie-policy.html"     className="text-xs text-neutral-700 hover:text-neutral-400 transition-colors">Cookies</a>
                <a href="/legal/dmca-policy.html"       className="text-xs text-neutral-700 hover:text-neutral-400 transition-colors">DMCA</a>
              </nav>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default GlobalLayout;
