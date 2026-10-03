import React, { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  containerClassName = '',
  icon,
  ...props 
}, ref) => {
  return (
    <div className={`ui-input-container ${containerClassName}`}>
      {label && <label className="ui-label">{label}</label>}
      <div className="ui-input-wrapper">
        {icon && <span className="ui-input-icon">{icon}</span>}
        <input 
          ref={ref}
          className={`ui-input ${error ? 'error' : ''} ${icon ? 'with-icon' : ''} ${className}`} 
          {...props} 
        />
      </div>
      {error && <span className="ui-error-text">{error}</span>}
    </div>
  );
});

export default Input;
