import React, { useEffect, useState, useId, useMemo, useRef } from 'react';
import mermaid from 'mermaid';
import { Workflow, Code, Copy, Check, AlertCircle, Eye, LoaderCircle } from 'lucide-react';
import '../../../styles/AiTutor.css';
import styles from './MermaidDiagram.module.css';

export const MermaidDiagram = ({ diagram }) => {
  const [svgContent, setSvgContent] = useState('');
  const [isRendering, setIsRendering] = useState(true);
  const [renderError, setRenderError] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isInView, setIsInView] = useState(() => typeof IntersectionObserver === 'undefined');
  const viewportRef = useRef(null);
  const reactId = useId();

  const [theme, setTheme] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') || 'dark';
    }
    return 'dark';
  });

  // Track theme changes dynamically
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const observer = new MutationObserver(() => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(currentTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  // Smooth IntersectionObserver trigger (activates once and stays settled)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px 60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [svgContent]);

  const rawCode = diagram?.mermaidCode;
  const cleanCode = useMemo(() => {
    if (!rawCode) return '';
    return rawCode
      .replace(/^```(?:mermaid)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }, [rawCode]);

  useEffect(() => {
    let isCancelled = false;
    const safeId = `mermaid_${reactId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}`;

    const render = async () => {
      if (!cleanCode) {
        setIsRendering(false);
        return;
      }

      setIsRendering(true);
      setRenderError(null);

      const isDark = theme === 'dark';

      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          fontFamily: 'inherit',
          theme: isDark ? 'dark' : 'neutral',
          themeVariables: isDark
            ? {
                darkMode: true,
                background: '#1b1b1f',
                mainBkg: '#26262c',
                nodeBorder: '#818cf8',
                nodeTextColor: '#f5f5f7',
                textColor: '#f5f5f7',
                lineColor: '#818cf8',
                primaryColor: '#26262c',
                primaryTextColor: '#f5f5f7',
                primaryBorderColor: '#818cf8',
                secondaryColor: '#1b1b1f',
                tertiaryColor: '#26262c',
              }
            : {
                darkMode: false,
                background: '#ffffff',
                mainBkg: '#f4f4f8',
                nodeBorder: '#0071e3',
                nodeTextColor: '#1a1a1a',
                textColor: '#1a1a1a',
                lineColor: '#0071e3',
                primaryColor: '#f4f4f8',
                primaryTextColor: '#1a1a1a',
                primaryBorderColor: '#0071e3',
                secondaryColor: '#ffffff',
                tertiaryColor: '#f4f4f8',
              },
        });

        const { svg } = await mermaid.render(safeId, cleanCode);
        if (!isCancelled) {
          setSvgContent(svg);
          setRenderError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn('Failed to render Mermaid diagram:', err);
          setRenderError(err?.message || 'Could not parse diagram syntax.');
        }
      } finally {
        // Clean up temporary DOM nodes created by mermaid
        const tempNode = document.getElementById(safeId);
        if (tempNode) tempNode.remove();
        const errNode = document.getElementById(`d${safeId}`);
        if (errNode) errNode.remove();

        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [cleanCode, theme, reactId]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (!diagram || !diagram.mermaidCode) return null;

  return (
    <section className={`tutor-diagram-card ${styles.card}`} aria-label="Conceptual Flowchart">
      {/* Ambient subtle background radial glow */}
      <div className="tutor-diagram-glow" aria-hidden="true" />

      <div className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.badge}>
            <Workflow size={13} aria-hidden="true" />
            Visual Concept Flow
          </span>
          <h2 className={styles.title}>{diagram.title || 'Mechanism Progression'}</h2>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={`${styles.btn} ${showCode ? styles.btnActive : ''}`}
            onClick={() => setShowCode((prev) => !prev)}
            aria-pressed={showCode}
            title={showCode ? 'View Diagram' : 'View Mermaid Source'}
          >
            <Code size={14} aria-hidden="true" />
            {showCode ? 'Show Diagram' : 'Mermaid Code'}
          </button>

          <button
            type="button"
            className={styles.btn}
            onClick={handleCopyCode}
            title="Copy diagram code"
          >
            {copied ? (
              <>
                <Check size={14} aria-hidden="true" />
                Copied
              </>
            ) : (
              <>
                <Copy size={14} aria-hidden="true" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className={`tutor-diagram-viewport ${isInView ? 'in-view' : ''} ${styles.diagramContainer}`}
      >
        {showCode ? (
          <pre className={styles.codeBlock}>
            <code>{cleanCode}</code>
          </pre>
        ) : renderError ? (
          <div className={styles.errorState}>
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={15} aria-hidden="true" />
              <span>Diagram preview unavailable. Showing code representation:</span>
            </div>
            <pre className={styles.codeBlock}>
              <code>{cleanCode}</code>
            </pre>
          </div>
        ) : isRendering && !svgContent ? (
          <div className={styles.loadingPlaceholder}>
            <LoaderCircle size={18} className={styles.spinner} aria-hidden="true" />
            <span>Rendering visual diagram...</span>
          </div>
        ) : (
          <div
            className={styles.diagramSvg}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>

      {diagram.caption && (
        <div className={styles.captionBox}>
          <Eye size={16} className={styles.captionIcon} aria-hidden="true" />
          <p className={styles.captionText}>
            <strong>Observe: </strong>
            {diagram.caption}
          </p>
        </div>
      )}
    </section>
  );
};

export default MermaidDiagram;
