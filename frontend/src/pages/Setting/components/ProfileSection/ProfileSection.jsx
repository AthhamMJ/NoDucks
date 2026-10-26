import { useState } from "react";
import { AtSign, Check, Lock, Mail, User } from "lucide-react";
import SettingsCard from "../SettingsCard/SettingsCard";
import styles from "./ProfileSection.module.css";

function getInitials(name) {
  if (!name || typeof name !== "String") return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function ProfileSection({ profile, onSave }) {
  const [form, setForm] = useState({
    fullName: profile.fullName,
  });
  const [isSaving, setIsSaving] = useState(false);

  const isChanged = form.fullName !== profile.fullName;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave?.(form);
    } finally {
      setIsSaving(false);
    }
  }

  const footer = (
    <button
      type="button"
      className={styles.saveButton}
      onClick={handleSave}
      disabled={!isChanged || isSaving}
    >
      {isSaving ? "Saving..." : "Save Changes"}
      {!isSaving && <Check size={14} />}
    </button>
  );

  return (
    <SettingsCard
      title="Profile Information"
      description="Update your personal details, academic identity, and avatar visibility."
      footer={footer}
    >
      <div className={styles.profileTop}>
        <div className={styles.avatarColumn}>
          <div className={styles.avatar}>{getInitials(form.fullName)}</div>
          <button type="button" className={styles.changePhoto}>
            Change Photo
          </button>
          <span className={styles.photoHint}>JPG, PNG up to 5MB</span>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="fullName">
              Full Name
            </label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={16} />
              <input
                id="fullName"
                name="fullName"
                className={`${styles.input} ${styles.withIcon}`}
                value={form.fullName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label className={styles.label} htmlFor="academicEmail">
              Academic Email
            </label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={16} />
              <input
                id="academicEmail"
                name="academicEmail"
                className={`${styles.input} ${styles.withIcon}`}
                value={profile.email}
                disabled
              />
              <span className={styles.inputTag}>
                <Lock size={12} />
                Private
              </span>
            </div>
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <div className={styles.tierBox}>
              <div className={styles.tierInfo}>
                <span className={styles.tierName}>Active Enrollment Tier</span>
                <span className={styles.tierDescription}>
                  Scholarship-based academic account
                </span>
              </div>
              <span className={styles.planBadge}>{profile.plan}</span>
            </div>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
