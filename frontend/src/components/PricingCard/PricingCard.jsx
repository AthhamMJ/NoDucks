import { Check } from "lucide-react";
import styles from "./PricingCard.module.css";

export default function PricingCard({ plan, cycle, onSelect, actionLabel = "Choose plan" }) {
  const price = cycle === "yearly" ? plan.yearly : plan.monthly;
  const suffix = price === 0 ? "" : cycle === "yearly" ? "/yr" : "/mo";

  return (
    <article className={`${styles.card} ${plan.highlighted ? styles.highlighted : ""}`}>
      {plan.highlighted && <span className={styles.tag}>Most popular</span>}

      <h3 className={styles.name}>{plan.name}</h3>
      <p className={styles.description}>{plan.description}</p>

      <p className={styles.price}>
        <strong>${price.toFixed(2)}</strong>
        <span>{suffix}</span>
      </p>

      <button
        type="button"
        className={plan.highlighted ? styles.primary : styles.secondary}
        onClick={() => onSelect(plan.id)}
      >
        {actionLabel}
      </button>

      <ul className={styles.features}>
        {plan.features.map((feature) => (
          <li key={feature}>
            <Check size={16} strokeWidth={2} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}