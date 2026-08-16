import React from 'react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-copy">
          STREETCRAFT AI &mdash; Local Business Content Studio & SaaS Platform &copy; 2026.
        </div>
        <div className="footer-links">
          <button className="nav-item" onClick={() => navigate('home')}>
            Home
          </button>
          <button className="nav-item" onClick={() => navigate('free-tool')}>
            Free Tool
          </button>
          <button className="nav-item" onClick={() => navigate('pricing')}>
            Pricing
          </button>
          <button className="nav-item" onClick={() => navigate('app/dashboard')}>
            App Studio
          </button>
        </div>
      </div>
    </footer>
  );
};
