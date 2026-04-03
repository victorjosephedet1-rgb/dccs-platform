import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface NavigationState {
  currentSector: string;
  breadcrumbs: BreadcrumbItem[];
  previousPath: string | null;
  navigationHistory: string[];
}

interface NavigationContextType extends NavigationState {
  setSector: (sector: string) => void;
  updateBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  goBack: () => void;
  navigateToSector: (sector: string, path: string) => void;
  clearHistory: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const STORAGE_KEY = 'v3b_navigation_state';

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentSector, setCurrentSector] = useState<string>('home');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.currentSector) setCurrentSector(parsed.currentSector);
        if (parsed.navigationHistory) setNavigationHistory(parsed.navigationHistory);
      } catch (error) {
        console.error('Failed to parse navigation state:', error);
      }
    }
  }, []);

  useEffect(() => {
    const state = {
      currentSector,
      navigationHistory: navigationHistory.slice(-20),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [currentSector, navigationHistory]);

  useEffect(() => {
    setPreviousPath(location.pathname);
    setNavigationHistory(prev => [...prev, location.pathname]);

    const sector = determineSector(location.pathname);
    setCurrentSector(sector);

    const breadcrumbs = generateBreadcrumbs(location.pathname);
    setBreadcrumbs(breadcrumbs);
  }, [location.pathname]);

  const setSector = useCallback((sector: string) => {
    setCurrentSector(sector);
  }, []);

  const updateBreadcrumbs = useCallback((newBreadcrumbs: BreadcrumbItem[]) => {
    setBreadcrumbs(newBreadcrumbs);
  }, []);

  const goBack = useCallback(() => {
    if (previousPath && previousPath !== location.pathname) {
      navigate(previousPath);
    } else {
      navigate(-1);
    }
  }, [previousPath, location.pathname, navigate]);

  const navigateToSector = useCallback((sector: string, path: string) => {
    setCurrentSector(sector);
    navigate(path);
  }, [navigate]);

  const clearHistory = useCallback(() => {
    setNavigationHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: NavigationContextType = {
    currentSector,
    breadcrumbs,
    previousPath,
    navigationHistory,
    setSector,
    updateBreadcrumbs,
    goBack,
    navigateToSector,
    clearHistory,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

function determineSector(pathname: string): string {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/music')) return 'music';
  if (pathname.startsWith('/video')) return 'video';
  if (pathname.startsWith('/podcast')) return 'podcast';
  if (pathname.startsWith('/booking')) return 'booking';
  if (pathname.startsWith('/marketplace')) return 'marketplace';
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/upload')) return 'upload';
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/artist')) return 'artist';
  if (pathname.startsWith('/safety')) return 'safety';
  if (pathname.startsWith('/demo')) return 'demo';
  return 'other';
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' }
  ];

  if (pathname === '/') {
    return breadcrumbs;
  }

  const pathParts = pathname.split('/').filter(Boolean);
  let currentPath = '';

  pathParts.forEach((part, index) => {
    currentPath += `/${part}`;

    const label = formatBreadcrumbLabel(part, index, pathParts);
    breadcrumbs.push({ label, path: currentPath });
  });

  return breadcrumbs;
}

function formatBreadcrumbLabel(part: string, index: number, allParts: string[]): string {
  const labelMap: Record<string, string> = {
    'marketplace': 'Marketplace',
    'music': 'Music',
    'video': 'Video',
    'podcast': 'Podcast',
    'booking': 'Event Booking',
    'dashboard': 'Dashboard',
    'upload': 'Upload',
    'admin': 'Admin',
    'artist': 'Artist Profile',
    'safety': 'Safety Center',
    'demo': 'Live Demo',
    'guidelines': 'Guidelines',
    'login': 'Login',
    'register': 'Sign Up',
    'catalog': 'Catalog',
    'verify': 'Verify',
    'license': 'License',
  };

  if (labelMap[part]) {
    return labelMap[part];
  }

  return part.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}
