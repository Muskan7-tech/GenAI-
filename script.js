const form = document.getElementById("resume-form");
const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("preview-photo");
const photoPlaceholder = document.getElementById("profile-placeholder");
const types = ["education", "skills", "experience", "projects"];
let entryId = 0;
function entries(type) {
  return Array.from(document.querySelectorAll("#" + type + "-list [data-entry]")).map((entry) => {
    const value = {};
    entry.querySelectorAll("[data-field]").forEach((field) => value[field.dataset.field] = field.value.trim());
    return value;
  });
}
function addEntry(type) {
  const template = document.getElementById(type + "-template");
  const fragment = template.content.cloneNode(true);
  const entry = fragment.querySelector("[data-entry]");
  const id = "entry-" + entryId++;
  entry.querySelectorAll(".field").forEach((field, index) => {
    const label = field.querySelector("label"), control = field.querySelector("input, textarea");
    if (label && control) { control.id = id + "-" + index; label.htmlFor = control.id; }
  });
  document.getElementById(type + "-list").append(fragment);
  updatePreview();
}
function setText(id, value, fallback) { document.getElementById(id).textContent = value.trim() || fallback; }
function empty(target, message) { const p = document.createElement("p"); p.className = "preview-empty"; p.textContent = message; target.append(p); }
function render(type, targetId, keys, message, make) {
  const target = document.getElementById(targetId);
  const data = entries(type).filter((item) => keys.some((key) => item[key]));
  target.replaceChildren();
  if (!data.length) { empty(target, message); return; }
  data.forEach((item) => target.append(make(item)));
}
function paragraph(text, className) { const p = document.createElement("p"); p.className = className || ""; p.textContent = text; return p; }
function updatePreview() {
  setText("preview-name", document.getElementById("full-name").value, "Your Name");
  setText("preview-title-text", document.getElementById("professional-title").value, "Professional Title");
  setText("preview-email", document.getElementById("email").value, "you@example.com");
  setText("preview-phone", document.getElementById("phone").value, "Phone number");
  setText("preview-address", document.getElementById("address").value, "City, Country");
  setText("preview-objective", document.getElementById("objective").value, "Your introduction or career objective will appear here.");
  render("education", "preview-education", ["degree", "school", "period", "details"], "Your education will appear here.", (item) => {
    const box = document.createElement("div"); box.className = "sidebar-entry";
    if (item.degree) { const b = document.createElement("strong"); b.textContent = item.degree; box.append(b); }
    const detail = [item.school, item.period, item.details].filter(Boolean).join("\n"); if (detail) box.append(paragraph(detail)); return box;
  });
  render("skills", "preview-skills", ["skill"], "Your skills will appear here.", (item) => {
    const span = document.createElement("span"); span.className = "skill-chip"; span.textContent = item.skill; return span;
  });
  render("experience", "preview-experience", ["role", "company", "period", "details"], "Your experience will appear here.", (item) => {
    const box = document.createElement("div"); box.className = "timeline-entry";
    const head = document.createElement("div"); head.className = "entry-heading";
    const strong = document.createElement("strong"); strong.textContent = item.role || item.company; head.append(strong);
    if (item.period) { const date = document.createElement("span"); date.className = "entry-period"; date.textContent = item.period; head.append(date); }
    box.append(head); if (item.role && item.company) box.append(paragraph(item.company, "entry-subtitle"));
    if (item.details) box.append(paragraph(item.details, "entry-details")); return box;
  });
  render("projects", "preview-projects", ["name", "details"], "Your projects will appear here.", (item) => {
    const box = document.createElement("div"); box.className = "project-entry";
    if (item.name) { const b = document.createElement("strong"); b.textContent = item.name; box.append(b); }
    if (item.details) box.append(paragraph(item.details, "entry-details")); return box;
  });
}
document.addEventListener("click", (event) => {
  const add = event.target.closest("[data-add]");
  if (add) { addEntry(add.dataset.add); return; }
  const remove = event.target.closest("[data-remove]");
  if (remove) { remove.closest("[data-entry]").remove(); updatePreview(); }
});
form.addEventListener("input", updatePreview);
photoInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith("image/")) { photoPreview.removeAttribute("src"); photoPreview.hidden = true; photoPlaceholder.hidden = false; return; }
  photoPreview.src = URL.createObjectURL(file); photoPreview.hidden = false; photoPlaceholder.hidden = true;
});
document.getElementById("print-resume").addEventListener("click", () => {
  document.getElementById("export-status").textContent = "In the print window, choose Save as PDF as the destination.";
  window.print();
});
types.forEach(addEntry);
updatePreview();
