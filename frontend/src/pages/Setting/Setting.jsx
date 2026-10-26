import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import * as settingsService from "../../services/settingsService";

import ProfileSection from "./components/ProfileSection/ProfileSection";
import PreferencesSection from "./components/PreferencesSection/PreferencesSection";
import SecuritySection from "./components/SecuritySection/SecuritySection";
import SubscriptionSection from "./components/SubscriptionSection/SubscriptionSection";
import DangerZone from "./components/DangerZone/DangerZone";
import styles from "./Setting.module.css";

const DEFAULT_PREFERENCES = {
  darkMode: false,
  notifications: true,
  language: "en-US",
};

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading, updateUser, logout } = useAuth();

  // Read straight from the user, so there's one source of truth.
  const preferences = user?.preferences ?? DEFAULT_PREFERENCES;

  // // Apply the theme whenever Dark Mode changes.
  // useEffect(() => {
  //   document.documentElement.dataset.theme = preferences.darkMode
  //     ? "dark"
  //     : "light";
  // }, [preferences.darkMode]);

  if (loading || !user) {
    return <div className={styles.page}>Loading...</div>;
  }

  // Profile
  const profile = {
    fullName: user.name,
    email: user.email,
    plan: user.plan === "pro" ? "PRO PLAN" : "FREE PLAN",
  };

  async function handleSaveProfile(form) {
    try {
      const { data } = await settingsService.updateMe({
        name: form.fullName,
      });
      updateUser(data.user);
    } catch (error) {
      window.alert(error.message || "Could not save your profile.");
    }
  }

  // Preferences
  async function handlePreferenceChange(key, value) {
    const previous = preferences;
    const next = { ...preferences, [key]: value };

    updateUser({ preferences: next }); // instant UI update
    try {
      const { data } = await settingsService.updateMe({
        preferences: { [key]: value },
      });
      updateUser(data.user);
    } catch (error) {
      updateUser({ preferences: previous }); // revert on failure
      window.alert(error.message || "Could not update your preference.");
    }
  }

  // Security (placeholder until 2FA and sessions exist)
  const security = {
    passwordUpdatedText: "Last updated 3 months ago (Strong 16-character cipher)",
    twoFactorEnabled: true,
    twoFactorDescription: "Biometric passkey and authenticator app enrolled",
    devicesDescription: "3 active sessions in London, UK & Tokyo, Japan",
  };

  //Subscription (placeholder until billing exists
  const subscription = {
    isActive: user.plan === "pro",
    name: "NoDucks Scholar Pro",
    description:
      "Empowering uninterrupted deep focus with next-generation algorithmic study assistance.",
    features: [
      { key: "aiCoaching", label: "Unlimited AI Coaching" },
      { key: "subjectStores", label: "Unlimited Subject Stores" },
      { key: "analytics", label: "Advanced Analytics" },
    ],
  };

  //Danger zone
  function handleLogOut() {
    logout();
    navigate("/");
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "This permanently deletes your account and all your data. Continue?",
    );
    if (!confirmed) return;

    try {
      await settingsService.deleteMe();
      logout();
      navigate("/");
    } catch (error) {
      window.alert(error.message || "Could not delete your account.");
    }
  }

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={14} />
        </button>
        <button
          type="button"
          className={styles.breadcrumbLink}
          onClick={() => navigate("/dashboard")}
        >
          Home
        </button>
        <span>›</span>
        <span className={styles.breadcrumbCurrent}>Settings</span>
      </nav>

      <div className={styles.sections}>
        <ProfileSection profile={profile} onSave={handleSaveProfile} />

        <PreferencesSection
          preferences={preferences}
          onPreferenceChange={handlePreferenceChange}
        />

        <SecuritySection
          security={security}
          onChangePassword={() => window.alert("Coming soon")}
          onManageTwoFactor={() => window.alert("Coming soon")}
          onManageDevices={() => window.alert("Coming soon")}
        />

        <SubscriptionSection
          subscription={subscription}
          onManage={() => window.alert("Coming soon")}
          onUpgrade={() => window.alert("Coming soon")}
          onChangeBilling={() => window.alert("Coming soon")}
        />

        <DangerZone
          onLogOut={handleLogOut}
          onDeleteAccount={handleDeleteAccount}
        />
      </div>
    </div>
  );
}