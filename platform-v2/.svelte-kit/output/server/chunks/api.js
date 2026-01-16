import { s as settings } from "./settings.js";
import { v as ventures } from "./ventures.js";
import { g as get } from "./index.js";
async function testApplovinApi(apiKey) {
  try {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const url = `https://r.applovin.com/maxReport?api_key=${apiKey}&start=${today}&end=${today}&format=json&columns=day,application`;
    const response = await fetch(url);
    if (response.ok) {
      return { success: true };
    } else {
      const errorText = await response.text();
      return { success: false, error: errorText || "Invalid API response" };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Connection failed" };
  }
}
async function fetchApplovinRevenue(bundleId, startDate, endDate) {
  const { applovinApiKey } = get(settings);
  if (!applovinApiKey || !bundleId) return null;
  try {
    const url = `https://r.applovin.com/maxReport?api_key=${applovinApiKey}&start=${startDate}&end=${endDate}&format=json&columns=day,estimated_revenue&filter_application=${bundleId}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results.reduce(
          (sum, row) => sum + (parseFloat(String(row.estimated_revenue)) || 0),
          0
        );
      }
    }
    return null;
  } catch (error) {
    console.error("AppLovin fetch error:", error);
    return null;
  }
}
async function fetchSuperwallRevenue(apiKey, startDate, endDate) {
  if (!apiKey) return null;
  try {
    const url = `https://api.superwall.com/api/v1/analytics/revenue?start_date=${startDate}&end_date=${endDate}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    if (response.ok) {
      const data = await response.json();
      return data.total_revenue || data.revenue || null;
    }
    return null;
  } catch (error) {
    console.error("Superwall fetch error:", error);
    return null;
  }
}
async function syncAllVentures() {
  const allVentures = get(ventures);
  const { applovinApiKey } = get(settings);
  const today = /* @__PURE__ */ new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];
  let updated = 0;
  let errors = 0;
  for (const venture of allVentures) {
    if (venture.state === "building" || venture.state === "killed") continue;
    try {
      let revenue = null;
      if (venture.type === "game" && venture.bundleId && applovinApiKey) {
        revenue = await fetchApplovinRevenue(venture.bundleId, startDate, endDate);
      } else if (venture.type === "app" && venture.superwallKey) {
        revenue = await fetchSuperwallRevenue(venture.superwallKey, startDate, endDate);
      }
      if (revenue !== null) {
        ventures.update(venture.id, { revenue: (venture.revenue || 0) + revenue });
        updated++;
      }
    } catch {
      errors++;
    }
  }
  return { updated, errors };
}
async function syncVenture(ventureId) {
  const venture = ventures.get(ventureId);
  if (!venture) return { success: false, error: "Venture not found" };
  if (venture.state === "building" || venture.state === "killed") {
    return { success: false, error: "Venture is not in a syncable state" };
  }
  const { applovinApiKey } = get(settings);
  const today = /* @__PURE__ */ new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];
  try {
    let revenue = null;
    if (venture.type === "game" && venture.bundleId && applovinApiKey) {
      revenue = await fetchApplovinRevenue(venture.bundleId, startDate, endDate);
    } else if (venture.type === "app" && venture.superwallKey) {
      revenue = await fetchSuperwallRevenue(venture.superwallKey, startDate, endDate);
    }
    if (revenue !== null) {
      ventures.update(venture.id, { revenue });
      return { success: true, revenue };
    }
    return { success: false, error: "No revenue data available or API not configured" };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Sync failed" };
  }
}
export {
  syncVenture as a,
  syncAllVentures as s,
  testApplovinApi as t
};
