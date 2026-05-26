/**
 * Site entry point. Imported as type="module" from every page.
 *
 * Each sub-module is defensive - it looks for its own DOM hooks
 * and exits quietly if the current page does not include them.
 * That lets one entry script serve all three pages without page-
 * specific glue.
 */

import { initKonami } from "./konami.js";
import { initProjects } from "./projects.js";
import { initStats } from "./stats.js";

function initImageFallbacks() {
  // Hide broken navbar avatar, hero photo, and hobby card images so their containers
  // fall back to the gradient / initials / surface color instead of showing a broken
  // image icon.
  const selector = ".brand-avatar img, .hero-photo, .hobby-card img";
  document.querySelectorAll(selector).forEach((img) => {
    img.addEventListener("error", () => img.remove());
  });
}

function init() {
  initImageFallbacks();
  initKonami();
  initProjects();
  initStats();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
