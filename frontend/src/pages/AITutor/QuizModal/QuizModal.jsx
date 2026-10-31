import React, { useState, useEffect } from 'react';
import { X, Check, CircleAlert, ArrowRight } from 'lucide-react';
import styles from './QuizModal.module.css';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export const QuizModal = ({ quiz, isOpen, onClose, onAskTutorDoubt }) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const questions = quiz.questions || [];
  const current = questions[index];
  const total = questions.length;

  const handleCheck = () => {
    if (selected === null) return;
    const isCorrect = selected === current.correctAnswerIndex;
    setChecked(true);
    setAnswers((prev) => [...prev, { questionIndex: index, selected, isCorrect }]);
  };

  const handleNext = () => {
    if (index < total - 1) {
      setIndex(index + 1);
      setSelected(null);
      setChecked(false);
    } else {
      setFinished(true);
    }
  };

  const score = answers.filter((a) => a.isCorrect).length;
  const isCurrentCorrect = selected === current?.correctAnswerIndex;
  const progressPercent = total ? ((index + (checked ? 1 : 0)) / total) * 100 : 0;

  const handleAskDoubt = () => {
    onClose();
    onAskTutorDoubt(
      `In the quiz on ${quiz.topic}, why is the answer to "${current.question}" equal to "${current.options[current.correctAnswerIndex]}"?`
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.eyebrow}>Assessment</span>
            <h2 id="quiz-modal-title" className={styles.quizTitle}>{quiz.topic}</h2>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            aria-label="Close quiz"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {/* Progress */}
        {!finished && (
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
        )}

        {/* Body */}
        <div className={styles.body}>
          {!finished ? (
            <div>
              <span className={styles.badge}>Testing: {current.conceptTested}</span>
              <h3 className={styles.question}>{current.question}</h3>

              <div className={styles.options}>
                {current.options.map((opt, optIdx) => {
                  const isSelected = selected === optIdx;
                  const isCorrectOption = checked && optIdx === current.correctAnswerIndex;
                  const isIncorrectOption = checked && isSelected && optIdx !== current.correctAnswerIndex;

                  const optionClass = [
                    styles.option,
                    isSelected && !checked ? styles.selected : '',
                    isCorrectOption ? styles.correct : '',
                    isIncorrectOption ? styles.incorrect : '',
                  ].join(' ');

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      className={optionClass}
                      onClick={() => !checked && setSelected(optIdx)}
                      disabled={checked}
                      aria-pressed={isSelected}
                    >
                      <span className={styles.optionLabel}>{OPTION_LABELS[optIdx]}</span>
                      <span className={styles.optionText}>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {checked && (
                <div
                  className={`${styles.feedback} ${isCurrentCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect}`}
                >
                  <p className={styles.feedbackText}>
                    <strong className={styles.feedbackTitle}>
                      {isCurrentCorrect ? (
                        <>
                          <Check size={16} aria-hidden="true" /> Correct!
                        </>
                      ) : (
                        <>
                          <CircleAlert size={16} aria-hidden="true" /> Not quite:
                        </>
                      )}
                    </strong>{' '}
                    {current.explanation}
                  </p>

                  {!isCurrentCorrect && (
                    <button type="button" className={styles.linkButton} onClick={handleAskDoubt}>
                      Ask tutor to explain this in chat
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.results}>
              <h2 className={styles.resultsTitle}>Quiz Complete!</h2>
              <p className={styles.resultsText}>
                You scored <strong>{score}</strong> out of <strong>{total}</strong> (
                {total ? Math.round((score / total) * 100) : 0}%)
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <button type="button" className={styles.secondaryButton} onClick={onClose}>
            Close
          </button>

          {!finished ? (
            !checked ? (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleCheck}
                disabled={selected === null}
              >
                Check Answer
              </button>
            ) : (
              <button type="button" className={styles.primaryButton} onClick={handleNext}>
                {index < total - 1 ? 'Next Question' : 'Finish Quiz'}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            )
          ) : (
            <button type="button" className={styles.primaryButton} onClick={onClose}>
              Back to Lesson
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};