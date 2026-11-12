import { useState, useRef, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./AuthForm.module.css";
import {
  signUp,
  signIn,
  verifyOtp,
  resendOtp,
  requestForgotPassword,
  resetPasswordWithOtp,
} from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import UserAgreementModal from "../UserAgreementModal/UserAgreementModal";

// Views:
// - "signup"
// - "signin"
// - "verify_otp" (after sign up or if login detects unverified account)
// - "forgot_password" (enter email to receive reset code)
// - "reset_password" (enter OTP + new password)

export default function AuthForm({ mode, onClose, onSwitch }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState(mode || "signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // User input credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP State (array of 6 strings for 6 input boxes)
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef([]);

  // Forgot password new credentials
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    if (mode === "signup" || mode === "signin") {
      setCurrentView(mode);
    }
  }

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Helper for OTP input boxes
  const handleOtpChange = (index, value) => {
    const char = value.replace(/[^0-9]/g, "").slice(-1);
    const updated = [...otpValues];
    updated[index] = char;
    setOtpValues(updated);

    // Auto advance focus to next box
    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = [...otpValues];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || "";
    }
    setOtpValues(updated);
    const nextFocus = Math.min(pasted.length, 5);
    otpInputRefs.current[nextFocus]?.focus();
  };

  // 1. Sign Up Handler
  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await signUp({ name, email, password });
      setMessage(data.message || "Verification code sent to your email.");
      setResendCooldown(60);
      setOtpValues(["", "", "", "", "", ""]);
      setCurrentView("verify_otp");
    } catch (err) {
      setError(err.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Sign In Handler
  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await signIn({ email, password });
      login(data);
      setMessage("Signed in successfully.");
      onClose?.();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      // If server returned that account needs verification
      if (err.message?.toLowerCase().includes("verify your email")) {
        setError("Please verify your email address. We sent a 6-digit code.");
        setResendCooldown(60);
        setCurrentView("verify_otp");
      } else {
        setError(err.message || "Unable to sign in.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify OTP Handler (Email Verification)
  const handleVerifyOtp = async () => {
    const otp = otpValues.join("");
    if (otp.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await verifyOtp({ email, otp });
      if (data.token) {
        login(data);
      }
      setMessage("Email verified successfully!");
      setTimeout(() => {
        onClose?.();
        navigate("/dashboard", { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Resend OTP Handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await resendOtp(email);
      setMessage(data.message || "A new verification code was sent to your email.");
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  // 5. Forgot Password Request Handler
  const handleForgotPasswordSubmit = async () => {
    if (!email) {
      setError("Please enter your account email address.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await requestForgotPassword(email);
      setMessage(data.message || "A 6-digit reset code has been sent to your email.");
      setResendCooldown(60);
      setOtpValues(["", "", "", "", "", ""]);
      setCurrentView("reset_password");
    } catch (err) {
      setError(err.message || "Failed to request password reset.");
    } finally {
      setLoading(false);
    }
  };

  // 6. Reset Password Handler (OTP + New Password)
  const handleResetPasswordSubmit = async () => {
    const otp = otpValues.join("");
    if (otp.length < 6) {
      setError("Please enter the full 6-digit reset code.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await resetPasswordWithOtp({
        email,
        otp,
        newPassword,
      });

      setMessage(data.message || "Password updated successfully. Please sign in.");
      setTimeout(() => {
        setPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setCurrentView("signin");
      }, 1500);
    } catch (err) {
      setError(err.message || "Invalid or expired reset code.");
    } finally {
      setLoading(false);
    }
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

        {/* Back navigation button for secondary views */}
        {(currentView === "forgot_password" ||
          currentView === "verify_otp" ||
          currentView === "reset_password") && (
          <button
            type="button"
            className={styles.authBackBtn}
            onClick={() => {
              setError("");
              setMessage("");
              setCurrentView("signin");
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </button>
        )}

        {/* Header Section */}
        <div className={styles.authHeader}>
          <div className={styles.authEyebrow}>
            {currentView === "signup"
              ? "Create your account"
              : currentView === "verify_otp"
              ? "Verification Required"
              : currentView === "forgot_password"
              ? "Account Recovery"
              : currentView === "reset_password"
              ? "Choose New Password"
              : "Welcome back"}
          </div>

          <h2 id="auth-title">
            {currentView === "signup"
              ? "Create your Free NoDucks Account"
              : currentView === "verify_otp"
              ? "Enter Verification Code"
              : currentView === "forgot_password"
              ? "Reset your password"
              : currentView === "reset_password"
              ? "Set a new password"
              : "Welcome back."}
          </h2>

          <p>
            {currentView === "signup"
              ? "Build your learning workspace and start turning knowledge into practice."
              : currentView === "verify_otp"
              ? `We sent a 6-digit verification code to ${email || "your email"}.`
              : currentView === "forgot_password"
              ? "Enter your email address and we'll send a 6-digit code to reset your password."
              : currentView === "reset_password"
              ? "Enter the code sent to your email and your new password."
              : "Sign in to continue building your learning journey."}
          </p>
        </div>

        {/* ----------------- VIEW 1: SIGN UP & SIGN IN ----------------- */}
        {(currentView === "signup" || currentView === "signin") && (
          <form
            className={styles.authForm}
            onSubmit={(event) => {
              event.preventDefault();
              if (currentView === "signup") {
                handleSignUp();
              } else {
                handleSignIn();
              }
            }}
          >
            {currentView === "signup" && (
              <div className={styles.authField}>
                <label htmlFor="auth-name">Full name</label>
                <div className={styles.authInputWrapper}>
                  <User size={18} strokeWidth={1.8} />
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    required
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete={currentView === "signup" ? "new-password" : "current-password"}
                  required
                />
                <button
                  type="button"
                  className={styles.authPasswordToggle}
                  onClick={() => setShowPassword((prev) => !prev)}
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

            {currentView === "signup" && (
              <div className={styles.authField}>
                <label htmlFor="auth-confirm-password">Confirm password</label>
                <div className={styles.authInputWrapper}>
                  <Lock size={18} strokeWidth={1.8} />
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className={styles.authPasswordToggle}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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

            {currentView === "signin" && (
              <div className={styles.authUtility}>
                <button
                  type="button"
                  className={styles.authForgot}
                  onClick={() => {
                    setError("");
                    setMessage("");
                    setCurrentView("forgot_password");
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && <p className={styles.authError}>{error}</p>}
            {message && <p className={styles.authMessage}>{message}</p>}

            {currentView === "signup" && (
              <label className={styles.authCheckbox}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <span>
                  I agree to the NoDucks terms and{" "}
                  <button
                    type="button"
                    className={styles.authTermsLink}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPrivacy(true);
                    }}
                  >
                    privacy policy
                  </button>
                </span>
              </label>
            )}

            {(currentView !== "signup" || agreedToTerms) && (
              <button
                type="submit"
                className={styles.authSubmit}
                disabled={loading || (currentView === "signup" && !agreedToTerms)}
              >
                <span>
                  {loading
                    ? currentView === "signup"
                      ? "Creating Account..."
                      : "Signing In..."
                    : currentView === "signup"
                    ? "Create Account"
                    : "Sign In"}
                </span>
                {!loading && <ArrowRight size={17} strokeWidth={1.8} />}
              </button>
            )}
          </form>
        )}

        {/* ----------------- VIEW 2: VERIFY OTP ----------------- */}
        {currentView === "verify_otp" && (
          <form
            className={styles.authForm}
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyOtp();
            }}
          >
            <div className={styles.authField}>
              <label>6-Digit Verification Code</label>
              <div className={styles.authOtpGroup} onPaste={handleOtpPaste}>
                {otpValues.map((val, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={styles.authOtpInput}
                    value={val}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
            </div>

            {error && <p className={styles.authError}>{error}</p>}
            {message && <p className={styles.authMessage}>{message}</p>}

            <button type="submit" className={styles.authSubmit} disabled={loading}>
              <span>{loading ? "Verifying..." : "Verify & Continue"}</span>
              {!loading && <CheckCircle2 size={17} strokeWidth={1.8} />}
            </button>

            <p className={styles.authResendText}>
              Didn't receive the code?
              <button
                type="button"
                className={styles.authResendBtn}
                disabled={loading || resendCooldown > 0}
                onClick={handleResendOtp}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </button>
            </p>
          </form>
        )}

        {/* ----------------- VIEW 3: FORGOT PASSWORD (EMAIL) ----------------- */}
        {currentView === "forgot_password" && (
          <form
            className={styles.authForm}
            onSubmit={(e) => {
              e.preventDefault();
              handleForgotPasswordSubmit();
            }}
          >
            <div className={styles.authField}>
              <label htmlFor="forgot-email">Account Email</label>
              <div className={styles.authInputWrapper}>
                <Mail size={18} strokeWidth={1.8} />
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && <p className={styles.authError}>{error}</p>}
            {message && <p className={styles.authMessage}>{message}</p>}

            <button type="submit" className={styles.authSubmit} disabled={loading}>
              <span>{loading ? "Sending Code..." : "Send Reset Code"}</span>
              {!loading && <KeyRound size={17} strokeWidth={1.8} />}
            </button>
          </form>
        )}

        {/* ----------------- VIEW 4: RESET PASSWORD (OTP + NEW PASS) ----------------- */}
        {currentView === "reset_password" && (
          <form
            className={styles.authForm}
            onSubmit={(e) => {
              e.preventDefault();
              handleResetPasswordSubmit();
            }}
          >
            <div className={styles.authField}>
              <label>6-Digit Reset Code</label>
              <div className={styles.authOtpGroup} onPaste={handleOtpPaste}>
                {otpValues.map((val, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={styles.authOtpInput}
                    value={val}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
            </div>

            <div className={styles.authField}>
              <label htmlFor="reset-new-password">New Password</label>
              <div className={styles.authInputWrapper}>
                <Lock size={18} strokeWidth={1.8} />
                <input
                  id="reset-new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className={styles.authPasswordToggle}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff size={17} strokeWidth={1.8} />
                  ) : (
                    <Eye size={17} strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>

            <div className={styles.authField}>
              <label htmlFor="reset-confirm-password">Confirm New Password</label>
              <div className={styles.authInputWrapper}>
                <Lock size={18} strokeWidth={1.8} />
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className={styles.authPasswordToggle}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} strokeWidth={1.8} />
                  ) : (
                    <Eye size={17} strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>

            {error && <p className={styles.authError}>{error}</p>}
            {message && <p className={styles.authMessage}>{message}</p>}

            <button type="submit" className={styles.authSubmit} disabled={loading}>
              <span>{loading ? "Resetting Password..." : "Reset Password"}</span>
              {!loading && <ArrowRight size={17} strokeWidth={1.8} />}
            </button>

            <p className={styles.authResendText}>
              Didn't receive the code?
              <button
                type="button"
                className={styles.authResendBtn}
                disabled={loading || resendCooldown > 0}
                onClick={handleForgotPasswordSubmit}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </button>
            </p>
          </form>
        )}

        {/* Footer switch between signin and signup */}
        {(currentView === "signup" || currentView === "signin") && (
          <div className={styles.authSwitch}>
            <span>
              {currentView === "signup"
                ? "Already have an account?"
                : "Don't have an account?"}
            </span>
            <button
              type="button"
              onClick={() => {
                setError("");
                setMessage("");
                const next = currentView === "signup" ? "signin" : "signup";
                setCurrentView(next);
                onSwitch?.(next);
              }}
            >
              {currentView === "signup" ? "Sign In" : "Create one"}
            </button>
          </div>
        )}

        {showPrivacy && (
          <UserAgreementModal onClose={() => setShowPrivacy(false)} />
        )}
      </div>
    </div>
  );
}
