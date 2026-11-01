import { getDBStatus } from "../../config/db.js";
import { getSettings, updateQuotas } from "../../services/settingsService.js";

const PLANS = ["free", "student"];
const ACTIONS = ["lesson", "chat", "quiz"];
const MAX_QUOTA = 10000;

export const getAdminSettings = async (req, res) => {
  try {
    const settings = await getSettings();
    const db = getDBStatus();

    res.json({
      quotas: settings.quotas,
      system: {
        database: db.status,
        databaseConnected: db.isConnected,
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development",
        serverTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("getAdminSettings error:", error);
    res.status(500).json({ message: "Failed to load settings" });
  }
};

export const updateAdminQuotas = async (req, res) => {
  try {
    const body = req.body || {};
    const clean = {};

    for (const plan of PLANS) {
      clean[plan] = {};
      for (const action of ACTIONS) {
        const value = body[plan]?.[action];

        if (!Number.isInteger(value) || value < 0 || value > MAX_QUOTA) {
          return res.status(400).json({
            message: `Invalid value for ${plan}.${action} must be a whole number from 0 to ${MAX_QUOTA})`,
          });
        }
        clean[plan][action] = value;
      }
    }

    const settings = await updateQuotas(clean);
    res.json({ quotas: settings.quotas });
  } catch (error) {
    console.error("updateAdminQuotas error", error);
    res.status(500).json({ message: "Failed to update quotas" });
  }
};
