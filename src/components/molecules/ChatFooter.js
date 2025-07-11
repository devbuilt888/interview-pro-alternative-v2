import React, { useState, useEffect, useRef } from 'react';
import TextInput from '../atoms/TextInput';
import Button from '../atoms/Button';
import { useChat } from '../../context/ChatContext';
import useVoiceRecorder from '../../hooks/useVoiceRecorder';
import './ChatFooter.css';

// Utility to detect iOS/Safari
function isIOSSafari() {
  const ua = window.navigator.userAgent;
  const isIOS = /iP(ad|hone|od)/.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  return isIOS || (isSafari && !window.MediaRecorder);
}

// Web Speech API hook for live transcription
function useLiveSpeechRecognition(enabled) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(final + interim);
    };
    recognition.onend = () => {
      setIsRecording(false);
    };
    recognition.onerror = () => {
      setIsRecording(false);
    };
    return () => {
      recognition.stop();
    };
  }, [enabled]);

  const start = () => {
    if (recognitionRef.current && !isRecording) {
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };
  const stop = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };
  const clear = () => setTranscript('');

  return { isRecording, transcript, setTranscript, start, stop, clear };
}

const ChatFooter = ({ interviewComplete }) => {
  const [message, setMessage] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const recordingTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    sendMessage,
    isLoading,
    isSpeaking,
    selectedVoice,
    hasPdfContent,
    speakMessage
  } = useChat();

  const {
    isRecording: isMp3Recording,
    transcript: mp3Transcript,
    error: voiceError,
    startRecording,
    stopRecording,
    setTranscript: setMp3Transcript
  } = useVoiceRecorder();

  const [isIOS, setIsIOS] = useState(false);
  const [usingLive, setUsingLive] = useState(false);

  // Live speech recognition (Web Speech API)
  const liveSpeech = useLiveSpeechRecognition(!isIOS);

  useEffect(() => {
    setIsIOS(isIOSSafari());
  }, []);

  // When using live speech, update message as user speaks
  useEffect(() => {
    if (!isIOS && usingLive && liveSpeech.transcript !== undefined) {
      setMessage(liveSpeech.transcript);
    }
  }, [liveSpeech.transcript, isIOS, usingLive]);

  // When using mp3/whisper, set message after transcription
  useEffect(() => {
    if (isIOS && mp3Transcript && !isLoading && !interviewComplete && hasPdfContent) {
      setMessage(mp3Transcript);
      setMp3Transcript && setMp3Transcript('');
    }
  }, [mp3Transcript, isIOS, isLoading, interviewComplete, hasPdfContent, setMp3Transcript]);

  // Handle recording timer for mp3-recorder
  useEffect(() => {
    if (isMp3Recording || liveSpeech.isRecording) {
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      // Clear the timer when recording stops
      clearInterval(recordingTimerRef.current);
      setRecordingTime(0);
    }
    return () => clearInterval(recordingTimerRef.current);
  }, [isMp3Recording, liveSpeech.isRecording]);

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
      liveSpeech.clear && liveSpeech.clear();
    }
  };

  // Voice button handler
  const handleVoiceButton = () => {
    if (interviewComplete || !hasPdfContent) return;
    if (isIOS) {
      // Open file input for iOS/Safari
      fileInputRef.current && fileInputRef.current.click();
    } else {
      if (liveSpeech.isRecording) {
        liveSpeech.stop();
        setUsingLive(false);
      } else {
        setUsingLive(true);
        liveSpeech.start();
      }
    }
  };

  // Handle file input change for iOS/Safari
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Send file to Whisper API (php/stt.php)
    const formData = new FormData();
    formData.append('audio', file);
    try {
      const response = await fetch('/php/stt.php', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.text) {
        setMessage(result.text);
      }
    } catch (err) {
      // Optionally handle error
    }
    // Reset file input
    e.target.value = '';
  };

  // Prevent form submission while recording
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && (isMp3Recording || liveSpeech.isRecording)) {
      e.preventDefault();
      if (!isIOS && liveSpeech.isRecording) liveSpeech.stop();
    }
  };

  // Test audio function
  const testAudio = () => {
    try {
      const testMessage = "This is a test of the text-to-speech functionality. If you can hear this, audio is working correctly.";
      console.log("Testing audio with voice:", selectedVoice?.name || "default");
      speakMessage(testMessage);
    } catch (err) {
      // Optionally handle error
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
  const inputDisabled = isMp3Recording || liveSpeech.isRecording || isSpeaking || interviewComplete || !hasPdfContent;
  const buttonDisabled = !hasPdfContent || isSpeaking || interviewComplete;
  const placeholder = (isMp3Recording || liveSpeech.isRecording)
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
          className={`chat-footer-button ${(isMp3Recording || liveSpeech.isRecording) ? 'recording' : ''}`}
          onClick={handleVoiceButton}
          disabled={buttonDisabled} 
          aria-label={(isMp3Recording || liveSpeech.isRecording) ? "Stop recording" : "Start recording"}
          title={!hasPdfContent ? "Upload a PDF to enable recording" : (isMp3Recording || liveSpeech.isRecording) ? "Stop recording" : "Start recording"}
        >
          <span className="footer-icon">{(isMp3Recording || liveSpeech.isRecording) ? '⏹️' : '🎤'}</span>
        </Button>
        {/* iOS/Safari fallback file input */}
        {isIOS && (
          <input
            type="file"
            accept="audio/*"
            capture
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        )}
        <TextInput
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="chat-footer-input"
          disabled={inputDisabled}
          onKeyDown={onKeyDown}
        />
        {message && (
          <Button
            type="button"
            variant="outline"
            size="small"
            className="chat-footer-debug"
            onClick={() => setMessage('')}
            title="Clear input"
          >
            <span className="footer-icon">✖️</span>
          </Button>
        )}
        <Button 
          type="submit" 
          variant="primary" 
          size="small"
          className="chat-footer-send"
          disabled={!message.trim() || isLoading || buttonDisabled || isMp3Recording || liveSpeech.isRecording}
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