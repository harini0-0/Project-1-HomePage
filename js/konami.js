/**
 * Konami code easter egg - the creative addition for this homepage.
 *
 * Listens for ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight
 * ArrowLeft ArrowRight KeyB KeyA. On match, toggles `body.dev-mode`,
 * which swaps the entire theme to terminal-green over near-black and
 * reveals the hidden achievement panel + stats widget.
 *
 * Re-entering the sequence toggles dev mode back off.
 */

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

const buffer = [];

function handleKey(event) {
  // Ignore key events when the user is typing in an input or textarea.
  const target = event.target;
  if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
    return;
  }

  buffer.push(event.code);
  if (buffer.length > KONAMI_SEQUENCE.length) {
    buffer.shift();
  }

  if (buffer.length !== KONAMI_SEQUENCE.length) {
    return;
  }

  const matches = KONAMI_SEQUENCE.every((code, i) => code === buffer[i]);
  if (matches) {
    toggleDevMode();
    buffer.length = 0;
  }
}

function toggleDevMode() {
  const isOn = document.body.classList.toggle("dev-mode");
  document.body.dataset.devMode = isOn ? "on" : "off";

  // Fire a custom event so other modules (e.g. stats widget) can react.
  document.dispatchEvent(
    new CustomEvent("devmodechange", {
      detail: { active: isOn },
    })
  );
}

export function initKonami() {
  // Only attach the listener if this page has a reveal target. Avoids dead-key
  // toggling on pages that have nothing to reveal (home, projects).
  if (!document.querySelector("[data-konami-target]")) {
    return;
  }
  document.addEventListener("keydown", handleKey);
}
