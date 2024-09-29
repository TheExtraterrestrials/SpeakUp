import React, { useState, useEffect, useRef } from 'react';
import '../styles/ChatPage.css';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: "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", dangerouslyAllowBrowser: true });

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);
  
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const SAMPLE_RATE = 16000;
  const PAUSE_DURATION_2S = 200000; // 2 seconds
  let pauseTimer = null;

  // Scroll to the bottom whenever messages are updated
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startRecording = async () => {
    setIsListening(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorderRef.current.start();
  };

  const stopRecording = async () => {
    setIsListening(false);
    mediaRecorderRef.current.stop();

    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(audioChunks.current, { type: 'audio/wav' });
      audioChunks.current = [];

      // Create a File object for the audio blob
      const audioFile = new File([blob], 'audio.wav', { type: 'audio/wav' });

      // Call Groq for transcription
      try {
        const transcription = await groq.audio.transcriptions.create({
          file: audioFile,
          model: "distil-whisper-large-v3-en",
          response_format: "json",
          language: "en",
          temperature: 0.0,
        });

        const transcribedText = transcription.text.trim();
        console.log('Transcription:', transcribedText);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: transcribedText, sender: 'user' },
        ]);
        handlePrediction(transcribedText); // Trigger prediction after transcription
      } catch (error) {
        console.error('Error during transcription:', error);
      }
    };
  };

  const handleSpeechInput = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handlePrediction = async (inputText) => {
    setIsPredicting(true);
    try {
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: "You are a sentence completion model. Suggest possible next words for the given input. Keep it short.",
          },
          {
            role: 'user',
            content: `Complete this sentence '${inputText}'`,
          },
        ],
        model: "llama3-8b-8192",
        temperature: 0.5,
        max_tokens: 50,
        top_p: 1,
      });
      
      const predictedText = response.choices[0].message.content;
      console.log('Next Word Prediction:', predictedText);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: predictedText, sender: 'ai' }, // Add AI response to messages
      ]);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setIsPredicting(false);
    }
  };

  const handlePauseDetection = () => {
    if (pauseTimer) clearTimeout(pauseTimer);

    pauseTimer = setTimeout(() => {
      if (transcription) {
        handlePrediction(transcription); // Call next-word prediction after a pause
      }
    }, PAUSE_DURATION_2S); // 2-second pause for detection
  };

  useEffect(() => {
    if (isListening) {
      handlePauseDetection();
    }
  }, [transcription]);

  return (
    <div className="chat-page">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={message.sender === 'user' ? 'user-message' : 'ai-message'}>
            {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-section">
        <button
          className={`mic-btn ${isListening ? 'listening' : ''}`}
          onClick={handleSpeechInput}
        >
          {isListening ? <StopIcon /> : <MicIcon />}
        </button>
      </div>

      {isPredicting && <div className="loader">Predicting next words...</div>}
    </div>
  );
};

export default ChatPage;
