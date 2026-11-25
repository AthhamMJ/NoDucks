import React, { useState } from "react";
import { Sparkles, ArrowRight, LoaderCircle } from "lucide-react";
import styles from "./StartingScreen.module.css";

const SUBJECT_TOPICS = {
  Physics: [
    "Newton's first law",
    "Newton's second law",
    "Newton's third law",
    "Velocity and speed",
    "Distance and displacement",
    "Gravitational force",
    "Acceleration",
    "frictional force",
    "Inertia",
    "Momentum",
    "Conservation of momentum",
    "Work and energy",
    "Kinetic energy",
    "Potential energy",
    "Power",
    "Pressure",
    "Density",
    "Projectile motion",
    "Circular motion",
    "Centripetal force",
    "Simple harmonic motion",
    "Waves and frequency",
    "Sound",
    "Light and reflection",
    "Refraction",
    "Electric charge",
    "Electric current",
    "Ohm's law",
    "Magnetism",
    "Heat and temperature",
  ],
  Maths: ["Number direction"],
};

const DISABLED_SUBJECTS = ["Chemistry", "Programming", "History"];
const INTEREST_OPTIONS = ["Movies", "Sports", "Games", "car"];
const AGE_OPTIONS = [
  { value: "5-8", label: "5–8 years (Kids / ELI5)" },
  { value: "9-12", label: "9–12 years (Middle School)" },
  { value: "13-15", label: "13–17 years (High School)" },
  { value: "14-16", label: "14–16 years (High School)" },
  { value: "16-17", label: "16–17 years (High School)" },
  { value: "18+", label: "18+ years (College / Adult)" },
];

export const StartingScreen = ({ onStartLearning, isLoading, error }) => {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [interest, setInterest] = useState("");
  const [age, setAge] = useState("");
  const [validationError, setValidationError] = useState("");

  const displayError = validationError || error;

  const handleSubjectChange = (e) => {
    const newSubject = e.target.value;
    setSubject(newSubject);
    setTopic("");
    setValidationError("");
  };

  const availableTopics =
    subject && SUBJECT_TOPICS[subject] ? SUBJECT_TOPICS[subject] : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject) {
      setValidationError("Please select a subject.");
      return;
    }
    if (!topic) {
      setValidationError("Please select a topic.");
      return;
    }
    if (!interest) {
      setValidationError("Please select an interest.");
      return;
    }
    if (!age) {
      setValidationError("Please select an age.");
      return;
    }
    const trimmedTopic = topic.trim();
    if (!trimmedTopic || trimmedTopic.length < 3) {
      setValidationError("Please enter a topic of at least 3 characters.");
      return;
    }
    if (trimmedTopic.length > 80) {
      setValidationError("Topic must be 80 characters or fewer.");
      return;
    }
    setValidationError("");
    onStartLearning(topic.trim(), interest, subject, age);
  };

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <span className={styles.heroTag}>
          <Sparkles size={14} aria-hidden="true" />
          AI Coaching
        </span>
        <h1 className={styles.heroTitle}>Personalized AI Learning</h1>
        <p className={styles.heroText}>
          Select your subject, topic, personal interest, and age to generate
          your tailored lesson.
        </p>
      </header>

      <section className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="tutor-subject" className={styles.label}>
                1. Subject
              </label>
              <select
                id="tutor-subject"
                className={styles.select}
                value={subject}
                onChange={handleSubjectChange}
                disabled={isLoading}
              >
                <option value="">Select a subject...</option>
                <option value="Physics">Physics</option>
                <option value="Maths">Maths</option>
                {DISABLED_SUBJECTS.map((s) => (
                  <option key={s} value={s} disabled>
                    {s} (Disabled)
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="tutor-topic" className={styles.label}>
                2. Topic
              </label>
              <input
                id="tutor-topic"
                type="text"
                className={styles.select}
                list="tutor-topic-options"
                value={topic}
                placeholder={
                  subject
                    ? "Search or type a topic..."
                    : "Select a subject first"
                }
                onChange={(e) => {
                  setTopic(e.target.value);
                  setValidationError("");
                }}
                disabled={isLoading || !subject}
                autoComplete="off"
              />
              <datalist id="tutor-topic-options">
                {availableTopics.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>

            <div className={styles.field}>
              <label htmlFor="tutor-interest" className={styles.label}>
                3. Interest
              </label>
              <select
                id="tutor-interest"
                className={styles.select}
                value={interest}
                onChange={(e) => {
                  setInterest(e.target.value);
                  setValidationError("");
                }}
                disabled={isLoading}
              >
                <option value="">Select an interest...</option>
                {INTEREST_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="tutor-age" className={styles.label}>
                4. Age
              </label>
              <select
                id="tutor-age"
                className={styles.select}
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  setValidationError("");
                }}
                disabled={isLoading}
              >
                <option value="">Select age...</option>
                {AGE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {displayError && (
            <p className={styles.error} role="alert">
              {displayError}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={
                isLoading || !subject || !topic.trim() || !interest || !age
              }
            >
              {isLoading ? (
                <>
                  <LoaderCircle
                    size={16}
                    className={styles.spinner}
                    aria-hidden="true"
                  />
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
    </div>
  );
};
