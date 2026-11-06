const form = document.getElementById("resume-form");
const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("preview-photo");
const photoPlaceholder = document.getElementById("profile-placeholder");
const entryTypes = ["education", "skills", "experience", "projects"];
let nextEntryId = 0;
let photoUrl = null;

function addEntry(type) {
  const template = document.getElementById(`${type}-template`);
  const list = document.getElementById(`${type}-list`);
  if (!template || !list) return;

  const fragment = template.content.cloneNode(true);
  const entry = fragment.querySelector("[data-entry]");
  const entryId = `entry-${nextEntryId++}`;

  entry.querySelectorAll(".field").forEach((field, index) => {
    const label = field.querySelector("label");
    const control = field.querySelector("input, textarea");
    if (!label || !control) return;
    const controlId = `${entryId}-${index}`;
    label.htmlFor = controlId;
    control.id = controlId;
  });

  list.append(fragment);
  updatePreview();
}

function getEntries(type) {
  return [...document.querySelectorAll(`#${type}-list [data-entry]`)].map((entry) => {
    const values = {};
    entry.querySelectorAll("[data-field]").forEach((field) => {
      values[field.dataset.field] = field.value.trim();
    });
    return values;
  });
}

function setText(id, value, fallback) {
  document.getElementById(id).textContent = value.trim() || fallback;
}

function addEmptyMessage(target, message) {
  const empty = document.createElement("p");
  empty.className = "preview-empty";
  empty.textContent = message;
  target.append(empty);
}

function makeEntry(className, title, subtitle, period, details) {
  const entry = document.createElement("div");
  entry.className = className;

  const heading = document.createElement("div");
  heading.className = "entry-heading";
  const headingText = document.createElement("strong");
  headingText.textContent = title;
  heading.append(headingText);

  if (period) {
    const dates = document.createElement("span");
    dates.className = "entry-period";
    dates.textContent = period;
    heading.append(dates);
  }
  entry.append(heading);

  if (subtitle) {
    const sub = document.createElement("p");
    sub.className = "entry-subtitle";
    sub.textContent = subtitle;
    entry.append(sub);
  }

  if (details) {
    const description = document.createElement("p");
    description.className = "entry-details";
    description.textContent = details;
    entry.append(description);
  }
  return entry;
}

function renderEducation() {
  const target = document.getElementById("preview-education");
  const entries = getEntries("education").filter((item) => item.degree || item.school || item.period || item.details);
  target.replaceChildren();
  if (!entries.length) {
    addEmptyMessage(target, "Your education will appear here.");
    return;
  }

  entries.forEach((item) => {
    const entry = document.createElement("div");
    entry.className = "sidebar-entry";
    if (item.degree) {
      const degree = document.createElement("strong");
      degree.textContent = item.degree;
      entry.append(degree);
    }
    const details = [item.school, item.period, item.details].filter(Boolean).join("\n");
    if (details) {
      const text = document.createElement("p");
      text.textContent = details;
      entry.append(text);
    }
    target.append(entry);
  });
}

function renderSkills() {
  const target = document.getElementById("preview-skills");
  const skills = getEntries("skills").map((item) => item.skill).filter(Boolean);
  target.replaceChildren();
  if (!skills.length) {
    addEmptyMessage(target, "Your skills will appear here.");
    return;
  }

  skills.forEach((skill) => {
    const chip = document.createElement("span");
    chip.className = "skill-chip";
    chip.textContent = skill;
    target.append(chip);
  });
}

function renderExperience() {
  const target = document.getElementById("preview-experience");
  const entries = getEntries("experience").filter((item) => item.role || item.company || item.period || item.details);
  target.replaceChildren();
  if (!entries.length) {
    addEmptyMessage(target, "Your experience will appear here.");
    return;
  }

  entries.forEach((item) => {
    target.append(makeEntry("timeline-entry", item.role || item.company, item.role ? item.company : "", item.period, item.details));
  });
}

