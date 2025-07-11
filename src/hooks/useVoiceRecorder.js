import { useState } from 'react';
import MicRecorder from 'mic-recorder-to-mp3';

const recorder = new MicRecorder({ bitRate: 128 });

const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  const startRecording = async () => {
    try {
      await recorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Mic access denied or not supported');
    }
  };

  const stopRecording = async () => {
    try {
      const [buffer, blob] = await recorder.stop().getMp3();
      setIsRecording(false);

      const file = new File(buffer, 'voice.mp3', { type: blob.type });

      const formData = new FormData();
      formData.append('audio', file); // match expected param in `stt.php`

      const response = await fetch('/php/stt.php', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.text) {
        setTranscript(result.text);
      } else {
        setError('No transcription found');
      }
    } catch (err) {
      setError('Failed to transcribe');
    }
  };

  return { isRecording, transcript, error, startRecording, stopRecording };
};

export default useVoiceRecorder;
