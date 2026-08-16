import React from 'react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="editorial-footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <div className="footer-brand-title">STREETCRAFT</div>
          <p className="footer-tagline">
            The local-business marketing instrument. Turn one store event or quiet weekday into synchronized campaign proofs across Google, Instagram, WhatsApp, and your counter.
          </p>
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} StreetCraft. Built for independent neighborhood stores.
          </div>
        </div>

        <div className="footer-nav-columns">
          <div className="footer-col">
            <span className="footer-col-heading">Product</span>
            <button onClick={() => navigate('home')}>How it works</button>
            <button onClick={() => navigate('free-tool')}>Free campaign tool</button>
            <button onClick={() => navigate('pricing')}>Plans & pricing</button>
          </div>

          <div className="footer-col">
            <span className="footer-col-heading">Workspace</span>
            <button onClick={() => navigate('app/dashboard')}>Daily workspace</button>
            <button onClick={() => navigate('app/create')}>Campaign creator</button>
            <button onClick={() => navigate('app/campaigns')}>Campaign vault</button>
            <button onClick={() => navigate('app/business')}>Store memory</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
