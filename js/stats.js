/**
 * Stats widget - renders the numbers behind the resume into the
 * Konami-revealed achievement panel. Pulls from data/profile.json
 * so there is one source of truth for the stats.
 */

export async function initStats() {
  const container = document.querySelector("[data-stats-container]");
  if (!container) {
    return;
  }

  const data = await loadProfile();
  if (!data || !Array.isArray(data.stats)) {
    return;
  }

  renderStats(container, data.stats);
  renderAchievementCopy(data);
}

async function loadProfile() {
  try {
    const response = await fetch("data/profile.json");
    if (!response.ok) {
      throw new Error(`profile.json request failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Could not load profile data:", error);
    return null;
  }
}

function renderStats(container, stats) {
  container.replaceChildren();
  stats.forEach((stat) => {
    container.appendChild(buildStatCard(stat));
  });
}

function buildStatCard(stat) {
  const card = document.createElement("div");
  card.className = "stat-card";

  const value = document.createElement("div");
  value.className = "stat-value";
  value.textContent = `${stat.value}${stat.suffix ?? ""}`;

  const label = document.createElement("div");
  label.className = "stat-label";
  label.textContent = stat.label;

  card.append(value, label);
  return card;
}

function renderAchievementCopy(profile) {
  const title = document.querySelector("[data-achievement-title]");
  const body = document.querySelector("[data-achievement-body]");
  if (title && profile.achievementMessage) {
    title.textContent = profile.achievementMessage;
  }
  if (body && profile.achievementBody) {
    body.textContent = profile.achievementBody;
  }
}
