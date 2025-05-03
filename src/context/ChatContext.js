import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { userAvatar, teacherAvatar } from '../assets/teacherAvatar';
import { initOpenAI, sendMessageToGPT, createInterviewerSystemMessage } from '../services/openaiService';
import { speak, getVoices, initSpeechRecognition, startRecording, stopRecording } from '../services/speechService';
import { getOpenAIApiKey } from '../services/envService';
import useLocalStorage from '../hooks/useLocalStorage';

// Create context
const ChatContext = createContext();

// Custom hook to use chat context
export const useChat = () => useContext(ChatContext);

// Provider component
export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [apiKey, setApiKey] = useLocalStorage('openai_api_key', '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [pdfText, setPdfText] = useState('');
  const [hasPdfContent, setHasPdfContent] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [interviewScore, setInterviewScore] = useState(null);
  
  const recognitionRef = useRef(null);
  const conversationHistoryRef = useRef([]);
  const envApiKey = getOpenAIApiKey();

  // Initialize voices
  useEffect(() => {
    const loadVoices = async () => {
      const availableVoices = await getVoices();
      setVoices(availableVoices);
      
      // Use a neutral voice
      const englishVoice = availableVoices.find(voice => voice.lang.includes('en'));
      if (englishVoice) {
        setSelectedVoice(englishVoice);
      } else {
        setSelectedVoice(availableVoices[0]);
      }
    };
    
    loadVoices();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    recognitionRef.current = initSpeechRecognition();
  }, []);

  // Speak a message using the selected voice
  const speakMessage = useCallback(async (text) => {
    if (!text) return;
    
    setIsSpeaking(true);
    try {
      await speak(text, 1, 1, selectedVoice);
    } catch (error) {
      // Silently handle errors
    } finally {
      setIsSpeaking(false);
    }
  }, [selectedVoice]);

  // Update PDF text
  const setPdfContent = useCallback((text) => {
    setPdfText(text);
    setHasPdfContent(!!text);
  }, []);

  // Create system message based on current state
  const createSystemMessage = useCallback(() => {
    const baseSystemMessage = createInterviewerSystemMessage();
    
    if (hasPdfContent && pdfText) {
      return {
        role: "system",
        content: `${baseSystemMessage.content}\n\nInformation about the candidate or position:\n\n${pdfText.substring(0, 10000)}\n\nUse this information to tailor your interview questions to the candidate's background and the position requirements. Ask specific questions that relate to their experience and skills as described in this document.`
      };
    }
    
    return baseSystemMessage;
  }, [hasPdfContent, pdfText]);

  // Start a new interview conversation
  const startConversation = useCallback(async () => {
    if (!isInitialized) {
      setError('OpenAI API is not initialized. Please check your API key in .env.local file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setInterviewComplete(false);
    setInterviewScore(null);

    try {
      // Initialize conversation history with system message
      conversationHistoryRef.current = [createSystemMessage()];
      
      // Get initial response from GPT
      const response = await sendMessageToGPT(conversationHistoryRef.current);
      
      // Add interviewer's initial message to the conversation
      const initialMessage = {
        id: 1,
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: false,
        status: 'read'
      };
      
      setMessages([initialMessage]);
      
      // Add the assistant's response to the conversation history
      conversationHistoryRef.current.push({
        role: "assistant",
        content: response
      });
      
      // Mark conversation as started
      setConversationStarted(true);
      
      // Speak the response
      speakMessage(response);
    } catch (error) {
      setError('Failed to start interview. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, speakMessage, createSystemMessage]);

  // Initialize OpenAI with API key from environment variables or stored key
  useEffect(() => {
    const initAPI = async () => {
      // Try to use environment API key first
      const keyToUse = envApiKey || apiKey;
      
      if (keyToUse) {
        try {
          initOpenAI(keyToUse);
          setIsInitialized(true);
          setError(null);
          
          // No longer auto-starting conversation here
        } catch (error) {
          setError('Failed to initialize OpenAI API. Please check your API key in .env.local file.');
          setIsInitialized(false);
        }
      } else {
        setIsInitialized(false);
        setError('OpenAI API key is missing. Please add REACT_APP_OPENAI_API_KEY to your .env.local file.');
      }
    };
    
    initAPI();
  }, [apiKey, envApiKey]);

  // Add a message to the UI
  const addMessage = (content, isUser) => {
    const newMessage = {
      id: messages.length + 1,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser,
      status: 'sent'
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  // Update message status
  const updateMessageStatus = (id, status) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, status } : msg
      )
    );
  };

  // Start recording user's voice
  const startVoiceRecording = () => {
    if (isRecording || !recognitionRef.current || interviewComplete) return;
    
    // Set recording state before starting the recording
    setIsRecording(true);
    
    startRecording(
      recognitionRef.current,
      (fullTranscript, confidence) => {
        // Process the full transcript when manually stopped
        if (fullTranscript && fullTranscript.trim()) {
          // Check if the message isn't empty or just repetitive content
          const processedText = fullTranscript.trim();
          if (processedText.length > 0) {
            sendMessage(processedText);
          }
        }
      },
      (error) => {
        // Handle recording error
        setIsRecording(false);
        if (error !== 'no-speech') { // Don't show error for no speech detected
          setError(`Recording error: ${error}`);
        }
      }
    );
  };

  // Stop recording user's voice
  const stopVoiceRecording = () => {
    if (!recognitionRef.current) return;
    
    // Prevent double stopping
    if (!isRecording) return;
    
    stopRecording(recognitionRef.current);
    setIsRecording(false);
  };

  // Check if response indicates interview is complete
  const checkForInterviewCompletion = (response) => {
    if (response.includes("INTERVIEW COMPLETE")) {
      setInterviewComplete(true);
      
      // Extract score
      const scoreMatch = response.match(/Your interview score: ([A-F][+]?)/);
      if (scoreMatch && scoreMatch[1]) {
        setInterviewScore(scoreMatch[1]);
      }
      
      return true;
    }
    return false;
  };

  // Process response from OpenAI
  const processOpenAIResponse = async (userMessageId) => {
    try {
      // Get response from OpenAI
      const response = await sendMessageToGPT(conversationHistoryRef.current);

      // Add the response to the conversation history
      conversationHistoryRef.current.push({
        role: "assistant",
        content: response
      });

      // Check if interview is complete
      checkForInterviewCompletion(response);

      // Add the response to messages
      const responseMessage = addMessage(response, false);
      
      // Mark user message as read
      updateMessageStatus(userMessageId, 'read');
      
      // Speak the response
      speakMessage(response);
    } catch (error) {
      // Handle error by updating original message to show error
      updateMessageStatus(userMessageId, 'error');
      setError('Failed to get response. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message to the conversation
  const sendMessage = async (content) => {
    if (!isInitialized) {
      setError('OpenAI API is not initialized. Please check your API key in .env.local file.');
      return;
    }

    // Start conversation if not started yet
    if (!conversationStarted) {
      await startConversation();
      return;
    }

    // Don't send empty messages or if interview is already complete
    if (!content || content.trim().length === 0 || interviewComplete) return;

    setIsLoading(true);
    setError(null);

    // Add user message to UI
    const userMessage = addMessage(content, true);

    // Add the message to the conversation history
    conversationHistoryRef.current.push({
      role: "user",
      content
    });

    // Get response from OpenAI
    processOpenAIResponse(userMessage.id);
  };

  // Set a new OpenAI API key
  const setOpenAIKey = (key) => {
    setApiKey(key);
  };

  // Change the selected voice
  const changeVoice = (voice) => {
    setSelectedVoice(voice);
  };

  // Reset the conversation
  const resetConversation = () => {
    setMessages([]);
    conversationHistoryRef.current = [];
    setConversationStarted(false);
    setInterviewComplete(false);
    setInterviewScore(null);
    // Keep PDF content
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isInitialized,
        isLoading,
        error,
        apiKey,
        voices,
        selectedVoice,
        isRecording,
        isSpeaking,
        hasPdfContent,
        pdfText,
        userAvatar,
        teacherAvatar,
        hasApiKey: !!envApiKey || !!apiKey,
        interviewComplete,
        interviewScore,
        setOpenAIKey,
        sendMessage,
        speakMessage,
        startVoiceRecording,
        stopVoiceRecording,
        changeVoice,
        resetConversation,
        startConversation,
        conversationStarted,
        setPdfContent
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext; 