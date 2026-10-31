import { KeyRound, MonitorSmartphone, ShieldCheck } from "lucide-react";
import SettingsCard from "../SettingsCard/SettingsCard";
import SettingsRow from "../SettingsRow/SettingsRow";
import styles from "./SecuritySection.module.css";

export default function SecuritySection({
  security,
  onChangePassword,
  onManageTwoFactor,
  onManageDevices,
}) {
  return (
    <SettingsCard
      title="Account & Security"
      description="Keep your study logs, summaries, and authentication credentials protected."
    >
      <SettingsRow
        icon={KeyRound}
        title="Change Password"
        description={security.passwordUpdatedText}
        onClick={onChangePassword}
        showChevron
      />

      <SettingsRow
        icon={ShieldCheck}
        title="Two-Factor Authentication (2FA)"
        description={security.twoFactorDescription}
        control={
          security.twoFactorEnabled ? (
            <span className={`${styles.pill} ${styles.pillEnabled}`}>
              Enabled
            </span>
          ) : null
        }
        onClick={onManageTwoFactor}
        showChevron
      />

      <SettingsRow
        icon={MonitorSmartphone}
        title="Connected Devices"
        description={security.devicesDescription}
        onClick={onManageDevices}
        showChevron
      />
    </SettingsCard>
  );
}