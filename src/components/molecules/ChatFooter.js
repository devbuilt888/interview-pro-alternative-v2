import React, { useState, useEffect, useRef } from 'react';
import TextInput from '../atoms/TextInput';
import Button from '../atoms/Button';
import { useChat } from '../../context/ChatContext';
import './ChatFooter.css';

const ChatFooter = ({ interviewComplete }) => {
  const [message, setMessage] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const recordingTimerRef = useRef(null);
  
  const { 
    sendMessage, 
    isLoading, 
    isRecording, 
    isSpeaking,
    startVoiceRecording, 
    stopVoiceRecording,
    speakMessage,
    selectedVoice,
    hasPdfContent
  } = useChat();

  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      // Start a timer to track recording duration
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      // Clear the timer when recording stops
      clearInterval(recordingTimerRef.current);
      setRecordingTime(0);
    }
    
    // Cleanup on unmount
    return () => {
      clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  // Format recording time as minutes:seconds
  const formatRecordingTime = () => {
    const minutes = Math.floor(recordingTime / 60);
    const seconds = recordingTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !isSpeaking && !interviewComplete && hasPdfContent) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleVoiceButton = () => {
    if (interviewComplete || !hasPdfContent) return;
    
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  // Prevent form submission while recording
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && isRecording) {
      e.preventDefault();
      stopVoiceRecording();
    }
  };

  // Test audio function
  const testAudio = () => {
    try {
      const testMessage = "This is a test of the text-to-speech functionality. If you can hear this, audio is working correctly.";
      console.log("Testing audio with voice:", selectedVoice?.name || "default");
      speakMessage(testMessage);
    } catch (err) {
      console.error("Audio test error:", err);
    }
  };

  // Toggle debug info
  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  // If interview is complete, only show the debug button
  if (interviewComplete) {
    return (
      <>
        <form className="chat-footer chat-footer-complete">
          <Button 
            type="button"
            variant="outline" 
            size="small" 
            className="chat-footer-debug"
            onClick={toggleDebug}
            title="Toggle debug info"
          >
            <span className="footer-icon">🛠️</span>
          </Button>
        </form>

        {showDebug && (
          <div className="chat-debug-panel">
            <div className="debug-info">
              <p><strong>Interview Status:</strong> Complete</p>
              <p><strong>Audio State:</strong> {isSpeaking ? 'Speaking' : 'Silent'}</p>
              <p><strong>Selected Voice:</strong> {selectedVoice ? `${selectedVoice.name} (${selectedVoice.lang})` : 'None'}</p>
              <p><strong>Available Voices:</strong> {window.speechSynthesis ? window.speechSynthesis.getVoices().length : 'Not supported'}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={testAudio}
              disabled={isSpeaking}
            >
              Test Audio
            </Button>
          </div>
        )}
      </>
    );
  }

  // Check if we have a PDF uploaded
  const inputDisabled = isRecording || isSpeaking || interviewComplete || !hasPdfContent;
  const buttonDisabled = !hasPdfContent || isSpeaking || interviewComplete;
  const placeholder = isRecording 
    ? `Recording${recordingTime > 0 ? ` ${formatRecordingTime()}` : ''}... (click mic to stop)` 
    : interviewComplete 
      ? "Interview completed" 
      : !hasPdfContent 
        ? "Upload a PDF to start the interview" 
        : "Type a message...";

  return (
    <>
      <form className="chat-footer" onSubmit={handleSubmit}>
        <Button 
          type="button"
          variant="outline" 
          size="small" 
          className={`chat-footer-button ${isRecording ? 'recording' : ''}`}
          onClick={handleVoiceButton}
          disabled={buttonDisabled} 
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          title={!hasPdfContent ? "Upload a PDF to enable recording" : isRecording ? "Stop recording" : "Start recording"}
        >
          <span className="footer-icon">{isRecording ? '⏹️' : '🎤'}</span>
        </Button>
        <TextInput
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="chat-footer-input"
          disabled={inputDisabled}
          onKeyDown={onKeyDown}
        />
        <Button 
          type="submit" 
          variant="primary" 
          size="small"
          className="chat-footer-send"
          disabled={!message.trim() || isLoading || buttonDisabled || isRecording}
          title={!hasPdfContent ? "Upload a PDF to enable sending messages" : "Send message"}
        >
          <span className="footer-icon">➤</span>
        </Button>
        <Button 
          type="button"
          variant="outline" 
          size="small" 
          className="chat-footer-debug"
          onClick={toggleDebug}
          title="Toggle debug info"
        >
          <span className="footer-icon">🛠️</span>
        </Button>
      </form>

      {showDebug && (
        <div className="chat-debug-panel">
          <div className="debug-info">
            <p><strong>PDF Content:</strong> {hasPdfContent ? 'Loaded' : 'Not loaded'}</p>
            <p><strong>Audio State:</strong> {isSpeaking ? 'Speaking' : 'Silent'}</p>
            <p><strong>Selected Voice:</strong> {selectedVoice ? `${selectedVoice.name} (${selectedVoice.lang})` : 'None'}</p>
            <p><strong>Available Voices:</strong> {window.speechSynthesis ? window.speechSynthesis.getVoices().length : 'Not supported'}</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={testAudio}
            disabled={isSpeaking}
          >
            Test Audio
          </Button>
        </div>
      )}
    </>
  );
};

export default ChatFooter; 