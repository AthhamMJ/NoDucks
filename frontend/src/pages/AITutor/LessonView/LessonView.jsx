import React, { useState } from 'react';
import { ArrowLeft, Sparkles, AlertTriangle, LoaderCircle } from 'lucide-react';
import styles from './LessonView.module.css';

export const LessonView = ({ lesson, onOpenQuiz, onChangeTopic, isQuizLoading }) => {
  const [activeTerm, setActiveTerm] = useState(null);

  const activeDefinition = activeTerm
    ? lesson.keyTerms.find((k) => k.term === activeTerm)?.definition
    : null;

  return (
    <div className={styles.container}>
      {/* Top action bar */}
      <div className={styles.actionBar}>
        <div className={styles.topicInfo}>
          <button type="button" className={styles.secondaryButton} onClick={onChangeTopic}>
            <ArrowLeft size={16} aria-hidden="true" />
            New Topic
          </button>
          <span className={styles.topicName}>{lesson.topic}</span>
          <span className={styles.separator} aria-hidden="true">•</span>
          <span className={styles.analogyLabel}>Analogy: {lesson.interest}</span>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={onOpenQuiz}
          disabled={isQuizLoading}
        >
          {isQuizLoading ? (
            <>
              <LoaderCircle size={16} className={styles.spinner} aria-hidden="true" />
              Building Quiz...
            </>
          ) : (
            <>
              <Sparkles size={16} aria-hidden="true" />
              Test My Understanding
            </>
          )}
        </button>
      </div>

      {/* Core concept card */}
      <section className={styles.card}>
        <span className={styles.badge}>Core Theory</span>
        <h1 className={styles.headline}>{lesson.headline}</h1>

        <div className={styles.introBox}>
          <p className={styles.introText}>{lesson.simpleIntro}</p>
        </div>

        <p className={styles.bodyText}>{lesson.deepExplanation}</p>
      </section>

      {/* Analogy spotlight */}
      <section className={styles.analogyBox}>
        <span className={styles.analogyBadge}>Analogy Bridge ({lesson.interest})</span>
        <h2 className={styles.analogyTitle}>{lesson.analogyBridge.title}</h2>
        <p className={styles.analogyText}>{lesson.analogyBridge.analogyExplanation}</p>

        <div className={styles.mappingGrid}>
          {lesson.analogyBridge?.mappings?.map((m, idx) => (
            <div key={idx} className={styles.mappingCard}>
              <strong className={styles.mappingTheory}>Theory: {m.conceptAspect}</strong>
              <span className={styles.mappingAnalogy}>↔ Analogy: {m.analogyCounterpart}</span>
            </div>
          ))}
        </div>

        {/* Scientific boundary */}
        <div className={styles.boundary}>
          <strong className={styles.boundaryLabel}>
            <AlertTriangle size={16} aria-hidden="true" />
            Where the Analogy Ends:
          </strong>{' '}
          {lesson.analogyBridge.scientificBoundary}
        </div>
      </section>

      {/* Progressive sections */}
      {lesson.sections.map((sec, idx) => (
        <section key={idx} className={styles.card}>
          <div className={styles.partLabel}>Part {idx + 1}</div>
          <h3 className={styles.sectionHeading}>{sec.heading}</h3>
          <p className={styles.sectionBody}>{sec.body}</p>

          {sec.bullets && (
            <ul className={styles.bullets}>
              {sec.bullets.map((b, bIdx) => (
                <li key={bIdx} className={styles.bullet}>
                  {b}
                </li>
              ))}
            </ul>
          )}

          {sec.callout && (
            <div className={styles.callout}>
              <strong>Insight:</strong> {sec.callout}
            </div>
          )}
        </section>
      ))}

      {/* Key terms and summary */}
      <section className={styles.card}>
        <h4 className={styles.termsHeading}>Key Terminology (Click to view)</h4>
        <div className={styles.termsList}>
          {lesson.keyTerms?.map((t, idx) => {
            const isActive = activeTerm === t.term;
            return (
              <button
                key={idx}
                type="button"
                className={`${styles.chip} ${isActive ? styles.chipActive : ''}`}
                aria-pressed={isActive}
                onClick={() => setActiveTerm(isActive ? null : t.term)}
              >
                {t.term}
              </button>
            );
          })}
        </div>

        {activeTerm && (
          <div className={styles.definition}>
            <strong>{activeTerm}: </strong>
            {activeDefinition}
          </div>
        )}

        <div className={styles.summary}>
          <strong>Summary:</strong> {lesson.summary}
        </div>
      </section>
    </div>
  );
};