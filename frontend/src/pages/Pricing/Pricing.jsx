import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import PricingCard from "../../components/PricingCard/PricingCard";
import { plans } from "../../data/plans";
import styles from "./Pricing.module.css";

export default function Pricing() {
  const navigate = useNavigate();
  const [cycle, setCycle] = useState("monthly");

  const handleSelect = (planId) => {
    if (planId === "free") {
      navigate("/dashboard");
      return;
    }
    navigate(`/checkout?plan=${planId}&cycle=${cycle}`);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Study smarter with the right plan</h1>
        <p>Start free, upgrade when you need more.</p>

        <div className={styles.toggle} role="group" aria-label="Billing cycle">
          <button
            type="button"
            className={cycle === "monthly" ? styles.active : ""}
            onClick={() => setCycle("monthly")}
          >
            Monthly
          </button>
          <button
            type="button"
            className={cycle === "yearly" ? styles.active : ""}
            onClick={() => setCycle("yearly")}
          >
            Yearly <span className={styles.save}>Save 30%</span>
          </button>
        </div>
      </header>

      <section className={styles.grid}>
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            cycle={cycle}
            onSelect={handleSelect}
            actionLabel={plan.id === "free" ? "Start free" : "Choose plan"}
          />
        ))}
      </section>

      <aside className={styles.studentNote}>
        <GraduationCap size={20} strokeWidth={1.5} />
        <div>
          <strong>Student discount</strong>
          <p>Student pricing requires verification with a valid student email or ID. Verification is coming soon.</p>
        </div>
      </aside>
    </main>
  );
}