import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingTemplate from '../templates/LandingTemplate';
import SEO from '../atoms/SEO';
import { useChat } from '../../context/ChatContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { setPdfContent } = useChat();

  const handleStartClick = () => {
    navigate('/chat');
  };

  const handlePdfTextExtracted = (text) => {
    setPdfContent(text);
  };

  return (
    <>
      <SEO 
        title="Welcome" 
        description="Learn French with our experienced native teachers. Start your journey today!" 
      />
      <LandingTemplate 
        onStartClick={handleStartClick} 
        onPdfTextExtracted={handlePdfTextExtracted}
      />
    </>
  );
};

export default LandingPage; 