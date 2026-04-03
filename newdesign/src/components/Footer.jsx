import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const footerLinks = {
  forBusinesses: [
    'Booking Software',
    'Point of Sale',
    'Payments',
    'Marketing',
    'Team Management',
    'Pricing',
  ],
  resources: [
    'Help Center',
    'Blog',
    'Careers',
    'Contact Us',
    'Press',
    'Developers',
  ],
  legal: [
    'Privacy Policy',
    'Terms of Service',
    'Cookie Policy',
    'Accessibility',
  ],
};

export default function Footer() {
  return (
    <footer className="bg-foreground text-background py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <span className="text-2xl font-display font-semibold text-background">
                serene
              </span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed max-w-xs">
              The world's #1 booking platform for the beauty and wellness industry.
            </p>
          </div>

          {/* For Businesses */}
          <div>
            <h4 className="text-sm font-semibold text-background mb-6 uppercase tracking-wider">
              For Businesses
            </h4>
            <ul className="space-y-3">
              {footerLinks.forBusinesses.map((link) => (
                <li key={link}>
                  <Link
                    to="/"
                    className="text-sm text-background/70 hover:text-background transition-colors duration-200"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-background mb-6 uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link}>
                  <Link
                    to="/"
                    className="text-sm text-background/70 hover:text-background transition-colors duration-200"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-background mb-6 uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link}>
                  <Link
                    to="/"
                    className="text-sm text-background/70 hover:text-background transition-colors duration-200"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50">
            © 2024 Serene. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button className="text-sm text-background/70 hover:text-background transition-colors">
              English
            </button>
            <button className="text-sm text-background/70 hover:text-background transition-colors">
              USD ($)
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}