function renderProjects() {
  const target = document.getElementById("preview-projects");
  const entries = getEntries("projects").filter((item) => item.name || item.details);
  target.replaceChildren();
  if (!entries.length) {
    addEmptyMessage(target, "Your projects will appear here.");
    return;
  }

  entries.forEach((item) => {
    target.append(makeEntry("project-entry", item.name, "", "", item.details));
  });
}

function updatePreview() {
  setText("preview-name", document.getElementById("full-name").value, "Your Name");
  setText("preview-title-text", document.getElementById("professional-title").value, "Professional Title");
  setText("preview-email", document.getElementById("email").value, "you@example.com");
  setText("preview-phone", document.getElementById("phone").value, "Phone number");
  setText("preview-address", document.getElementById("address").value, "City, Country");
  setText("preview-objective", document.getElementById("objective").value, "Your introduction or career objective will appear here.");
  renderEducation();
  renderSkills();
  renderExperience();
  renderProjects();
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    addEntry(addButton.dataset.add);
    return;
  }

  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) {
    removeButton.closest("[data-entry]").remove();
    updatePreview();
  }
});

form.addEventListener("input", updatePreview);

photoInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  photoUrl = null;

  if (!file || !file.type.startsWith("image/")) {
    photoPreview.removeAttribute("src");
    photoPreview.hidden = true;
    photoPlaceholder.hidden = false;
    return;
  }

  photoUrl = URL.createObjectURL(file);
  photoPreview.src = photoUrl;
  photoPreview.hidden = false;
  photoPlaceholder.hidden = true;
});

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight) {
  let cursorY = y;
  const paragraphs = String(text || "").split("\n");

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    let line = "";

    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (line && context.measureText(candidate).width > maxWidth) {
        context.fillText(line, x, cursorY);
        cursorY += lineHeight;
        line = word;
      } else {
        line = candidate;
      }
    });

    if (line) {
      context.fillText(line, x, cursorY);
      cursorY += lineHeight;
    }
    if (paragraphIndex < paragraphs.length - 1) cursorY += lineHeight * 0.35;
  });

  return cursorY;
}

function drawSectionHeading(context, title, x, y, width, color) {
  context.fillStyle = color;
  context.fillRect(x, y, 28, 4);
  context.font = "700 20px Arial, sans-serif";
  context.fillText(title.toUpperCase(), x + 42, y + 5);
  return y + 39;
}

