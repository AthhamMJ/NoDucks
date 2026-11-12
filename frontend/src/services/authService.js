import api from "./api";

export const signUp = async (userData) => {
  // Expects { name, email, password }
  const { data } = await api.post("/api/auth/register", userData);
  return data;
};

export const signIn = async (credentials) => {
  // Expects { email, password }
  const { data } = await api.post("/api/auth/login", credentials);
  return data;
};

// 6-digit OTP verification
export const verifyOtp = async ({ email, otp }) => {
  const { data } = await api.post("/api/auth/verify-otp", { email, otp });
  return data;
};

// Resend OTP verification code
export const resendOtp = async (email) => {
  const { data } = await api.post("/api/auth/resend-otp", { email });
  return data;
};

// Request Password Reset OTP code
export const requestForgotPassword = async (email) => {
  const { data } = await api.post("/api/auth/forgot-password", { email });
  return data;
};

// Reset Password using OTP
export const resetPasswordWithOtp = async ({ email, otp, newPassword }) => {
  const { data } = await api.post("/api/auth/reset-password", {
    email,
    otp,
    newPassword,
  });
  return data;
};
