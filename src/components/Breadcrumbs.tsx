import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';

export default function Breadcrumbs() {
  const { breadcrumbs } = useNavigation();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="bg-slate-900/50 border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isFirst = index === 0;

            return (
              <li key={crumb.path} className="flex items-center space-x-2">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                )}
                {isLast ? (
                  <span className="text-white font-medium flex items-center space-x-1">
                    {isFirst && <Home className="h-4 w-4" />}
                    <span>{crumb.label}</span>
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-slate-400 hover:text-white transition-colors flex items-center space-x-1"
                  >
                    {isFirst && <Home className="h-4 w-4" />}
                    <span>{crumb.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
