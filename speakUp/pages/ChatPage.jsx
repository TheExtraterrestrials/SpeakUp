import React, { useState, useEffect, useRef } from 'react';
import '../styles/ChatPage.css';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import Groq from 'groq-sdk';

const groq = new Groq({apiKey:"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",dangerouslyAllowBrowser:true});

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

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
          file: audioFile, // Pass the File object directly
          model: "distil-whisper-large-v3-en", // Specify your model
          response_format: "json", // Optional
          language: "en", // Optional
          temperature: 0.0, // Optional
        });

        // Log and display the transcribed text
        console.log(transcription.text);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: transcription.text, sender: 'bot' },
        ]);
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

  return (
    <div className="chat-page">
      <div className="messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'user' ? 'user' : 'bot'}`}
          >
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
    </div>
  );
};

export default ChatPage;
