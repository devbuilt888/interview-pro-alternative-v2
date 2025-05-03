import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatTemplate from '../templates/ChatTemplate';
import SEO from '../atoms/SEO';
import OrbitalCharacterModels from '../molecules/OrbitalCharacterModels';
import { useChat } from '../../context/ChatContext';
import './ChatPage.css';

const ChatPage = () => {
  const navigate = useNavigate();
  const { startConversation, conversationStarted, hasPdfContent } = useChat();

  // Redirect to landing page if no PDF has been uploaded
  useEffect(() => {
    if (!hasPdfContent) {
      navigate('/');
    }
  }, [hasPdfContent, navigate]);

  useEffect(() => {
    // Start the conversation if it hasn't started yet
    if (!conversationStarted && hasPdfContent) {
      startConversation();
    }
  }, [startConversation, conversationStarted, hasPdfContent]);

  const handleBackClick = () => {
    navigate('/');
  };

  // Define the 3D models to display
  const characterModels = [
    { 
      src: '/models/ni.glb', 
      character: '你',
      customOrbit: {
        size: 500,  // Maintain a good orbit radius
        duration: 95, // Slightly slower for better visibility
        modelSize: 300 // Twice as large as the default size (150px)
      }
    },
    { src: '/models/hao.glb', character: '好' },
    { src: '/models/zhong.glb', character: '中' },
    { 
      src: '/models/wen.glb', 
      character: '文',
      customOrbit: {
        size: 550,  // Larger orbit radius
        duration: 75, // Slightly faster rotation
        modelSize: 180 // Slightly larger model
      }
    }
  ];

  // If no PDF is loaded, don't render the page (will redirect)
  if (!hasPdfContent) {
    return null;
  }

  return (
    <div className="chat-page">
      <SEO 
        title="Behavioral Interview Practice" 
        description="Practice answering behavioral interview questions with our AI interviewer." 
      />
      
      {/* Add the 3D models */}
      <OrbitalCharacterModels models={characterModels} />
      
      {/* Main Chat Component */}
      <div className="chat-container">
        <ChatTemplate 
          onBackClick={handleBackClick} 
          interviewerName="AI Interviewer"
        />
      </div>
    </div>
  );
};

export default ChatPage; 