import React, { useState } from 'react';
import { Sparkles, ArrowRight, LoaderCircle } from 'lucide-react';
import styles from './StartingScreen.module.css';

const PRESETS = [
  { topic: "Newton's Third Law", interest: 'Formula 1 Racing', tag: 'Physics' },
  { topic: 'Black hole', interest: 'Intrestellar', tag: 'Physics' },
  { topic: 'Entropy & 2nd Law', interest: 'Coffee Brewing & Baking', tag: 'Chemistry' },
  { topic: 'Central Dogma of Biology', interest: 'Software Compilers', tag: 'Biology' },
  { topic: 'Nash Equilibrium', interest: 'Competitive Esports', tag: 'Game Theory' },
  { topic: 'Marginal Utility', interest: 'RPG Item Trading', tag: 'Economics' },
];

const TOPIC_SUGGESTIONS = ['Quantum Superposition', 'Entropy', 'Fourier Transform'];
const INTEREST_SUGGESTIONS = ['Formula 1', 'Gaming', 'Music Production'];

export const StartingScreen = ({ onStartLearning, isLoading, error }) => {
  const [topic, setTopic] = useState('');
  const [interest, setInterest] = useState('');
  const [validationError, setValidationError] = useState('');

  const displayError = validationError || error;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setValidationError('Please enter an academic concept.');
      return;
    }
    if (!interest.trim()) {
      setValidationError('Please specify your personal interest.');
      return;
    }
    setValidationError('');
    onStartLearning(topic.trim(), interest.trim());
  };

  const applyPreset = (preset) => {
    setTopic(preset.topic);
    setInterest(preset.interest);
    setValidationError('');
  };

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <span className={styles.heroTag}>
          <Sparkles size={14} aria-hidden="true" />
          Personalized AI Learning
        </span>
        <h1 className={styles.heroTitle}>
          Understand deeply.
          <br />
          Not just memorized.
        </h1>
        <p className={styles.heroText}>
          Enter an intimidating academic concept and something you love. The AI tutor builds a
          scientifically accurate bridge connecting the two.
        </p>
      </header>

      <section className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="tutor-topic" className={styles.label}>
                1. Academic Concept
              </label>
              <input
                id="tutor-topic"
                className={styles.input}
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Quantum Superposition, Central Dogma..."
                disabled={isLoading}
              />
              <div className={styles.suggestions}>
                <span className={styles.suggestionsLabel}>Try:</span>
                {TOPIC_SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={styles.chip}
                    onClick={() => setTopic(item)}
                    disabled={isLoading}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="tutor-interest" className={styles.label}>
                2. Your Interest
              </label>
              <input
                id="tutor-interest"
                className={styles.input}
                type="text"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                placeholder="e.g. Formula 1, Music Production, Cooking..."
                disabled={isLoading}
              />
              <div className={styles.suggestions}>
                <span className={styles.suggestionsLabel}>Try:</span>
                {INTEREST_SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={styles.chip}
                    onClick={() => setInterest(item)}
                    disabled={isLoading}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {displayError && (
            <p className={styles.error} role="alert">
              {displayError}
            </p>
          )}

          <div className={styles.actions}>
            <button type="submit" className={styles.primaryButton} disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoaderCircle size={16} className={styles.spinner} aria-hidden="true" />
                  Synthesizing Lesson...
                </>
              ) : (
                <>
                  Start Learning
                  <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <section className={styles.presetSection}>
        <h2 className={styles.label}>Or Pick a Curated Concept Pairing</h2>
        <div className={styles.presetGrid}>
          {PRESETS.map((preset) => (
            <button
              key={preset.topic}
              type="button"
              className={styles.presetCard}
              onClick={() => applyPreset(preset)}
              disabled={isLoading}
            >
              <span className={styles.badge}>{preset.tag}</span>
              <span className={styles.presetTopic}>{preset.topic}</span>
              <span className={styles.presetInterest}>
                via <strong>{preset.interest}</strong>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};