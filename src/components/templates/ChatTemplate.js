import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ChatHeader from '../molecules/ChatHeader';
import MessageList from '../organisms/MessageList';
import ChatFooter from '../molecules/ChatFooter';
import ApiKeyForm from '../molecules/ApiKeyForm';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import { useChat } from '../../context/ChatContext';
import './ChatTemplate.css';

const ChatTemplate = ({ onBackClick, interviewerName = "AI Interviewer" }) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [showPdfNotification, setShowPdfNotification] = useState(true);
  
  const { 
    messages, 
    userAvatar, 
    teacherAvatar, 
    isInitialized, 
    isLoading, 
    error, 
    isSpeaking,
    hasApiKey,
    hasPdfContent,
    interviewComplete,
    interviewScore,
    resetConversation,
    startConversation
  } = useChat();

  const handleRestartInterview = () => {
    resetConversation();
    // Wait a moment before restarting
    setTimeout(() => {
      startConversation();
    }, 500);
  };
  
  const handleCloseInstructions = () => {
    setShowInstructions(false);
  };
  
  const handleClosePdfNotification = () => {
    setShowPdfNotification(false);
  };

  return (
    <div className="chat-template">
      <ChatHeader 
        name={interviewerName} 
        status="online"
        avatarSrc={teacherAvatar}
        onBackClick={onBackClick}
      />
      
      <div className="chat-content">
        {!isInitialized && (
          <div className="chat-api-key-container glass-card">
            {!hasApiKey ? (
              <div className="env-instructions">
                <Typography variant="subtitle1" color="primary" className="heading-md text-gradient">
                  Missing OpenAI API Key
                </Typography>
                <Typography variant="body2" color="dark">
                  To use this application, you need to add your OpenAI API key to the environment.
                </Typography>
                <div className="code-block">
                  <code>
                    # Create a .env.local file in the project root and add:<br />
                    REACT_APP_OPENAI_API_KEY=your_openai_api_key
                  </code>
                </div>
                <Typography variant="body2" color="dark">
                  After adding the API key, restart the application.
                </Typography>
              </div>
            ) : (
              <ApiKeyForm />
            )}
          </div>
        )}
        
        <div className="chat-content-spacer"></div>
        
        {!hasPdfContent && (
          <div className="chat-pdf-required glass-card">
            <Typography variant="subtitle1" color="primary" className="heading-md text-gradient">
              Resume or Job Description Required
            </Typography>
            <Typography variant="body2" color="dark">
              To start the interview, you need to upload a resume or job description.
            </Typography>
            <Button 
              variant="primary"
              size="medium"
              onClick={onBackClick}
              className="upload-pdf-button"
            >
              Go to Upload Page
            </Button>
          </div>
        )}
        
        {error && (
          <div className="chat-error">
            <Typography variant="body2" color="primary">
              {error}
            </Typography>
          </div>
        )}
        
        {isLoading && (
          <div className="chat-loading">
            <Typography variant="body2" color="secondary">
              <span className="loading-dots">Loading</span>
            </Typography>
          </div>
        )}
        
        {isSpeaking && (
          <div className="chat-speaking-indicator">
            <Typography variant="caption" color="secondary">
              <span className="speaking-wave">Speaking</span>
            </Typography>
          </div>
        )}
        
        {interviewComplete && interviewScore && (
          <div className="interview-complete-container">
            <div className="interview-score-card">
              <Typography variant="h2" className="interview-score">
                {interviewScore}
              </Typography>
              <Typography variant="subtitle1" className="score-label">
                Interview Score
              </Typography>
              <Button 
                variant="primary" 
                size="medium"
                className="restart-button"
                onClick={handleRestartInterview}
              >
                Start New Interview
              </Button>
            </div>
          </div>
        )}
        
        {hasPdfContent && !interviewComplete && showPdfNotification && (
          <div className="chat-pdf-notification">
            <button className="close-button" onClick={handleClosePdfNotification}>×</button>
            <Typography variant="body2" color="success">
              <span className="pdf-indicator">Resume/Job Description Loaded</span>
              <span className="pdf-help">Answer the interview questions to practice your skills</span>
            </Typography>
          </div>
        )}
        
        {!interviewComplete && hasPdfContent && showInstructions && (
          <div className="chat-instructions">
            <button className="close-button" onClick={handleCloseInstructions}>×</button>
            <Typography variant="body2" color="dark">
              This is a behavioral interview practice session. You'll be asked questions about your past experiences
              and how you handled various situations. Try to use the STAR method in your responses:
              <ul>
                <li><strong>Situation:</strong> Describe the context</li>
                <li><strong>Task:</strong> Explain your responsibility</li>
                <li><strong>Action:</strong> Detail what you did</li>
                <li><strong>Result:</strong> Share the outcome</li>
              </ul>
            </Typography>
          </div>
        )}
        
        <MessageList 
          messages={messages}
          userAvatar={userAvatar}
          teacherAvatar={teacherAvatar}
        />
      </div>
      
      <ChatFooter interviewComplete={interviewComplete} />
      
      {interviewComplete && (
        <div className="interview-complete-footer">
          <Button 
            variant="primary" 
            size="large"
            onClick={handleRestartInterview}
            className="restart-interview-button"
          >
            Start New Interview
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatTemplate; 