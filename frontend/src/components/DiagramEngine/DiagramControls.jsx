import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Maximize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import styles from './DiagramControls.module.css';

export const DiagramControls = ({
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  onPlayToggle,
  onPrev,
  onNext,
  onRestart,
  onSpeedChange,
  onFitView,
  // Voice Narration Props
  isNarrationSupported,
  isNarrationEnabled,
  onToggleNarration,
  voices = [],
  selectedVoice,
  onSelectVoice,
}) => {
  const speeds = [0.5, 1, 1.5, 2];
  const progressPercent =
    totalSteps > 0 ? Math.round(((currentStep + 1) / totalSteps) * 100) : 0;

  return (
    <div className={styles.container} role="region" aria-label="Diagram playback controls">
      <div className={styles.primaryControls}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onRestart}
          title="Restart animation"
          aria-label="Restart"
        >
          <RotateCcw size={15} />
        </button>

        <button
          type="button"
          className={styles.iconBtn}
          onClick={onPrev}
          disabled={currentStep <= 0}
          title="Previous step"
          aria-label="Previous step"
        >
          <SkipBack size={15} />
        </button>

        <button
          type="button"
          className={`${styles.playBtn} ${isPlaying ? styles.playActive : ''}`}
          onClick={onPlayToggle}
          title={isPlaying ? 'Pause animation' : 'Play animation'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <button
          type="button"
          className={styles.iconBtn}
          onClick={onNext}
          disabled={currentStep >= totalSteps - 1}
          title="Next step"
          aria-label="Next step"
        >
          <SkipForward size={15} />
        </button>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* Step counter and progress bar */}
      <div className={styles.progressArea}>
        <div className={styles.stepCounter}>
          <span>Step</span>
          <strong>
            {totalSteps > 0 ? currentStep + 1 : 0} / {totalSteps}
          </strong>
        </div>
        <div className={styles.track}>
          <div
            className={styles.fill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      {/* Speed switcher */}
      <div className={styles.speedSelector}>
        {speeds.map((s) => (
          <button
            key={s}
            type="button"
            className={`${styles.speedBtn} ${speed === s ? styles.speedActive : ''}`}
            onClick={() => onSpeedChange(s)}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Voice Narration Audio Toggle */}
      {isNarrationSupported && (
        <>
          <div className={styles.divider} aria-hidden="true" />
          <div className={styles.narrationControls}>
            <button
              type="button"
              className={`${styles.iconBtn} ${isNarrationEnabled ? styles.voiceActive : ''}`}
              onClick={onToggleNarration}
              title={isNarrationEnabled ? 'Mute voice narration' : 'Enable voice narration'}
              aria-label={isNarrationEnabled ? 'Mute voice narration' : 'Enable voice narration'}
              aria-pressed={isNarrationEnabled}
            >
              {isNarrationEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {isNarrationEnabled && voices.length > 1 && (
              <select
                className={styles.voiceSelect}
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const v = voices.find((item) => item.name === e.target.value);
                  if (v && onSelectVoice) onSelectVoice(v);
                }}
                aria-label="Select voice"
                title="Select narration voice"
              >
                {voices.slice(0, 8).map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name.replace(/Google|Microsoft|Desktop|Natural/g, '').trim().slice(0, 15)}
                  </option>
                ))}
              </select>
            )}
          </div>
        </>
      )}

      {onFitView && (
        <>
          <div className={styles.divider} aria-hidden="true" />
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onFitView}
            title="Fit to view"
            aria-label="Fit to view"
          >
            <Maximize2 size={15} />
          </button>
        </>
      )}
    </div>
  );
};
