import React from 'react'
import Navbar from '../components/Navbar'
import '../styles/landing.css'
import Bg from '../src/assets/bg.mp4'

export default function Landing() {
  return (
    <div className='page-wrapper'>
    <video autoPlay loop muted className='video'>
        <source src={Bg} type='video/mp4' />
        </video>
    <div className='nav-wrapper'> <Navbar /> </div>
    <div className='landing-main'>
    <div className='content-divs'>
        <h1 className='heading'>A platform to enhance Your<br /> speech</h1>
        <p className='para'>SpeakUp is a the world. You can create posts, comment on other posts, and upvote or downvote posts. SpeakUp is a place where you can express yourself freely and connect with others who share your interests.</p>
        <button className='btn'>Get Started</button>
    </div>
    </div>
    
    </div>
  )
}