function drawPdfPage(photoImage) {
  const canvas = document.createElement("canvas");
  canvas.width = 1240;
  canvas.height = 1754;
  const context = canvas.getContext("2d");
  const sidebarWidth = 400;
  const sidebarX = 58;
  const sidebarContentWidth = sidebarWidth - sidebarX * 2;
  const mainX = 470;
  const mainWidth = 700;
  const darkTeal = "#176c79";
  const lightTeal = "#d7edef";

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = darkTeal;
  context.fillRect(0, 0, sidebarWidth, canvas.height);

  // Profile photo and name in the sidebar.
  const photoX = sidebarWidth / 2;
  const photoY = 145;
  const photoRadius = 82;
  context.save();
  context.beginPath();
  context.arc(photoX, photoY, photoRadius, 0, Math.PI * 2);
  context.fillStyle = "#dcebec";
  context.fill();
  context.clip();
  if (photoImage) {
    const side = Math.min(photoImage.naturalWidth, photoImage.naturalHeight);
    const sx = (photoImage.naturalWidth - side) / 2;
    const sy = (photoImage.naturalHeight - side) / 2;
    context.drawImage(photoImage, sx, sy, side, side, photoX - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2);
  } else {
    context.fillStyle = darkTeal;
    context.font = "700 16px Arial, sans-serif";
    context.textAlign = "center";
    context.fillText("PROFILE PHOTO", photoX, photoY + 6);
  }
  context.restore();
  context.strokeStyle = "#ffffffd0";
  context.lineWidth = 8;
  context.beginPath();
  context.arc(photoX, photoY, photoRadius, 0, Math.PI * 2);
  context.stroke();

  context.textAlign = "center";
  context.fillStyle = "#ffffff";
  context.font = "700 39px Georgia, serif";
  let sideY = wrapCanvasText(context, document.getElementById("full-name").value.trim() || "Your Name", photoX, 270, sidebarContentWidth, 45);
  context.fillStyle = lightTeal;
  context.font = "21px Arial, sans-serif";
  sideY = wrapCanvasText(context, document.getElementById("professional-title").value.trim() || "Professional Title", photoX, sideY + 4, sidebarContentWidth, 28);
  context.textAlign = "left";
  sideY += 28;

  const drawSidebarSection = (title) => {
    sideY += 18;
    context.fillStyle = "#ffffff";
    context.fillRect(sidebarX, sideY, sidebarContentWidth, 2);
    context.font = "700 20px Arial, sans-serif";
    context.fillText(title.toUpperCase(), sidebarX, sideY + 30);
    sideY += 54;
  };

  drawSidebarSection("Contact");
  context.fillStyle = "#e9f5f5";
  context.font = "18px Arial, sans-serif";
  [
    document.getElementById("email").value.trim(),
    document.getElementById("phone").value.trim(),
    document.getElementById("address").value.trim()
  ].filter(Boolean).forEach((value) => {
    sideY = wrapCanvasText(context, value, sidebarX, sideY, sidebarContentWidth, 24) + 8;
  });

  drawSidebarSection("Education");
  context.font = "700 18px Arial, sans-serif";
  context.fillStyle = "#ffffff";
  getEntries("education").filter((item) => item.degree || item.school || item.period || item.details).forEach((item) => {
    if (item.degree) sideY = wrapCanvasText(context, item.degree, sidebarX, sideY, sidebarContentWidth, 23);
    context.font = "17px Arial, sans-serif";
    context.fillStyle = lightTeal;
    [item.school, item.period, item.details].filter(Boolean).forEach((value) => {
      sideY = wrapCanvasText(context, value, sidebarX, sideY, sidebarContentWidth, 22);
    });
    sideY += 12;
    context.font = "700 18px Arial, sans-serif";
    context.fillStyle = "#ffffff";
  });

  drawSidebarSection("Skills");
  context.fillStyle = "#e9f5f5";
  context.font = "18px Arial, sans-serif";
  getEntries("skills").map((item) => item.skill).filter(Boolean).forEach((skill) => {
    sideY = wrapCanvasText(context, `•  ${skill}`, sidebarX, sideY, sidebarContentWidth, 24) + 4;
  });

  // Career objective, experience, and projects in the main column.
  let mainY = 110;
  mainY = drawSectionHeading(context, "About me", mainX, mainY, mainWidth, "#2b8490");
  context.fillStyle = "#4b585c";
  context.font = "19px Arial, sans-serif";
  mainY = wrapCanvasText(context, document.getElementById("objective").value.trim() || "Your introduction or career objective will appear here.", mainX, mainY, mainWidth, 30) + 30;

  mainY = drawSectionHeading(context, "Experience", mainX, mainY, mainWidth, "#2b8490");
  getEntries("experience").filter((item) => item.role || item.company || item.period || item.details).forEach((item) => {
    context.fillStyle = "#243a40";
    context.font = "700 20px Arial, sans-serif";
    if (item.role || item.company) mainY = wrapCanvasText(context, item.role || item.company, mainX, mainY, mainWidth, 26);
    context.fillStyle = "#547178";
    context.font = "17px Arial, sans-serif";
    if (item.role && item.company) mainY = wrapCanvasText(context, item.company, mainX, mainY, mainWidth, 23);
    if (item.period) mainY = wrapCanvasText(context, item.period, mainX, mainY, mainWidth, 23);
    context.fillStyle = "#4b585c";
    context.font = "17px Arial, sans-serif";
    if (item.details) mainY = wrapCanvasText(context, item.details, mainX, mainY + 4, mainWidth, 25);
    mainY += 18;
  });

  mainY = drawSectionHeading(context, "Projects", mainX, mainY, mainWidth, "#2b8490");
  getEntries("projects").filter((item) => item.name || item.details).forEach((item) => {
    context.fillStyle = "#243a40";
    context.font = "700 20px Arial, sans-serif";
    if (item.name) mainY = wrapCanvasText(context, item.name, mainX, mainY, mainWidth, 26);
    context.fillStyle = "#4b585c";
    context.font = "17px Arial, sans-serif";
    if (item.details) mainY = wrapCanvasText(context, item.details, mainX, mainY + 4, mainWidth, 25);
    mainY += 18;
  });

  return canvas;
}

