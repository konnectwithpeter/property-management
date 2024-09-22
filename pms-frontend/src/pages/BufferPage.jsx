// src/pages/BufferPage.js

import React from 'react';
import { Link } from 'react-router-dom';

const BufferPage = () => {
  // Define inline styles
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f0f0f0', // Optional: Set a background color
    position: 'relative',
  };

  const loaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  };

  const spinnerStyle = {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '50%',
    borderTop: '4px solid #3498db', // Customize color
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
  };

  const homeIconStyle = {
    marginTop: '20px',
    fontSize: '24px',
    color: '#3498db', // Customize color
    textDecoration: 'none',
  };

  // Keyframes for spin animation
  const keyframesStyle = `
    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `;

  // Inject keyframes into a <style> tag
  const styleTag = document.createElement('style');
  styleTag.innerHTML = keyframesStyle;
  document.head.appendChild(styleTag);

  return (
    <div style={containerStyle}>
      <div style={loaderStyle}>
        <div style={spinnerStyle}></div>
      </div>
      <Link to="/" style={homeIconStyle}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="icon icon-tabler icon-tabler-home"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M3 12l9-9l9 9v9a2 2 0 0 1 -2 2h-4v-6h-4v6h-4a2 2 0 0 1 -2 -2z" />
        </svg>
      </Link>
    </div>
  );
};

export default BufferPage;
