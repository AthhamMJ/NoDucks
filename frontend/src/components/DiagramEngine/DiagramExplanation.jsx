import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';
import styles from './DiagramExplanation.module.css';

export const DiagramExplanation = ({
  activeStep,
  totalSteps,
  caption,
  selectedNode,
}) => {
  if (!activeStep && !selectedNode) return null;

  const currentLabel = selectedNode ? selectedNode.label : activeStep?.label;
  const currentExplanation = selectedNode
    ? selectedNode.explanation || selectedNode.label
    : activeStep?.explanation || activeStep?.label;
  const currentStepCaption = selectedNode
    ? selectedNode.caption
    : activeStep?.caption;

  const stepNumber = selectedNode
    ? selectedNode.stepIndex
    : (activeStep?.stepIndex ?? 0) + 1;

  const incomingCount = selectedNode
    ? selectedNode.incoming?.length || 0
    : activeStep?.incomingCount || 0;

  const outgoingCount = selectedNode
    ? selectedNode.outgoing?.length || 0
    : activeStep?.outgoingCount || 0;

  return (
    <div className={styles.explanationBox}>
      {caption && (
        <div className={styles.diagramCaption}>
          <p className={styles.captionLine}>
            <strong>Overview: </strong>
            {caption}
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={stepNumber}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className={styles.inner}
        >
          <div className={styles.topMeta}>
            <span className={styles.tag}>
              <Lightbulb size={13} aria-hidden="true" />
              Focus Stage {stepNumber} of {totalSteps}
            </span>

            <div className={styles.connections}>
              {incomingCount > 0 && (
                <span className={styles.connPill}>
                  <ArrowLeft size={11} /> {incomingCount} Predecessor
                  {incomingCount > 1 ? 's' : ''}
                </span>
              )}
              {outgoingCount > 0 && (
                <span className={styles.connPill}>
                  <ArrowRight size={11} /> {outgoingCount} Outcome
                  {outgoingCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <h3 className={styles.conceptTitle}>{currentLabel}</h3>

          {currentExplanation && (
            <p className={styles.stepExplanation}>{currentExplanation}</p>
          )}

          {currentStepCaption && (
            <p className={styles.captionLine}>
              <strong>Note: </strong>
              {currentStepCaption}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
