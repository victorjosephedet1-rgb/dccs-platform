import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { NotificationProvider } from './components/NotificationSystem';
import ErrorBoundary from './components/ErrorBoundary';
import SEOHead from './components/SEOHead';
import GlobalLayout from './components/GlobalLayout';
import LoadingScreen from './components/LoadingScreen';
import UpdateNotification from './components/UpdateNotification';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import EnvironmentValidator from './components/EnvironmentValidator';
import NetworkStatusIndicator from './components/NetworkStatusIndicator';
import { useAuth } from './contexts/AuthContext';
import DCCSOnboardingModal, { useOnboardingRequired } from './components/DCCSOnboardingModal';
import { usePageViewTracking } from './hooks/useAnalytics';

const Phase1Landing = lazy(() => import('./pages/Phase1Landing'));
const Phase1Upload = lazy(() => import('./pages/Phase1Upload'));
const Phase1Downloads = lazy(() => import('./pages/Phase1Downloads'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ArtistProfile = lazy(() => import('./pages/ArtistProfile'));
const UsageGuidelines = lazy(() => import('./components/UsageGuidelines'));
const SafetyCenter = lazy(() => import('./pages/SafetyCenter'));
const SSOCallback = lazy(() => import('./pages/SSOCallback'));
const MyContent = lazy(() => import('./pages/MyContent'));
const MyContentLibrary = lazy(() => import('./pages/MyContentLibrary'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Careers = lazy(() => import('./pages/Careers'));
const PlatformStory = lazy(() => import('./pages/PlatformStory'));
const DCCSSystemInfo = lazy(() => import('./pages/DCCSSystemInfo'));
const DCCSVerificationPortal = lazy(() => import('./pages/DCCSVerificationPortal'));
const DCCSAdminDashboard = lazy(() => import('./pages/DCCSAdminDashboard'));
const DCCSRegistration = lazy(() => import('./pages/DCCSRegistration'));
const VerifyCode = lazy(() => import('./pages/VerifyCode'));
const Campaign = lazy(() => import('./pages/Campaign'));
const NotFound = lazy(() => import('./pages/NotFound'));
const DeploymentDashboard = lazy(() => import('./pages/DeploymentDashboard'));
const PilotDashboard = lazy(() => import('./pages/PilotDashboard'));
const CreatorCampaign = lazy(() => import('./pages/CreatorCampaign'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const CreatorDashboard = lazy(() => import('./pages/CreatorDashboard'));
const SearchPage = lazy(() => import('./pages/SearchPage'));

function AppContent() {
  const { loading, user } = useAuth();
  const { showOnboarding, markComplete } = useOnboardingRequired(
    user?.id ?? null,
    user ? user.onboarding_completed : null,
  );
  usePageViewTracking(user?.id);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <SEOHead />
      <UpdateNotification />
      <PWAInstallPrompt />
      <NetworkStatusIndicator />
      <EnvironmentValidator />
      {showOnboarding && user && (
        <DCCSOnboardingModal userId={user.id} onComplete={markComplete} />
      )}
      <GlobalLayout>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Phase1Landing />} />

            {/* Phase 1: Core Features - Upload & Content Management */}
            <Route path="/upload" element={<Phase1Upload />} />
            <Route path="/my-content" element={<MyContent />} />
            <Route path="/library" element={<MyContentLibrary />} />
            <Route path="/downloads" element={<Phase1Downloads />} />
            <Route path="/dashboard" element={<CreatorDashboard />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/search" element={<SearchPage />} />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/sso/callback" element={<SSOCallback />} />

            {/* Public Pages */}
            <Route path="/artist/:slug" element={<ArtistProfile />} />
            <Route path="/guidelines" element={<UsageGuidelines />} />
            <Route path="/safety" element={<SafetyCenter />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/campaign" element={<Campaign />} />
            <Route path="/creator-campaign" element={<CreatorCampaign />} />
            <Route path="/story" element={<PlatformStory />} />

            {/* DCCS System */}
            <Route path="/dccs-system" element={<DCCSSystemInfo />} />
            <Route path="/dccs-registration" element={<DCCSRegistration />} />
            <Route path="/dccs-verification" element={<DCCSVerificationPortal />} />
            <Route path="/verify" element={<VerifyCode />} />
            <Route path="/dccs-admin" element={<DCCSAdminDashboard />} />
            <Route path="/deployment" element={<DeploymentDashboard />} />
            <Route path="/pilot-dashboard" element={<PilotDashboard />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </GlobalLayout>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <NotificationProvider>
          <AuthProvider>
            <Router>
              <NavigationProvider>
                <AudioProvider>
                  <AppContent />
                </AudioProvider>
              </NavigationProvider>
            </Router>
          </AuthProvider>
        </NotificationProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;