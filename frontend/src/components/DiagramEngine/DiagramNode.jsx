import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'motion/react';
import { CheckCircle2, ChevronRight, Sparkles, Layers } from 'lucide-react';
import styles from './DiagramNode.module.css';

export const DiagramNode = ({ data, selected }) => {
  const {
    id,
    label,
    stepIndex,
    totalSteps,
    isActive,
    isCompleted,
    isPending,
    isHorizontal,
  } = data;

  const targetPosition = isHorizontal ? Position.Left : Position.Top;
  const sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

  return (
    <motion.div
      className={`${styles.nodeCard} ${isActive ? styles.active : ''} ${
        isCompleted ? styles.completed : ''
      } ${isPending ? styles.pending : ''} ${selected ? styles.selected : ''}`}
      initial={{ scale: 0.88, opacity: 0, y: 10 }}
      animate={{
        scale: isActive ? 1.04 : 1,
        opacity: isPending ? 0.45 : 1,
        y: 0,
      }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      role="button"
      tabIndex={0}
      aria-label={`Node ${stepIndex}: ${label}`}
    >
      {/* Target input handle */}
      <Handle
        type="target"
        position={targetPosition}
        className={styles.handle}
        isConnectable={false}
      />

      <div className={styles.inner}>
        {/* Step Indicator Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            {isCompleted ? (
              <CheckCircle2 size={12} className={styles.iconCompleted} aria-hidden="true" />
            ) : isActive ? (
              <Sparkles size={12} className={styles.iconActive} aria-hidden="true" />
            ) : (
              <Layers size={12} className={styles.iconDefault} aria-hidden="true" />
            )}
            <span>
              Step {stepIndex} / {totalSteps}
            </span>
          </div>

          {isActive && <span className={styles.pulseDot} aria-hidden="true" />}
        </div>

        {/* Node Label / Concept text */}
        <div className={styles.content}>
          <p className={styles.label}>{label}</p>
        </div>
      </div>

      {/* Source output handle */}
      <Handle
        type="source"
        position={sourcePosition}
        className={styles.handle}
        isConnectable={false}
      />
    </motion.div>
  );
};

