import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import styles from "./Home.module.css";
import AuthForm from "../../components/AuthForm/AuthForm";
import { Animation, Cradle } from "./Animation/Animation";
import PricingCard from "../../components/PricingCard/PricingCard";
import { plans } from "../../data/plans";

function getInitialTheme() {
  try {
    return localStorage.getItem("theme") || "dark";
  } catch {
    return "dark";
  }
}

export default function Home() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(getInitialTheme);
  const [authMode, setAuthMode] = useState(null);
  const [cycle, setCycle] = useState("monthly");

  // const handleSelect = (planId) => {
  //   if (planId === "free") {
  //     navigate("/dashboard");
  //     return;
  //   }
  //   navigate(`/checkout?plan=${planId}&cycle=${cycle}`);
  // };

  // Dark is the default. The attribute lives on <html>.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* mogged:( */
    }
  }, [theme]);

  const toggleTheme = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));

  return (
    <div className={styles.home}>
      {/* navigation bar s */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>NoDucks</div>

        <div className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#workflow">How It Works</a>
          <a href="#about">About</a>
          <a href="#pricing">Pricing</a>
        </div>

        <div className={styles.navActions}>
          <button
            className={styles.themeButton}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? (
              <Sun size={18} strokeWidth={1.8} />
            ) : (
              <Moon size={18} strokeWidth={1.8} />
            )}
          </button>

          <button
            type="button"
            className={styles.signIn}
            onClick={() => setAuthMode("signin")}
          >
            Sign In
          </button>

          <button
            type="button"
            className={styles.signUp}
            onClick={() => setAuthMode("signup")}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* hero top */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>A better way to learn</p>

          <h1>
            Learn smarter.
            <span>Build knowledge.</span>
          </h1>

          <p className={styles.heroText}>
            NoDucks helps students turn what they learn into knowledge they can
            actually understand, practice, and apply in real-world problems.
          </p>

          <div className={styles.heroActions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => setAuthMode("signup")}
            >
              Start Learning
            </button>

            <a href="#docs" className={styles.secondaryButton}>
              Explore NoDucks
            </a>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.heroBox}>
            <div>
              <Animation />
            </div>
          </div>
        </div>
      </header>

      {/* feature */}
      <section className={styles.section} id="features">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionLabel}>Why NoDucks</p>
            <h2>Learning should lead somewhere.</h2>
          </div>
          <p className={styles.sectionHeaderSub}>
            Most platforms leave you with passive notes. NoDucks creates an
            active loop that drives real comprehension and skill mastery.
          </p>
        </div>

        {/* Split Showcase: Animation on one side, interactive hook on the other */}
        <div className={styles.featureShowcase}>
          <div className={styles.cradleWrapper}>
            <Cradle />
          </div>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <span className={styles.featureNumber}>01</span>
              <h3>Plan</h3>
              <p>
                Organize what you need to learn and turn your goals into clear
                tasks.
              </p>
            </div>

            <div className={styles.featureCard}>
              <span className={styles.featureNumber}>02</span>
              <h3>Practice</h3>
              <p>
                Turn understanding into practical exercises and real
                problem-solving.
              </p>
            </div>

            <div className={styles.featureCard}>
              <span className={styles.featureNumber}>03</span>
              <h3>Improve</h3>
              <p>
                Use feedback and progress to understand what works and keep
                getting better.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.workflow} id="workflow">
        <p className={styles.sectionLabel}>The NoDucks Loop</p>

        <h2>Learn with a purpose.</h2>

        <div className={styles.workflowGrid}>
          <div className={styles.workflowCard}>
            <span className={styles.stepBadge}>Step 1</span>
            <h4>Set Your Trajectory</h4>
            <p>
              Map your learning pathway by defining target topics, projects, or
              skill benchmarks.
            </p>
          </div>
          <div className={styles.workflowCard}>
            <span className={styles.stepBadge}>Step 2</span>
            <h4>Active Assimilation</h4>
            <p>
              Digest focused core concepts using dynamic visuals and structured
              notes.
            </p>
          </div>
          <div className={styles.workflowCard}>
            <span className={styles.stepBadge}>Step 3</span>
            <h4>Targeted Practice</h4>
            <p>
              Put theory into action using customized challenges and real-world
              prompt scenarios.
            </p>
          </div>
          <div className={styles.workflowCard}>
            <span className={styles.stepBadge}>Step 4</span>
            <h4>Feedback & Refine</h4>
            <p>
              Review analytics and actionable insights to lock in retention for
              long-term growth.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className={styles.pricing} id="pricing">
        <div className={styles.pricingHeader}>
          <h2>Simple pricing</h2>
          <p>Start free, upgrade when you need more.</p>

          <div
            className={styles.cycleToggle}
            role="group"
            aria-label="Billing cycle"
          >
            <button
              type="button"
              className={cycle === "monthly" ? styles.cycleActive : ""}
              onClick={() => setCycle("monthly")}
            >
              Monthly
            </button>
            <button
              type="button"
              className={cycle === "yearly" ? styles.cycleActive : ""}
              onClick={() => setCycle("yearly")}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className={styles.pricingGrid}>
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              cycle={cycle}
              // onSelect={handleSelect}
              actionLabel={plan.id === "free" ? "Start free" : "Choose plan"}
            />
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className={styles.about} id="about">
        <div className={styles.aboutLeft}>
          <p className={styles.sectionLabel}>About NoDucks</p>
          <h2>Not another place to collect unread lessons.</h2>
          <p className={styles.aboutSubhead}>
            Most tools hoard information. NoDucks builds operational mastery.
          </p>
        </div>

        <div className={styles.aboutRight}>
          <p>
            NoDucks was built on a simple premise: passive reading doesn't equal
            true skill acquisition. Our platform bridges the gap between
            understanding a concept and applying it under real-world conditions.
          </p>
          <div className={styles.statGroup}>
            <div className={styles.statItem}>
              <strong>3x</strong>
              <span>Faster Skill Retention</span>
            </div>
            <div className={styles.statItem}>
              <strong>100%</strong>
              <span>Practical Application</span>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={styles.finalCta}>
        <p className={styles.sectionLabel}>Get Started Today</p>
        <h2>Ready to transform how you learn?</h2>
        <p className={styles.finalCtaSubtext}>
          Join thousands of students and builders mastering skills with NoDucks.
          No credit card required.
        </p>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => setAuthMode("signup")}
        >
          Get Started Free
        </button>
      </section>

      {/* dooter side*/}
      <footer className={styles.footer}>
        <div>NoDucks</div>

        <div className={styles.footerLinks}>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#github">GitHub</a>
        </div>

        <span>© 2026 NoDucks. All rights reserved.</span>
      </footer>

      {/*passing the auth mode as a prop*/}
      {authMode && (
        <AuthForm
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitch={() =>
            setAuthMode((current) =>
              current === "signin" ? "signup" : "signin",
            )
          }
        />
      )}
    </div>
  );
}
