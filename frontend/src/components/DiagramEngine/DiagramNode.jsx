import React from 'react';
import { Handle, Position } from '@xyflow/react';
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
    <div
      className={`${styles.nodeCard} ${isActive ? styles.active : ''} ${
        isCompleted ? styles.completed : ''
      } ${isPending ? styles.pending : ''} ${selected ? styles.selected : ''}`}
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
    </div>
  );
};

