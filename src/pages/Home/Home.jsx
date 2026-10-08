import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import styles from "./Home.module.css";
import AuthModal from "../../components/AuthModal/AuthModal";

function getInitialTheme() {
  try {
    return localStorage.getItem("theme") || "dark";
  } catch {
    return "dark";
  }
}

export default function Home() {
  const [theme, setTheme] = useState(getInitialTheme);

  const [authMode, setAuthMode] = useState(null);

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

        {/* hero */}
        <div className={styles.heroVisual}>
          <div className={styles.visualCard}>
            <div className={styles.visualHeader}>
              <span>Learning Progress</span>
              <span>01</span>
            </div>

            <div className={styles.visualShape}>
              <div className={styles.shapeCircle} />
              <div className={styles.shapeLine} />
              <div className={styles.shapeLineSmall} />
            </div>

            <div className={styles.visualFooter}>
              <span>Understand</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </header>

      {/* feature */}
      <section className={styles.section} id="features">
        <p className={styles.sectionLabel}>Why NoDucks</p>

        <h2>Learning should lead somewhere.</h2>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <span>01</span>
            <h3>Plan</h3>
            <p>
              Organize what you need to learn and turn your goals into clear
              tasks.
            </p>
          </div>

          <div className={styles.featureCard}>
            <span>02</span>
            <h3>Practice</h3>
            <p>
              Turn understanding into practical exercises and real
              problem-solving.
            </p>
          </div>

          <div className={styles.featureCard}>
            <span>03</span>
            <h3>Improve</h3>
            <p>
              Use feedback and progress to understand what works and keep
              getting better.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.workflow} id="workflow">
        <p className={styles.sectionLabel}>The NoDucks Loop</p>

        <h2>Learn with a purpose.</h2>

        <div className={styles.workflowLine}>
          <span>01. Plan</span>
          <span>→</span>
          <span>02. Learn</span>
          <span>→</span>
          <span>03. Practice</span>
          <span>→</span>
          <span>04. Apply</span>
          <span>→</span>
          <span>05. Improve</span>
        </div>
      </section>

      {/* ABOUT */}
      <section className={styles.about} id="about">
        <div>
          <p className={styles.sectionLabel}>About NoDucks</p>

          <h2>Not another place to collect lessons.</h2>
        </div>

        <p>
          NoDucks is designed around practical learning. The goal is simple:
          understand something, practice it, apply it, receive feedback, and
          improve.
        </p>
      </section>

      {/* FINAL CTA */}
      <section className={styles.finalCta}>
        <h2>Ready to start learning?</h2>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => setAuthMode("signup")}
        >
          Get Started
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

      {authMode && (
        <AuthModal
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
