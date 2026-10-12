import { createUserClient } from "../config/supabase.js";

export async function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;
  const accessToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!accessToken) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    const supabase = createUserClient(accessToken);
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid or expired session." });
    }

    req.user = data.user;
    req.supabase = supabase;

    next();
  } catch {
    return res.status(401).json({ error: "Could not verify session." });
  }
}
