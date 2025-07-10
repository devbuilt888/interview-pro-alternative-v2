// Get language preference from environment variables or use default
const getPreferredLanguage = () => {
  return process.env.REACT_APP_DEFAULT_LANGUAGE || 'en-US';
};

// Clean text for speaking (no longer removing Pinyin since we're not using Chinese)
const cleanTextForSpeech = (text) => {
  if (!text) return '';
  
  try {
    // Just basic text cleanup - remove excessive whitespace and normalize 
    return text.trim();
  } catch (error) {
    // In case of any error, return original text without attempting to process it
    return text;
  }
};

// Speech synthesis (Text-to-Speech)
export const speak = (text, rate = 1, pitch = 1, voice = null) => {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      reject('Speech synthesis not supported');
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Clean text before speaking
      const cleanText = cleanTextForSpeech(text);
      console.log("Speaking text:", cleanText.substring(0, 50) + "...");
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Set voice if provided, otherwise it will use the default
      if (voice) {
        console.log("Using voice:", voice.name);
        utterance.voice = voice;
      } else {
        // Try to find a voice for the preferred language, otherwise use default
        const preferredLang = getPreferredLanguage();
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => voice.lang.includes(preferredLang.split('-')[0]));
        if (preferredVoice) {
          console.log("Using preferred voice:", preferredVoice.name);
          utterance.voice = preferredVoice;
        } else {
          console.log("No preferred voice found, using default");
        }
      }

      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.lang = voice ? voice.lang : getPreferredLanguage();
      
      utterance.onend = () => {
        console.log("Speech completed");
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error("Speech error:", event.error);
        reject(event.error);
      };
      
      // Fix for Chrome: Speech synthesis sometimes fails to start
      // Use a timeout to ensure it starts properly
      window.speechSynthesis.speak(utterance);
      
      // Fix for some browsers: keep synthesis alive
      const timer = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(timer);
          return;
        }
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }, 10000);
    } catch (error) {
      console.error("Speech error:", error);
      reject(error);
    }
  });
};

// Get available voices for speech synthesis
export const getVoices = () => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      // Wait for voices to be loaded
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    }
  });
};

// Initialize speech recognition (varies by browser)
export const initSpeechRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error("Speech recognition is not supported in this browser");
    return null;
  }
  
  const recognition = new SpeechRecognition();
  recognition.continuous = true; // Keep recording continuously
  recognition.interimResults = true; // Get interim results
  recognition.lang = getPreferredLanguage(); // Set to English
  recognition.maxAlternatives = 3; // Get multiple interpretations (increased from 1)
  
  console.log("Speech recognition initialized with language:", recognition.lang);
  
  // Initialize custom properties
  recognition.isListening = false;
  recognition.manualStop = false;
  recognition.fullTranscript = ''; // Track the complete transcript during recording
  recognition.processedSegments = new Set(); // Track processed segments to avoid duplication
  // Lower confidence threshold for accepting results
  recognition.confidenceThreshold = 0.1; // Accept even low confidence results
  
  // Add event handlers
  recognition.onend = () => {
    // This event fires when recognition stops for any reason
    // Restart if not manually stopped
    if (recognition.isListening && !recognition.manualStop) {
      try {
        recognition.start();
      } catch (e) {
        // Small delay before restarting
        setTimeout(() => {
          try {
            recognition.start();
          } catch (err) {
            // Silently fail
            console.error("Failed to restart speech recognition:", err);
          }
        }, 100);
      }
    }
  };
  
  return recognition;
};

