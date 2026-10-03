import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false, 
  icon,
  ...props 
}) => {
  return (
    <button 
      className={`ui-btn ui-btn-${variant} ui-btn-${size} ${className} ${loading ? 'loading' : ''}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className="spinner" viewBox="0 0 24 24">
          <circle className="path" cx="12" cy="12" r="10" fill="none" strokeWidth="3"></circle>
        </svg>
      ) : icon ? (
        <span className="ui-btn-icon">{icon}</span>
      ) : null}
      <span className="ui-btn-text">{children}</span>
    </button>
  );
};

export default Button;
