import { useState } from "react";
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import styles from "./AuthModal.module.css";
import { supabase } from "../../lib/supabase";

export default function AuthModal({ mode, onClose, onSwitch }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isSignUp = mode === "signup";

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Account created. Check your email to verify your account.");
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Signed in successfully.");
  };

  return (
    <div className={styles.authOverlay} onMouseDown={onClose}>
      <div
        className={styles.authModal}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button
          className={styles.authClose}
          onClick={onClose}
          aria-label="Close authentication window"
        >
          <X size={19} strokeWidth={1.8} />
        </button>

        <div className={styles.authHeader}>
          <div className={styles.authEyebrow}>
            {isSignUp ? "Create your account" : "Welcome back"}
          </div>

          <h2 id="auth-title">
            {isSignUp ? "Start learning with NoDucks." : "Welcome back."}
          </h2>

          <p>
            {isSignUp
              ? "Build your learning workspace and start turning knowledge into practice."
              : "Sign in to continue building your learning journey."}
          </p>
        </div>

        <form
          className={styles.authForm}
          onSubmit={(event) => {
            event.preventDefault();

            if (isSignUp) {
              handleSignUp();
            } else {
              handleSignIn();
            }
          }}
        >
          {isSignUp && (
            <div className={styles.authField}>
              <label htmlFor="auth-name">Full name</label>

              <div className={styles.authInputWrapper}>
                <User size={18} strokeWidth={1.8} />

                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                  }}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className={styles.authField}>
            <label htmlFor="auth-email">Email</label>

            <div className={styles.authInputWrapper}>
              <Mail size={18} strokeWidth={1.8} />

              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.authField}>
            <label htmlFor="auth-password">Password</label>

            <div className={styles.authInputWrapper}>
              <Lock size={18} strokeWidth={1.8} />

              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
                placeholder="Enter your password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />

              <button
                type="button"
                className={styles.authPasswordToggle}
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={17} strokeWidth={1.8} />
                ) : (
                  <Eye size={17} strokeWidth={1.8} />
                )}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className={styles.authField}>
              <label htmlFor="auth-confirm-password">Confirm password</label>

              <div className={styles.authInputWrapper}>
                <Lock size={18} strokeWidth={1.8} />

                <input
                  id="auth-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                  }}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className={styles.authPasswordToggle}
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} strokeWidth={1.8} />
                  ) : (
                    <Eye size={17} strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>
          )}

          {!isSignUp && (
            <div className={styles.authUtility}>
              <button type="button" className={styles.authForgot}>
                Forgot password?
              </button>
            </div>
          )}
          {error && <p className={styles.authError}>{error}</p>}

          {message && <p className={styles.authMessage}>{message}</p>}

          <button
            type="submit"
            className={styles.authSubmit}
            disabled={loading}
          >
            <span>
              {loading
                ? isSignUp
                  ? "Creating Account..."
                  : "Signing In..."
                : isSignUp
                  ? "Create Account"
                  : "Sign In"}
            </span>

            {!loading && <ArrowRight size={17} strokeWidth={1.8} />}
          </button>
        </form>

        <div className={styles.authSwitch}>
          <span>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </span>

          <button type="button" onClick={onSwitch}>
            {isSignUp ? "Sign In" : "Create one"}
          </button>
        </div>

        {isSignUp && (
          <p className={styles.authTerms}>
            By creating an account, you agree to the NoDucks terms and privacy
            policy.
          </p>
        )}
      </div>
    </div>
  );
}
