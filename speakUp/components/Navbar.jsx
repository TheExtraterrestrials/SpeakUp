import React, { useState } from 'react';
import '../styles/nav.css';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className='nav-main'>
      <div className='nav-logo'>
        <h1>speakUp</h1>
      </div>

      {/* Toggle button for mobile */}
      <div className='mobile-menu-icon' onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? '✖' : '☰'}
      </div>

      {/* Navigation Links */}
      <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <ul>
          <li>Home</li>
          <li>About</li>
          <li>Features</li>
          <li>Contact</li>
          <li className='sign-in'>Sign In</li>
        </ul>
      </div>
    </div>
  );
}
