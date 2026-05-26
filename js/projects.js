/**
 * Projects renderer - loads data/projects.json and renders four
 * project cards into the page. Wires up category filter chips so
 * the user can narrow by AI/ML, Web, or Mobile.
 */

const CATEGORY_LABELS = {
  all: "All",
  "ai-ml": "AI / ML",
  web: "Web",
  mobile: "Mobile",
  robotics: "Robotics",
};

let allProjects = [];
let activeCategory = "all";

export async function initProjects() {
  const grid = document.querySelector("[data-projects-grid]");
  const honeycomb = document.querySelector("[data-honeycomb-grid]");
  if (!grid && !honeycomb) {
    return;
  }

  allProjects = await loadProjects();
  if (allProjects.length === 0) {
    if (grid) {
      grid.innerHTML = '<p class="text-muted">Projects could not be loaded.</p>';
    }
    return;
  }

  if (honeycomb) {
    const featured = allProjects.filter((p) => p.featured);
    renderHoneycomb(honeycomb, featured.length > 0 ? featured : allProjects.slice(0, 4));
  }
  if (grid) {
    renderGrid(grid, allProjects);
    initFilterChips(grid);
  }
}

async function loadProjects() {
  try {
    const response = await fetch("data/projects.json");
    if (!response.ok) {
      throw new Error(`projects.json request failed: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data.projects) ? data.projects : [];
  } catch (error) {
    console.error("Could not load projects data:", error);
    return [];
  }
}

function renderHoneycomb(container, projects) {
  container.replaceChildren();
  projects.forEach((project) => {
    container.appendChild(buildHex(project));
  });
}

function buildHex(project) {
  const link = document.createElement("a");
  link.className = "hex";
  link.href = `#project-${project.id}`;
  link.setAttribute("aria-label", `Jump to ${project.title} project details`);
  link.title = project.title;

  // Bottom layer: gradient fallback (always present, shows through if image fails to load).
  const bg = document.createElement("div");
  bg.className = "hex-bg";
  bg.style.background = project.thumbnail.gradient;
  link.appendChild(bg);

  // Top layer: cover image. If the file is missing, remove on error so the gradient shows.
  if (project.coverImage) {
    const img = document.createElement("img");
    img.className = "hex-img";
    img.src = project.coverImage;
    img.alt = "";
    img.addEventListener("error", () => img.remove());
    link.appendChild(img);
  }

  return link;
}

function renderGrid(grid, projects) {
  grid.replaceChildren();
  projects.forEach((project) => {
    const column = document.createElement("div");
    column.className = "col-12 col-md-6";
    column.appendChild(buildProjectCard(project));
    grid.appendChild(column);
  });
}

function buildProjectCard(project) {
  const card = document.createElement("article");
  card.className = "project-card";
  card.id = `project-${project.id}`;
  card.dataset.projectId = project.id;

  // Pass the per-project gradient through as a CSS custom property; the CSS uses it
  // for a thin accent stripe at the top of the Pacman-maze thumb.
  card.style.setProperty("--card-accent", project.thumbnail.gradient);

  const thumb = document.createElement("div");
  thumb.className = "project-card-thumb";
  thumb.textContent = project.thumbnail.label;
  thumb.setAttribute("role", "img");
  thumb.setAttribute("aria-label", `${project.title} thumbnail`);

  const year = document.createElement("div");
  year.className = "project-card-year";
  year.textContent = project.year;

  const title = document.createElement("h3");
  title.className = "project-card-title";
  title.textContent = project.title;

  const tagline = document.createElement("p");
  tagline.className = "project-card-tagline";
  tagline.textContent = project.tagline;

  const highlights = document.createElement("ul");
  highlights.className = "project-card-highlights";
  project.highlights.forEach((highlight) => {
    const item = document.createElement("li");
    item.textContent = highlight;
    highlights.appendChild(item);
  });

  const stack = document.createElement("div");
  stack.className = "project-card-stack";
  project.stack.forEach((tech) => {
    const tag = document.createElement("span");
    tag.className = "stack-tag";
    tag.textContent = tech;
    stack.appendChild(tag);
  });

  const links = document.createElement("div");
  links.className = "project-card-links";
  links.appendChild(buildLink(project.links.github, "GitHub"));
  links.appendChild(buildLink(project.links.demo, "Demo"));

  card.append(thumb, year, title, tagline, highlights, stack, links);
  return card;
}

function buildLink(href, label) {
  if (!href) {
    const placeholder = document.createElement("span");
    placeholder.className = "disabled-link";
    placeholder.textContent = `${label} (coming soon)`;
    return placeholder;
  }

  const link = document.createElement("a");
  link.href = href;
  link.textContent = label;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

function initFilterChips(grid) {
  const bar = document.querySelector("[data-filter-bar]");
  if (!bar) {
    return;
  }

  bar.replaceChildren();
  Object.entries(CATEGORY_LABELS).forEach(([id, label]) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "filter-chip";
    chip.dataset.category = id;
    chip.textContent = label;
    if (id === activeCategory) {
      chip.classList.add("is-active");
    }
    chip.addEventListener("click", () => handleFilterClick(id, bar, grid));
    bar.appendChild(chip);
  });
}

function handleFilterClick(category, bar, grid) {
  if (category === activeCategory) {
    return;
  }
  activeCategory = category;

  bar.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.category === category);
  });

  const filtered =
    category === "all"
      ? allProjects
      : allProjects.filter((project) => project.categories.includes(category));
  renderGrid(grid, filtered);
}
