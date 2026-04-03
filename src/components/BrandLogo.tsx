import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  variant?: 'primary' | 'secondary';
  link?: string;
  className?: string;
  containerClassName?: string;
  children?: React.ReactNode;
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  variant: _variant = 'primary',
  link = "/",
  className = "h-10 w-auto",
  containerClassName = "",
  children
}) => {
  const renderContent = () => {
    return (
      <div className="flex items-center gap-3">
        <img
          src="/brand-assets/logo/MY_LOGOS_1.jpg"
          alt="DCCS Platform - Digital Creative Copyright System"
          className={className}
          onError={(e) => {
            // Fallback to text logo if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const textLogo = document.createElement('span');
            textLogo.className = 'text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent';
            textLogo.textContent = 'DCCS';
            target.parentElement?.appendChild(textLogo);
          }}
          loading="eager"
        />
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          DCCS
        </span>
      </div>
    );
  };

  const content = children || renderContent();

  return (
    <Link 
      to={link} 
      className="inline-block transition-all hover:scale-[1.02] duration-500 ease-out"
    >
      {containerClassName ? (
        <div className={containerClassName}>
          {content}
        </div>
      ) : (
        content
      )}
    </Link>
  );
};

export default BrandLogo;