// Start recording with speech recognition
export const startRecording = (recognition, onResult, onError) => {
  if (!recognition) {
    onError('Speech recognition not supported');
    return;
  }
  
  // Ensure any previous recognition sessions are stopped
  try {
    recognition.abort();
  } catch (e) {
    // Ignore errors from stopping a recognition that hasn't started
  }
  
  // Reset control flags
  recognition.manualStop = false;
  recognition.isListening = true;
  recognition.fullTranscript = ''; // Reset the full transcript
  recognition.processedSegments = new Set(); // Reset the processed segments
  recognition.lastResultTime = 0; // Track time of last result
  recognition.isProcessing = false; // Flag to track if we're already processing a result
  
  console.log("Starting speech recognition");
  
  // For preventing multiple triggers
  let resultDebounceTimer = null;
  
  // Handle results - both interim and final
  recognition.onresult = (event) => {
    // Exit immediately if we're already processing a result or manually stopped
    if (recognition.isProcessing || recognition.manualStop) {
      return;
    }
    
    // Collect results from all speech segments
    let interimTranscript = '';
    let finalTranscript = '';
    let newSegmentFound = false;
    
    // Get current time for debounce
    const now = Date.now();
    
    // Reduced debounce time to process more frequent updates
    if (now - recognition.lastResultTime < 300 && !recognition.manualStop) {
      return;
    }
    
    console.log("Speech recognition event received:", event.results.length, "segments");
    
    for (let i = 0; i < event.results.length; i++) {
      const result = event.results[i];
      
      // Check all alternatives, not just the first one
      let bestTranscript = '';
      let highestConfidence = 0;
      
      // Look through all alternatives to find the best one
      for (let j = 0; j < result.length; j++) {
        const alternative = result[j];
        const transcript = alternative.transcript;
        const confidence = alternative.confidence || 0.01; // Default to very low confidence if not provided
        
        console.log(`Alternative ${j} - "${transcript}" (confidence: ${confidence})`);
        
        // Keep the highest confidence alternative
        if (confidence > highestConfidence) {
          highestConfidence = confidence;
          bestTranscript = transcript;
        }
      }
      
      // Use the best transcript even if confidence is low
      const transcript = bestTranscript;
      
      // Always process the segment if we haven't seen it before, regardless of confidence
      // Create a unique key for this segment
      const segmentKey = `${i}-${transcript}`;
      
      if (result.isFinal) {
        // Only process this segment if we haven't seen it before
        if (!recognition.processedSegments.has(segmentKey)) {
          finalTranscript += transcript + ' ';
          recognition.processedSegments.add(segmentKey);
          recognition.fullTranscript += transcript + ' ';
          newSegmentFound = true;
          console.log("Added final segment:", transcript);
        }
      } else {
        // Always include interim results - these help with catching partial phrases
        interimTranscript += transcript + ' ';
        console.log("Interim segment:", transcript);
        
        // If we haven't had any final results in a while, treat this interim as useful
        const timeSinceLastResult = now - recognition.lastResultTime;
        if (timeSinceLastResult > 2000 && transcript.trim().length > 0) {
          // Add this interim result to the full transcript if we haven't seen it
          if (!recognition.processedSegments.has(segmentKey)) {
            recognition.processedSegments.add(segmentKey);
            recognition.fullTranscript += transcript + ' ';
            newSegmentFound = true;
            console.log("Added interim segment as useful content:", transcript);
          }
        }
      }
    }
    
    // Update last result time
    recognition.lastResultTime = now;
    
    // If manually stopped, return the full transcript
    if (recognition.manualStop) {
      // Clear any pending debounce timers
      if (resultDebounceTimer) {
        clearTimeout(resultDebounceTimer);
      }
      
      recognition.isProcessing = true;
      
      // Clean up the final text
      const finalText = recognition.fullTranscript.trim();
      console.log("Final transcript:", finalText);
      
      // Return the full accumulated transcript when manually stopped
      onResult(finalText, 1.0);
      
      // Reset the processing flag after a delay to allow for proper cleanup
      setTimeout(() => {
        recognition.isProcessing = false;
      }, 1000);
    } else if (newSegmentFound) {
      // Log when we have a new segment but haven't stopped recording
      console.log("New segment found but not stopping yet. Current full transcript:", 
                  recognition.fullTranscript.trim());
    }
  };
  
  // Handle errors
  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    // Don't report no-speech as error unless recording was just started
    const startTime = recognition.startTime || 0;
    const now = Date.now();
    const elapsedTime = now - startTime;
    
    if (event.error === 'no-speech' && elapsedTime > 1000) {
      // Ignore no-speech errors after the first second
    } else {
      onError(event.error);
    }
  };
  
  // Start the recording with a small delay
  setTimeout(() => {
    try {
      // Track when recording started
      recognition.startTime = Date.now();
      recognition.start();
      console.log("Speech recognition started");
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      onError('Failed to start speech recognition');
    }
  }, 100);
};

// Stop recording
export const stopRecording = (recognition) => {
  if (!recognition) {
    console.error("Cannot stop recording - no recognition object");
    return '';
  }
  
  try {
    // Set flags - IMPORTANT: manualStop must be set BEFORE stopping to prevent double processing
    recognition.manualStop = true;
    recognition.isListening = false;
    
    // Copy the current transcript before stopping
    const currentTranscript = recognition.fullTranscript ? recognition.fullTranscript.trim() : '';
    
    // Prevent further processing of results after stopping
    recognition.isProcessing = true;
    
    // Stop the recognition
    recognition.stop();
    console.log("Speech recognition stopped, final transcript:", currentTranscript);
    
    // Return whatever text we have, even if it's very partial
    return currentTranscript;
  } catch (err) {
    console.error("Error stopping speech recognition:", err);
    // Still return whatever text we have so far, even if there was an error
    return recognition.fullTranscript ? recognition.fullTranscript.trim() : '';
  }
}; 