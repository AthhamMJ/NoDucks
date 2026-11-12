import { useState, useEffect, useRef, useCallback } from 'react';

export function useDiagramNarration({
  title,
  steps = [],
  currentStep = 0,
  isPlaying = false,
  playId = 0,
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
  const activeUtteranceRef = useRef(null);

  // Keep latest props/state in refs so callbacks and speech synthesis don't restart when unrelated values change
  const stepsRef = useRef(steps);
  const titleRef = useRef(title);
  const isPlayingRef = useRef(isPlaying);
  const isEnabledRef = useRef(isEnabled);
  const selectedVoiceRef = useRef(selectedVoice);
  const rateRef = useRef(rate);
  const onStepCompleteRef = useRef(onStepComplete);

  const prevIsPlayingRef = useRef(isPlaying);
  const isFirstRender = useRef(true);

  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  useEffect(() => {
    selectedVoiceRef.current = selectedVoice;
  }, [selectedVoice]);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

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
        const englishVoices = allVoices.filter((v) =>
          v.lang.toLowerCase().startsWith('en')
        );
        const available = englishVoices.length > 0 ? englishVoices : allVoices;
        setVoices(available);

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

  // Stop/cancel current speech and clear active utterance so onend/onerror are ignored
  const stopNarration = useCallback(() => {
    activeUtteranceRef.current = null;
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Speak a text string
  const speakText = useCallback((text) => {
    if (!synthRef.current || !text || !isEnabledRef.current) return;

    // Invalidate any existing utterance before cancelling
    activeUtteranceRef.current = null;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
    }
    utterance.rate = rateRef.current;
    utterance.pitch = 1.0;

    activeUtteranceRef.current = utterance;

    utterance.onstart = () => {
      if (activeUtteranceRef.current === utterance) {
        setIsSpeaking(true);
      }
    };

    utterance.onend = () => {
      if (activeUtteranceRef.current !== utterance) return; // Ignore cancelled utterances
      activeUtteranceRef.current = null;
      setIsSpeaking(false);

      if (isPlayingRef.current && onStepCompleteRef.current) {
        onStepCompleteRef.current();
      }
    };

    utterance.onerror = (e) => {
      if (activeUtteranceRef.current !== utterance) return; // Ignore cancelled utterances
      activeUtteranceRef.current = null;
      setIsSpeaking(false);
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('Speech synthesis error:', e);
        setNarrationFailed(true);
      }
    };

    synthRef.current.speak(utterance);
  }, []);

  // Trigger narration only when currentStep, isEnabled, or playId changes
  useEffect(() => {
    if (!isEnabled || !stepsRef.current || stepsRef.current.length === 0) {
      stopNarration();
      return;
    }

    if (!isPlayingRef.current) {
      stopNarration();
      return;
    }

    const currentStepObj = stepsRef.current[currentStep];
    if (!currentStepObj) return;

    // Compose narration phrase in order:
    // 1. Title (step 1 only, i.e. currentStep === 0)
    // 2. "Step N"
    // 3. Step explanation (fallback to label if missing)
    // 4. Step caption (if present)
    const parts = [];
    if (currentStep === 0 && titleRef.current) {
      parts.push(titleRef.current);
    }
    parts.push(`Step ${currentStep + 1}`);

    const explanation = currentStepObj.explanation || currentStepObj.label;
    if (explanation) {
      parts.push(explanation);
    }
    if (currentStepObj.caption) {
      parts.push(currentStepObj.caption);
    }

    const narrationPhrase = parts
      .map((p) => p.trim())
      .filter(Boolean)
      .join('. ');

    speakText(narrationPhrase);

    return () => {
      activeUtteranceRef.current = null;
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [currentStep, isEnabled, playId, speakText, stopNarration]);

  // Pause and resume only when isPlaying state actually changes, not on initial render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!synthRef.current || !isEnabledRef.current) return;

    const prevPlaying = prevIsPlayingRef.current;
    prevIsPlayingRef.current = isPlaying;

    if (prevPlaying !== isPlaying) {
      if (!isPlaying) {
        if (synthRef.current.speaking) {
          synthRef.current.pause();
        }
      } else {
        if (synthRef.current.paused) {
          synthRef.current.resume();
        }
      }
    }
  }, [isPlaying]);

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
