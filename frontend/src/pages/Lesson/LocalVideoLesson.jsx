import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LoaderCircle, Video, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import styles from './LocalVideoLesson.module.css';

const JOB_ID_KEY = 'noducks_local_video_job_id';
const LEGACY_JOB_ID_KEY = 'local_video_job_id';
const JOB_START_KEY = 'noducks_local_video_job_start';

export function LocalVideoLesson({ lesson }) {
  // If feature flag is off, do not render
  if (import.meta.env.VITE_LOCAL_VIDEO_LESSON !== 'true') {
    return null;
  }

  return <LocalVideoLessonInner lesson={lesson} />;
}

function LocalVideoLessonInner({ lesson }) {
  const [topic, setTopic] = useState(lesson?.topic || '');
  const [ageBand, setAgeBand] = useState(lesson?.age || '14-16');
  const [interest, setInterest] = useState(lesson?.interest || '');

  // States: idle, submitting, preparing, playing, failed
  const [status, setStatus] = useState('idle');
  const [validationError, setValidationError] = useState('');
  const [progressStage, setProgressStage] = useState('queued');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorDetails, setErrorDetails] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  const pollTimerRef = useRef(null);
  const clockTimerRef = useRef(null);
  const objectUrlRef = useRef(null);
  const activeJobIdRef = useRef(null);

  const cleanupObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const clearTimers = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (clockTimerRef.current) {
      clearInterval(clockTimerRef.current);
      clockTimerRef.current = null;
    }
  }, []);

  const clearStoredJob = useCallback(() => {
    try {
      sessionStorage.removeItem(JOB_ID_KEY);
      sessionStorage.removeItem(LEGACY_JOB_ID_KEY);
      sessionStorage.removeItem(JOB_START_KEY);
    } catch {
      // sessionStorage not accessible
    }
    activeJobIdRef.current = null;
  }, []);

  // Revoke object URL on unmount and stop timers
  useEffect(() => {
    return () => {
      clearTimers();
      cleanupObjectUrl();
    };
  }, [clearTimers, cleanupObjectUrl]);

  // Load video blob into object URL
  const loadAndPlayVideo = useCallback(
    async (jobId) => {
      clearTimers();
      clearStoredJob();
      try {
        const response = await api.get(`/api/videos/${encodeURIComponent(jobId)}`, {
          responseType: 'blob',
        });
        const newUrl = URL.createObjectURL(response.data);
        cleanupObjectUrl();
        objectUrlRef.current = newUrl;
        setVideoUrl(newUrl);
        setStatus('playing');
      } catch (err) {
        const errPayload = err.response?.data?.error;
        setErrorDetails({
          category: errPayload?.category || 'API',
          code: errPayload?.code || 'FETCH_FAILED',
          message: errPayload?.message || err.message,
        });
        setStatus('failed');
      }
    },
    [clearTimers, clearStoredJob, cleanupObjectUrl]
  );

  // Poll video status
  const startPolling = useCallback(
    (jobId, initialStartTime = Date.now()) => {
      clearTimers();
      activeJobIdRef.current = jobId;
      setStatus('preparing');

      // Setup elapsed clock
      const calculateElapsed = () =>
        Math.max(0, Math.floor((Date.now() - initialStartTime) / 1000));
      setElapsedSeconds(calculateElapsed());

      clockTimerRef.current = setInterval(() => {
        setElapsedSeconds(calculateElapsed());
      }, 1000);

      const checkStatus = async () => {
        try {
          const res = await api.get('/api/dev/video/status', {
            params: { job_id: jobId },
          });
          const data = res.data;

          if (data.stage) {
            setProgressStage(data.stage);
          }

          if (data.status === 'draft') {
            await loadAndPlayVideo(jobId);
          } else if (data.status === 'failed') {
            clearTimers();
            clearStoredJob();
            setErrorDetails({
              category: data.error?.category || 'GENERATION',
              code: data.error?.code || 'RENDER_FAILED',
              message: data.error?.message,
            });
            setStatus('failed');
          }
        } catch (err) {
          // If server returns error payload
          const errData = err.response?.data?.error;
          if (err.response?.status === 404 || (errData && errData.category)) {
            clearTimers();
            clearStoredJob();
            setErrorDetails({
              category: errData?.category || 'API',
              code: errData?.code || 'API_UNREACHABLE',
              message: errData?.message || err.message,
            });
            setStatus('failed');
          }
        }
      };

      // Poll immediately once, then interval every 5 seconds
      checkStatus();
      pollTimerRef.current = setInterval(checkStatus, 5000);
    },
    [clearTimers, clearStoredJob, loadAndPlayVideo]
  );

  // Resume polling on mount if a job ID is stored in sessionStorage
  useEffect(() => {
    try {
      const storedId =
        sessionStorage.getItem(JOB_ID_KEY) || sessionStorage.getItem(LEGACY_JOB_ID_KEY);
      if (storedId) {
        const storedStart = parseInt(sessionStorage.getItem(JOB_START_KEY), 10);
        const startTime = !isNaN(storedStart) && storedStart > 0 ? storedStart : Date.now();
        startPolling(storedId, startTime);
      }
    } catch {
      // sessionStorage unavailable
    }
  }, [startPolling]);

  // Client-side validation matching backend expectations
  const validateForm = () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic || trimmedTopic.length < 3) {
      return 'body.topic: String should have at least 3 characters';
    }
    if (trimmedTopic.length > 80) {
      return 'body.topic: String should have at most 80 characters';
    }

    const trimmedAge = ageBand.trim();
    const agePattern = /^\d{1,2}-\d{1,2}$/;
    if (!trimmedAge || !agePattern.test(trimmedAge)) {
      return "body.age_band: String should match pattern '^\\d{1,2}-\\d{1,2}$'";
    }

    const trimmedInterest = interest.trim();
    if (!trimmedInterest || trimmedInterest.length < 2) {
      return 'body.interest: String should have at least 2 characters';
    }
    if (trimmedInterest.length > 40) {
      return 'body.interest: String should have at most 40 characters';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setErrorDetails(null);

    const errorMsg = validateForm();
    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }

    setStatus('submitting');

    try {
      const response = await api.post('/api/dev/video/test', {
        topic: topic.trim(),
        ageBand: ageBand.trim(),
        interest: interest.trim(),
      });

      const { created, status: initialStatus } = response.data || {};
      const jobStatus = created?.status || initialStatus?.status;
      const jobId = created?.job_id || initialStatus?.job_id;

      if (!jobId) {
        throw new Error('No job ID returned by server');
      }

      // If cached or already draft, play immediately
      if (jobStatus === 'draft' || created?.cached_from) {
        await loadAndPlayVideo(jobId);
        return;
      }

      // If queued, store in sessionStorage and poll every 5s
      if (jobStatus === 'queued' || jobStatus === 'rendering') {
        const now = Date.now();
        try {
          sessionStorage.setItem(JOB_ID_KEY, jobId);
          sessionStorage.setItem(LEGACY_JOB_ID_KEY, jobId);
          sessionStorage.setItem(JOB_START_KEY, now.toString());
        } catch {
          // ignore storage errors
        }
        setProgressStage(initialStatus?.stage || 'queued');
        startPolling(jobId, now);
        return;
      }

      // If status is failed
      if (jobStatus === 'failed') {
        setErrorDetails({
          category: initialStatus?.error?.category || 'API',
          code: initialStatus?.error?.code || 'GENERATION_FAILED',
          message: initialStatus?.error?.message,
        });
        setStatus('failed');
      }
    } catch (err) {
      const errPayload = err.response?.data?.error;
      setErrorDetails({
        category: errPayload?.category || 'API',
        code: errPayload?.code || 'API_UNREACHABLE',
        message: errPayload?.message || err.message,
      });
      setStatus('failed');
    }
  };

  const handleTryAgain = () => {
    clearTimers();
    clearStoredJob();
    setErrorDetails(null);
    setValidationError('');
    setStatus('idle');
  };

  const handleReset = () => {
    clearTimers();
    clearStoredJob();
    cleanupObjectUrl();
    setVideoUrl(null);
    setErrorDetails(null);
    setValidationError('');
    setStatus('idle');
  };

  const formatElapsed = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    if (mins > 0) {
      return `${mins}m ${remainingSecs}s`;
    }
    return `${remainingSecs}s`;
  };

  return (
    <section className={styles.container} aria-label="Local Video Lesson">
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Video className={styles.icon} size={20} aria-hidden="true" />
          <h2 className={styles.title}>Local Video Lesson</h2>
          <span className={styles.badge}>Experimental</span>
        </div>
        <p className={styles.subtitle}>
          Preview interactive Manim video animations generated on your local service.
        </p>
      </div>

      {/* IDLE & SUBMITTING STATE: Form */}
      {(status === 'idle' || status === 'submitting') && (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.fieldGrid}>
            <div className={styles.fieldGroup}>
              <label htmlFor="local-video-topic" className={styles.label}>
                Topic <span className={styles.required}>*</span>
              </label>
              <input
                id="local-video-topic"
                type="text"
                className={styles.input}
                placeholder="e.g. gravitational force"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setValidationError('');
                }}
                disabled={status === 'submitting'}
                autoComplete="off"
              />
              <span className={styles.hint}>3–80 characters</span>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="local-video-age" className={styles.label}>
                Age Band <span className={styles.required}>*</span>
              </label>
              <input
                id="local-video-age"
                type="text"
                className={styles.input}
                placeholder="14-16"
                value={ageBand}
                onChange={(e) => {
                  setAgeBand(e.target.value);
                  setValidationError('');
                }}
                disabled={status === 'submitting'}
                autoComplete="off"
              />
              <span className={styles.hint}>Format like 14-16</span>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="local-video-interest" className={styles.label}>
                Interest <span className={styles.required}>*</span>
              </label>
              <input
                id="local-video-interest"
                type="text"
                className={styles.input}
                placeholder="e.g. cars"
                value={interest}
                onChange={(e) => {
                  setInterest(e.target.value);
                  setValidationError('');
                }}
                disabled={status === 'submitting'}
                autoComplete="off"
              />
              <span className={styles.hint}>2–40 characters</span>
            </div>
          </div>

          {validationError && (
            <div className={styles.validationError} role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{validationError}</span>
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? (
                <>
                  <LoaderCircle className={styles.spinner} size={16} aria-hidden="true" />
                  <span>Requesting video...</span>
                </>
              ) : (
                <span>Get video</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* PREPARING STATE */}
      {status === 'preparing' && (
        <div className={styles.preparingBox} role="status" aria-live="polite">
          <LoaderCircle className={styles.largeSpinner} size={36} aria-hidden="true" />
          <div className={styles.preparingContent}>
            <h3 className={styles.preparingTitle}>Preparing your video</h3>
            <p className={styles.progressMessage}>
              Status: <strong>{progressStage}</strong>
            </p>
            <p className={styles.elapsedText}>
              Elapsed time: <span>{formatElapsed(elapsedSeconds)}</span>
            </p>
          </div>
        </div>
      )}

      {/* PLAYING STATE */}
      {status === 'playing' && videoUrl && (
        <div className={styles.videoWrapper}>
          <video
            controls
            playsInline
            preload="none"
            src={videoUrl}
            className={styles.videoPlayer}
          >
            Your browser does not support the video tag.
          </video>
          <div className={styles.videoFooter}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleReset}
            >
              <RefreshCw size={14} aria-hidden="true" />
              Generate another video
            </button>
          </div>
        </div>
      )}

      {/* FAILED STATE */}
      {status === 'failed' && (
        <div className={styles.failedBox} role="alert">
          <div className={styles.failedHeader}>
            <AlertCircle className={styles.failedIcon} size={22} aria-hidden="true" />
            <h3 className={styles.failedTitle}>Video Generation Failed</h3>
          </div>
          <p className={styles.errorCode}>
            {errorDetails?.category && errorDetails?.code
              ? `${errorDetails.category} ${errorDetails.code}`
              : errorDetails?.code || 'GENERATION ERROR'}
          </p>
          {errorDetails?.message && (
            <p className={styles.errorMessage}>{errorDetails.message}</p>
          )}
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleTryAgain}
          >
            Try again
          </button>
        </div>
      )}
    </section>
  );
}

export default LocalVideoLesson;
