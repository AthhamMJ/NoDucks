import { Bell, Languages, Moon } from "lucide-react";
import SettingsCard from "../SettingsCard/SettingsCard";
import SettingsRow from "../SettingsRow/SettingsRow";
import styles from "./PreferencesSection.module.css";

const LANGUAGES = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "si", label: "Sinhala" },
  { value: "ta", label: "Tamil" },
];

export default function PreferencesSection({ preferences, onPreferenceChange }) {
  return (
    <SettingsCard
      title="App Preferences"
      description="Customize your interface, focus rituals, and notifications."
    >
      <SettingsRow
        icon={Moon}
        title="Dark Mode"
        description="Adjust appearance to reduce eye strain during midnight study sessions."
        control={
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={preferences.darkMode}
            onChange={(e) => onPreferenceChange("darkMode", e.target.checked)}
            aria-label="Dark Mode"
          />
        }
      />

      <SettingsRow
        icon={Bell}
        title="Notifications"
        description="Receive push alerts for study deadlines and active persistent learning."
        control={
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={preferences.notifications}
            onChange={(e) =>
              onPreferenceChange("notifications", e.target.checked)
            }
            aria-label="Notifications"
          />
        }
      />

      <SettingsRow
        icon={Languages}
        title="Language & Locale"
        description="Select your preferred primary language for coaching dialogues."
        control={
          <select
            className={styles.select}
            value={preferences.language}
            onChange={(e) => onPreferenceChange("language", e.target.value)}
            aria-label="Language"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        }
      />
    </SettingsCard>
  );
}