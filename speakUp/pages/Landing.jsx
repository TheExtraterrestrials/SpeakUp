import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/landing.css';

export default function Landing() {
  return (
    <div className='page-wrapper'>
      <div className='nav-wrapper'>
        <Navbar />
      </div>

      <div className='landing-main'>
        <div className='content-div'>
          <h1 className='heading'>
            AI-Powered Speech Therapy <br /> Tailored for You
          </h1>
          <p className='para'>
            SpeakUp is your personal AI-driven speech coach, designed to help you improve your communication skills through personalized exercises, real-time feedback, and community support.
          </p>
          <button className='btn'>Start Now</button>
        </div>

        <div className='image-div'>
          <img 
            src='/assets/speech-therapy-mobile.png' 
            alt='Speech Therapy AI App' 
            className='landing-image' 
          />
        </div>

        <div className='features-div'>
          <h2 className='features-heading'>Why Choose SpeakUp?</h2>
          <ul className='features-list'>
            <li>Personalized AI Speech Coach</li>
            <li>Real-Time Chat and Feedback</li>
            <li>Progress Tracking and Reports</li>
            <li>Community Support</li>
          </ul>
        </div>

        <div className='cta-section'>
          <p className='cta-text'>Ready to improve your speech?</p>
          <button className='cta-btn'>Join Now</button>
        </div>
      </div>
    </div>
  );
}
