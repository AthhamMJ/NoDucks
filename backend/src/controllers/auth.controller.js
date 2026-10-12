import {
  signUpUser,
  signInUser,
  signOutUser,
  getAuthenticatedProfile
} from "../services/auth.service.js";

export async function signUp(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required.",
      });
    }

    const data = await signUpUser({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    return res.status(201).json({
      message: data.session
        ? "Account created successfully."
        : "Account created. Check your email to confirm it.",
      user: data.user,
      accessToken: data.session?.access_token ?? null,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Could not create account.",
    });
  }
}

export async function signIn(req, res) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    const data = await signInUser({
      email: email.trim(),
      password,
    });

    return res.json({
      message: "Signed in successfully.",
      user: data.user,
      accessToken: data.session.access_token,
    });
  } catch (error) {
    return res.status(401).json({
      error: error.message || "Could not sign in.",
    });
  }
}

export async function signOut(req, res) {
  try {
    const authorization = req.headers.authorization;
    const accessToken = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!accessToken) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    await signOutUser(accessToken);

    return res.json({
      message: "Signed out successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Could not sign out.",
    });
  }
}

export async function getMe(req, res) {
  try {
    const profile = await getAuthenticatedProfile(
      req.supabase,
      req.user
    );

    return res.json({ profile });
  } catch (error) {
    if (error?.name === "ZodError") {
      return res.status(500).json({
        error: "Invalid profile data.",
      });
    }

    if (error?.code === "PGRST116") {
      return res.status(404).json({
        error: "User profile not found.",
      });
    }

    console.error("Profile lookup failed:", error);

    return res.status(500).json({
      error: "Could not load your profile.",
    });
  }
}