function buildPdfBytes(jpegBytes, width, height) {
  const encoder = new TextEncoder();
  const parts = [];
  const offsets = [0];
  let byteOffset = 0;

  function appendBytes(bytes) {
    parts.push(bytes);
    byteOffset += bytes.length;
  }

  function appendText(text) {
    appendBytes(encoder.encode(text));
  }

  appendText("%PDF-1.4\n% Offline Resume Builder\n");
  offsets[1] = byteOffset;
  appendText("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n");
  offsets[2] = byteOffset;
  appendText("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n");
  offsets[3] = byteOffset;
  appendText("3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /ResumeImage 5 0 R >> >> /Contents 4 0 R >> endobj\n");

  const drawingCommands = "q\n595.28 0 0 841.89 0 0 cm\n/ResumeImage Do\nQ\n";
  offsets[4] = byteOffset;
  appendText(`4 0 obj << /Length ${encoder.encode(drawingCommands).length} >> stream\n${drawingCommands}endstream endobj\n`);

  offsets[5] = byteOffset;
  appendText(`5 0 obj << /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >> stream\n`);
  appendBytes(jpegBytes);
  appendText("\nendstream endobj\n");

  const xrefOffset = byteOffset;
  appendText("xref\n0 6\n0000000000 65535 f \n");
  for (let objectNumber = 1; objectNumber <= 5; objectNumber += 1) {
    appendText(`${String(offsets[objectNumber]).padStart(10, "0")} 00000 n \n`);
  }
  appendText(`trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return new Blob(parts, { type: "application/pdf" });
}

async function downloadPdf() {
  const button = document.getElementById("print-resume");
  const status = document.getElementById("export-status");
  const originalLabel = button.innerHTML;
  button.disabled = true;
  button.textContent = "Preparing PDF…";
  status.textContent = "Creating your resume PDF on this device…";

  try {
    // Reuse the already displayed photo instead of decoding it a second time.
    const photoImage = !photoPreview.hidden && photoPreview.complete && photoPreview.naturalWidth
      ? photoPreview
      : null;
    const canvas = drawPdfPage(photoImage);
    const jpegBlob = await new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("PDF image generation timed out.")), 15000);
      canvas.toBlob((blob) => {
        window.clearTimeout(timeout);
        if (blob) resolve(blob);
        else reject(new Error("Could not create PDF image."));
      }, "image/jpeg", 0.96);
    });
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const pdfBlob = buildPdfBytes(jpegBytes, canvas.width, canvas.height);
    const downloadUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    const name = document.getElementById("full-name").value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    link.href = downloadUrl;
    link.download = `${name || "resume"}.pdf`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    status.textContent = "Your resume PDF has been downloaded.";
  } catch (error) {
    console.error(error);
    status.textContent = "The PDF could not be created. Please try again in a current browser.";
  } finally {
    button.disabled = false;
    button.innerHTML = originalLabel;
  }
}

document.getElementById("print-resume").addEventListener("click", downloadPdf);

entryTypes.forEach((type) => addEntry(type));
updatePreview();
