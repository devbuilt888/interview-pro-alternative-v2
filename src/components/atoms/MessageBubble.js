import React, { useState } from 'react';
import './MessageBubble.css';

// Simplified function that doesn't look for translations
const processMessage = (text) => {
  if (!text) return { processed: '' };
  return { processed: text };
};

const MessageBubble = ({ 
  children, 
  isUser = false, 
  timestamp,
  status = 'sent', 
  className = '' 
}) => {
  const { processed } = processMessage(children);

  return (
    <div 
      className={`message-bubble ${isUser ? 'message-user' : 'message-other'} ${className}`}
    >
      <div className="message-content">
        {processed || children}
      </div>
      <div className="message-footer">
        <span className="message-time">{timestamp}</span>
        {isUser && (
          <span className={`message-status message-status-${status}`}>
            {status === 'sent' && '✓'}
            {status === 'delivered' && '✓✓'}
            {status === 'read' && '✓✓'}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble; 