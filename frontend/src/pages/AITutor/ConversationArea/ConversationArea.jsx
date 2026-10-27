import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Lightbulb, Wand2, Send, LoaderCircle } from 'lucide-react';
import styles from './ConversationArea.module.css';

export const ConversationArea = ({ messages, onSendMessage, isLoading, topic, interest }) => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('question');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim(), mode);
    setText('');
  };

  const handlePrompt = (selectedMode, promptText) => {
    setMode(selectedMode);
    setText(promptText);
  };

  const prompts = [
    {
      key: 'doubt',
      icon: HelpCircle,
      label: 'I Have a Doubt',
      text: `I have a doubt about how ${topic} works.`,
    },
    {
      key: 'example',
      icon: Lightbulb,
      label: 'Give Me an Example',
      text: `Can you give me another example connected to ${interest}?`,
    },
    {
      key: 'simple',
      icon: Wand2,
      label: 'Explain More Simply',
      text: 'Explain this more simply, without technical jargon.',
    },
  ];

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h3 className={styles.title}>Ask Your Tutor</h3>
        <p className={styles.subtitle}>
          Clear any doubt, request simpler mental models, or ask for another analogy.
        </p>
      </header>

      <div className={styles.prompts}>
        {prompts.map(({ key, icon: Icon, label, text: promptText }) => (
          <button
            key={key}
            type="button"
            className={styles.promptChip}
            onClick={() => handlePrompt(key, promptText)}
            disabled={isLoading}
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className={styles.feed} aria-live="polite">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`${styles.message} ${m.role === 'user' ? styles.user : styles.assistant}`}
          >
            {m.content}
          </div>
        ))}

        {isLoading && (
          <div className={`${styles.message} ${styles.assistant} ${styles.typing}`}>
            <LoaderCircle size={14} className={styles.spinner} aria-hidden="true" />
            Tutor is writing a clear explanation...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className={styles.inputBar}>
        <input
          type="text"
          className={styles.input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Ask anything about ${topic}...`}
          disabled={isLoading}
          aria-label="Message your tutor"
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={isLoading || !text.trim()}
        >
          <Send size={16} aria-hidden="true" />
          Send
        </button>
      </form>
    </section>
  );
};