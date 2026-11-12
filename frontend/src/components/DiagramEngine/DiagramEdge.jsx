import React from 'react';
import { BaseEdge, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';
import styles from './DiagramEdge.module.css';

export const DiagramEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isActive = data?.isActive;
  const isCompleted = data?.isCompleted;
  const label = data?.label;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        className={`${styles.edgeLine} ${isActive ? styles.active : ''} ${
          isCompleted ? styles.completed : ''
        }`}
      />

      {/* Dynamic Animated Flow Particle */}
      {isActive && (
        <circle r="4" fill="var(--accent)" className={styles.particle}>
          <animateMotion path={edgePath} dur="1.2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Edge textual label */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className={`${styles.edgeLabel} ${isActive ? styles.activeLabel : ''}`}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

