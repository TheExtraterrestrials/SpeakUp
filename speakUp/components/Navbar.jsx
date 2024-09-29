import React from 'react'
import '../styles/nav.css'

export default function () {
  return (
    <div className='nav-main'>
        <div className='nav-logo'>
            <h1>speakUp</h1>
        </div>
        <div className='nav-links'>
            <ul>
            <li>Home</li>
            <li>About</li>
            <li>Services</li>
            <li>Contact</li>
            </ul>
        </div>
    </div>
  )
}
