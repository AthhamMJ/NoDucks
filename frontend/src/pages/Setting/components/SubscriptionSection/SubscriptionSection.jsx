import { BarChart3, BrainCircuit, Layers, CreditCard } from "lucide-react";
import SettingsCard from "../SettingsCard/SettingsCard";
import styles from "./SubscriptionSection.module.css";

const FEATURE_ICONS = {
  aiCoaching: BrainCircuit,
  subjectStores: Layers,
  analytics: BarChart3,
};

export default function SubscriptionSection({
  subscription,
  onManage,
  onUpgrade,
  onChangeBilling,
}) {
  return (
    <SettingsCard title="Subscription">
      <div className={styles.plan}>
        <div className={styles.planTop}>
          <span className={styles.activeBadge}>
            {subscription.isActive ? "Active Plan" : "Free Plan"}
          </span>
        </div>

        <h3 className={styles.planName}>{subscription.name}</h3>
        <p className={styles.planDescription}>{subscription.description}</p>

        <ul className={styles.features}>
          {subscription.features.map((feature) => {
            const Icon = FEATURE_ICONS[feature.key];
            return (
              <li key={feature.key} className={styles.feature}>
                {Icon && <Icon size={14} />}
                {feature.label}
              </li>
            );
          })}
        </ul>

        <div className={styles.actions}>
          <button type="button" className={styles.manageButton} onClick={onManage}>
            <CreditCard size={14} />
            Manage Subscription
          </button>

          <div className={styles.upgradeLinks}>
            <button type="button" className={styles.upgradeLink} onClick={onUpgrade}>
              Upgrade to Lifetime
            </button>
            <span>·</span>
            <button type="button" className={styles.upgradeLink} onClick={onChangeBilling}>
              Change Billing
            </button>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}