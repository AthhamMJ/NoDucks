import AppSettings from "../models/admin/AppSettings.js";
import { PLAN_QUOTAS } from "../config/aiQuotas.js";

//Returns the single settings document, creating it with default values
export const getSettings = () =>
  AppSettings.findOneAndUpdate(
    { key: "global" },
    { $setOnInsert: { quotas: PLAN_QUOTAS } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

export const updateQuotas = (quotas) =>
  AppSettings.findOneAndUpdate(
    { key: "global" },
    { $set: { quotas } },
    { upsert: true, new: true, runValidators: true },
  ).lean();

// For tutor controllers and quota checks to read the live limits
export const getQuotasForPlan = async (plan) => {
  const settings = await getSettings();
  return (
    settings?.quotas?.[plan] ||
    settings?.quotas?.free ||
    PLAN_QUOTAS[plan] ||
    PLAN_QUOTAS.free
  );
};

export const updateGeneral = (changes) =>
  AppSettings.findOneAndUpdate(
    { key: "global" },
    { $set: changes },
    { upsert: true, new: true, runValidators: true },
  ).lean();

export const getDefaultPlan = async () => {
  const settings = await AppSettings.findOne({ key: "global" })
    .select("defaultPlan")
    .lean();
  return settings?.defaultPlan || "free";
};
