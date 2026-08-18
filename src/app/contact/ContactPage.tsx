import React from 'react';
import { ContactHero } from './components/ContactHero';
import { ContactChannels } from './components/ContactChannels';
import { ContactForm } from './components/ContactForm';
import { ContactExpectations } from './components/ContactExpectations';
import { ContactFooter } from './components/ContactFooter';

export function ContactPage() {
  return (
    <div className="contact-page-wrapper">
      <div className="contact-page-container">
        <ContactHero />

        <div className="contact-grid">
          <div>
            <ContactForm />
          </div>

          <div>
            <ContactChannels />
            <ContactExpectations />
          </div>
        </div>

        <ContactFooter />
      </div>
    </div>
  );
}
