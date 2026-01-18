'use client';

import { useState, useCallback, useRef } from 'react';
import { scenarios, defaultScenario } from '@/config/scenarios';

export interface Message {
  id: string;
  role: 'caller' | 'receiver';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface ConversationState {
  status: 'idle' | 'ringing' | 'connected' | 'ended';
  messages: Message[];
  isSpeaking: boolean;
  currentSpeaker: 'caller' | 'receiver' | null;
  duration: number;
  isThinking: boolean;
}

interface Voice {
  id: string;
  name: string;
  accent: string;
  gender: string;
}

export function useConversation() {
  const [state, setState] = useState<ConversationState>({
    status: 'idle',
    messages: [],
    isSpeaking: false,
    currentSpeaker: null,
    duration: 0,
    isThinking: false,
  });
  
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [selectedScenario, setSelectedScenario] = useState<string>(defaultScenario);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentScenario = scenarios[selectedScenario] || scenarios[defaultScenario];

  const fetchVoices = useCallback(async () => {
    setIsLoadingVoices(true);
    try {
      const response = await fetch('/api/voices');
      if (response.ok) {
        const data = await response.json();
        setVoices(data.voices);
        if (data.voices.length > 0 && !selectedVoice) {
          setSelectedVoice(data.voices[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch voices:', error);
    } finally {
      setIsLoadingVoices(false);
    }
  }, [selectedVoice]);

  const startCall = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'ringing',
      messages: [],
      duration: 0,
      isThinking: false,
    }));

    // Simulate ringing for 2 seconds
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        status: 'connected',
      }));
      
      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
    }, 2000);
  }, []);

  const endCall = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setState(prev => ({
      ...prev,
      status: 'ended',
      isSpeaking: false,
      currentSpeaker: null,
      isThinking: false,
    }));

    // Reset after showing ended state
    setTimeout(() => {
      setState({
        status: 'idle',
        messages: [],
        isSpeaking: false,
        currentSpeaker: null,
        duration: 0,
        isThinking: false,
      });
    }, 2000);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (state.status !== 'connected') return;

    const callerMessage: Message = {
      id: `msg-${Date.now()}-caller`,
      role: 'caller',
      content: text,
      timestamp: new Date(),
    };

    // Add caller message and set thinking state
    const updatedMessages = [...state.messages, callerMessage];
    
    setState(prev => ({
      ...prev,
      messages: updatedMessages,
      currentSpeaker: 'caller',
      isThinking: true,
    }));

    try {
      // Get AI response from chat API
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          scenarioId: selectedScenario,
        }),
      });

      if (!chatResponse.ok) {
        throw new Error('Failed to get chat response');
      }

      const chatData = await chatResponse.json();
      const aiResponseText = chatData.response;

      setState(prev => ({ 
        ...prev, 
        isThinking: false,
        isSpeaking: true, 
        currentSpeaker: 'receiver' 
      }));

      // Convert response to speech
      const ttsResponse = await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: aiResponseText,
          voiceId: selectedVoice,
        }),
      });

      if (ttsResponse.ok) {
        const audioBlob = await ttsResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const receiverMessage: Message = {
          id: `msg-${Date.now()}-receiver`,
          role: 'receiver',
          content: aiResponseText,
          timestamp: new Date(),
          audioUrl,
        };

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, receiverMessage],
        }));

        // Play audio
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => {
          setState(prev => ({
            ...prev,
            isSpeaking: false,
            currentSpeaker: null,
          }));
        };
        audioRef.current.onerror = () => {
          setState(prev => ({
            ...prev,
            isSpeaking: false,
            currentSpeaker: null,
          }));
        };
        audioRef.current.play().catch(err => {
          console.error('Audio playback failed:', err);
          setState(prev => ({
            ...prev,
            isSpeaking: false,
            currentSpeaker: null,
          }));
        });
      } else {
        // If TTS fails, still add the text message
        const receiverMessage: Message = {
          id: `msg-${Date.now()}-receiver`,
          role: 'receiver',
          content: aiResponseText,
          timestamp: new Date(),
        };

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, receiverMessage],
          isSpeaking: false,
          currentSpeaker: null,
        }));
      }
    } catch (error) {
      console.error('Failed to generate response:', error);
      setState(prev => ({ 
        ...prev, 
        isSpeaking: false, 
        currentSpeaker: null,
        isThinking: false,
      }));
    }
  }, [state.status, state.messages, selectedVoice, selectedScenario]);

  return {
    state,
    voices,
    selectedVoice,
    selectedScenario,
    currentScenario,
    isLoadingVoices,
    setSelectedVoice,
    setSelectedScenario,
    fetchVoices,
    startCall,
    endCall,
    sendMessage,
  };
}
