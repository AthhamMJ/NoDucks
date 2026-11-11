import { useState, useEffect, useRef, useCallback } from 'react';

export function useDiagramNarration({
  title,
  steps = [],
  caption = '',
  currentStep = 0,
  isPlaying = false,
  playId,
  onStepComplete,
}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [narrationFailed, setNarrationFailed] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);

  const synthRef = useRef(null);
  const currentUtteranceRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);
  const isEnabledRef = useRef(isEnabled);
  const onStepCompleteRef = useRef(onStepComplete);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  useEffect(() => {
    onStepCompleteRef.current = onStepComplete;
  }, [onStepComplete]);

  // Check support and load available English voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);

      const updateVoices = () => {
        if (!synthRef.current) return;
        const allVoices = synthRef.current.getVoices() || [];
        // Filter English voices or fallback to all
        const englishVoices = allVoices.filter((v) =>
          v.lang.toLowerCase().startsWith('en')
        );
        const available = englishVoices.length > 0 ? englishVoices : allVoices;
        setVoices(available);

        // Auto-select clean natural voice if found
        if (available.length > 0) {
          const preferred =
            available.find(
              (v) =>
                v.name.includes('Natural') ||
                v.name.includes('Google') ||
                v.name.includes('Samantha') ||
                v.name.includes('Daniel')
            ) || available[0];
          setSelectedVoice((prev) => prev || preferred);
        }
      };

      updateVoices();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Stop/cancel current speech
  const stopNarration = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    currentUtteranceRef.current = null;
  }, []);

  // Speak a specific text phrase
  const speakText = useCallback(
    (text) => {
      if (!synthRef.current || !text || !isEnabledRef.current) return;

      // Cancel any ongoing speech to avoid overlapping
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = rate;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        currentUtteranceRef.current = null;

        // If animation is in active play mode, trigger progression
        if (isPlayingRef.current && onStepCompleteRef.current) {
          onStepCompleteRef.current();
        }
      };

      utterance.onerror = (e) => {
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('Speech synthesis error:', e);
          setNarrationFailed(true);
        }
      };

      currentUtteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    },
    [selectedVoice, rate]
  );

  // Trigger narration for current step when active
  useEffect(() => {
    if (!isEnabled || !steps || steps.length === 0) {
      stopNarration();
      return;
    }

    const currentStepObj = steps[currentStep];
    if (!currentStepObj) return;

    // Compose concise educational speech prompt
    let narrationPhrase = '';
    if (currentStep === 0 && title) {
      narrationPhrase = `${title}. Step 1: ${currentStepObj.label}.`;
      if (caption) {
        narrationPhrase += ` ${caption}`;
      }
    } else {
      narrationPhrase = `Step ${currentStep + 1}: ${currentStepObj.label}.`;
    }

    speakText(narrationPhrase);

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [
    currentStep,
    isEnabled,
    steps,
    title,
    caption,
    speakText,
    stopNarration,
    playId, // exists only to re-trigger the effect on restart
  ]);

  // Synchronize pause/resume with animation playback
  useEffect(() => {
    if (!synthRef.current || !isEnabled) return;

    if (!isPlaying && isSpeaking) {
      synthRef.current.pause();
    } else if (isPlaying && synthRef.current.paused) {
      synthRef.current.resume();
    }
  }, [isPlaying, isSpeaking, isEnabled]);

  const toggleNarration = useCallback(() => {
    setIsEnabled((prev) => {
      const next = !prev;
      if (!next) {
        stopNarration();
      } else {
        setNarrationFailed(false);
      }
      return next;
    });
  }, [stopNarration]);

  return {
    isSupported,
    isEnabled,
    isSpeaking,
    narrationFailed,
    voices,
    selectedVoice,
    rate,
    toggleNarration,
    setSelectedVoice,
    setRate,
    stopNarration,
  };
}

