import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, CircleAlert, CreditCard, Lock, LoaderCircle, ArrowLeft } from "lucide-react";
import { plans } from "../../data/plans";
import { processPayment } from "../../services/paymentService";
import styles from "./Checkout.module.css";

export default function Checkout() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const cycle = params.get("cycle") === "yearly" ? "yearly" : "monthly";
  const plan = plans.find((p) => p.id === params.get("plan")) ?? plans[1];
  const price = cycle === "yearly" ? plan.yearly : plan.monthly;

  const [form, setForm] = useState({ name: "", email: "", cardNumber: "", expiry: "", cvc: "" });
  const [status, setStatus] = useState("idle"); // idle | processing | success | failed
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");

  const canSubmit = useMemo(
    () => form.name && form.email && form.cardNumber && form.expiry && form.cvc,
    [form]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || status === "processing") return;

    setStatus("processing");
    setMessage("");

    const result = await processPayment({
      planId: plan.id,
      cycle,
      cardNumber: form.cardNumber,
    });

    if (result.status === "success") {
      setReference(result.reference);
      setStatus("success");
    } else {
      setMessage(result.message);
      setStatus("failed");
    }
  };

  if (status === "success") {
    return (
      <main className={styles.page}>
        <section className={styles.result}>
          <CheckCircle2 size={56} strokeWidth={1.5} className={styles.successIcon} />
          <h1>Payment successful</h1>
          <p>You're now on the {plan.name} plan ({cycle}).</p>
          <p className={styles.ref}>Reference: {reference}</p>
          <button type="button" className={styles.primary} onClick={() => navigate("/dashboard")}>
            Go to dashboard
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate("/pricing")}>
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back to pricing
      </button>

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2>Billing details</h2>

          <label>
            Full name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <h2>Payment method</h2>

          <label>
            Card number
            <div className={styles.inputWithIcon}>
              <CreditCard size={18} strokeWidth={1.5} />
              <input
                name="cardNumber"
                inputMode="numeric"
                placeholder="1234 1234 1234 1234"
                value={form.cardNumber}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          <div className={styles.row}>
            <label>
              Expiry
              <input name="expiry" placeholder="MM/YY" value={form.expiry} onChange={handleChange} required />
            </label>
            <label>
              CVC
              <input name="cvc" inputMode="numeric" placeholder="123" value={form.cvc} onChange={handleChange} required />
            </label>
          </div>

          {status === "failed" && (
            <p className={styles.error} role="alert">
              <CircleAlert size={16} strokeWidth={1.5} />
              {message}
            </p>
          )}

          <button type="submit" className={styles.primary} disabled={!canSubmit || status === "processing"}>
            {status === "processing" ? (
              <>
                <LoaderCircle size={18} className={styles.spin} />
                Processing...
              </>
            ) : (
              `Pay $${price.toFixed(2)}`
            )}
          </button>

          <p className={styles.secure}>
            <Lock size={14} strokeWidth={1.5} />
            Demo checkout. No real payment is processed.
          </p>
        </form>

        <aside className={styles.summary}>
          <h2>Order summary</h2>
          <div className={styles.line}>
            <span>{plan.name} plan</span>
            <span>{cycle === "yearly" ? "Yearly" : "Monthly"}</span>
          </div>
          <div className={styles.total}>
            <span>Total</span>
            <strong>${price.toFixed(2)}</strong>
          </div>
          <p className={styles.hint}>Test card for a declined payment: 4000 0000 0000 0002</p>
        </aside>
      </div>
    </main>
  );
}