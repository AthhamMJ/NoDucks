import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import styles from './FormulaDisplay.module.css';

export const FormulaDisplay = ({ latex, displayMode = true }) => {
  const html = useMemo(() => {
    if (!latex) return '';
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode,
      });
    } catch {
      return latex;
    }
  }, [latex, displayMode]);

  if (!latex) return null;

  return (
    <span
      className={styles.formula}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

