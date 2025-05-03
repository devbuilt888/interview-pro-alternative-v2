import React, { useState, useRef, useEffect } from 'react';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';
import { useChat } from '../../context/ChatContext';
import './VoiceSettings.css';

const VoiceSettings = ({ className = '' }) => {
  const { voices, selectedVoice, changeVoice, resetConversation } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState('bottom'); // 'bottom' or 'top'
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  // Check if panel would be cut off at the bottom of the viewport
  useEffect(() => {
    if (isOpen && panelRef.current && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const panelHeight = panelRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      // If panel would extend beyond viewport bottom, position it above the button
      if (buttonRect.bottom + panelHeight + 10 > viewportHeight) {
        setPanelPosition('top');
      } else {
        setPanelPosition('bottom');
      }
    }
  }, [isOpen]);

  const handleVoiceChange = (voice) => {
    changeVoice(voice);
    setIsOpen(false);
  };

  // Group voices by language
  const groupedVoices = voices.reduce((groups, voice) => {
    const lang = voice.lang.split('-')[0];
    if (!groups[lang]) {
      groups[lang] = [];
    }
    groups[lang].push(voice);
    return groups;
  }, {});

  return (
    <div className={`voice-settings ${className}`}>
      <Button 
        variant="outline" 
        size="small" 
        onClick={() => setIsOpen(!isOpen)}
        className="voice-settings-toggle"
        title="Voice Settings"
        ref={buttonRef}
      >
        <span className="settings-icon">⚙️</span>
      </Button>
      
      {isOpen && (
        <div 
          ref={panelRef}
          className={`voice-settings-panel ${panelPosition === 'top' ? 'panel-top' : 'panel-bottom'}`}
        >
          <Typography variant="subtitle2" color="dark" className="voice-settings-title">
            Select Voice
          </Typography>
          
          <div className="voice-list">
            {Object.entries(groupedVoices).map(([lang, langVoices]) => (
              <div key={lang} className="voice-group">
                <Typography variant="caption" color="dark" className="voice-group-label">
                  {getLangName(lang)}
                </Typography>
                
                {langVoices.map(voice => (
                  <Button
                    key={voice.name}
                    variant={selectedVoice?.name === voice.name ? 'primary' : 'outline'}
                    size="small"
                    className="voice-option"
                    onClick={() => handleVoiceChange(voice)}
                  >
                    {voice.name}
                  </Button>
                ))}
              </div>
            ))}
          </div>
          
          <div className="voice-settings-actions">
            <Button 
              variant="secondary" 
              size="small"
              onClick={resetConversation}
              className="reset-button"
            >
              Reset Conversation
            </Button>
            <Button 
              variant="outline" 
              size="small"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get language name from code
const getLangName = (code) => {
  const langNames = {
    'en': 'English',
    'fr': 'French',
    'es': 'Spanish',
    'de': 'German',
    'it': 'Italian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ru': 'Russian',
    'pt': 'Portuguese'
  };
  
  return langNames[code] || code.toUpperCase();
};

export default VoiceSettings; 