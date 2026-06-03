/* ============================================
   DSJB Story Generator v2 — Canvas 1080×1920
   Fix: overflow, emoji, newline, mobile, layout
   ============================================ */

(function () {
  "use strict";

  const W = 1080, H = 1920;
  const canvas = document.getElementById("storyCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // ── State ───────────────────────────────────────────
  let currentTheme = "green";
  let currentTemplate = "company";
  let logoImg = null;
  let logoFailed = false;

  // ── Themes ──────────────────────────────────────────
  const THEMES = {
    green: {
      grad: ["#0a1f14", "#0e3a20", "#1a5c30", "#2f8f46"],
      accent: "#67b846",
      accentDark: "#2f8f46",
      accentLight: "rgba(103,184,70,.12)",
      text: "#ffffff",
      muted: "#b8d4c4",
      overlay: "rgba(0,0,0,.25)",
    },
    navy: {
      grad: ["#020a14", "#06131c", "#0e2d45", "#145da0"],
      accent: "#4da6e8",
      accentDark: "#145da0",
      accentLight: "rgba(77,166,232,.12)",
      text: "#ffffff",
      muted: "#b8c8d8",
      overlay: "rgba(0,0,0,.3)",
    },
    gold: {
      grad: ["#0e0a04", "#1a1008", "#3d2810", "#5c3a14"],
      accent: "#d6ad63",
      accentDark: "#b9631a",
      accentLight: "rgba(214,173,99,.12)",
      text: "#ffffff",
      muted: "#d4c8b0",
      overlay: "rgba(0,0,0,.3)",
    },
    dark: {
      grad: ["#050808", "#0a0e12", "#141e28", "#1a2a38"],
      accent: "#67b846",
      accentDark: "#2f8f46",
      accentLight: "rgba(103,184,70,.1)",
      text: "#ffffff",
      muted: "#8a9a9e",
      overlay: "rgba(0,0,0,.35)",
    },
  };

  // ── Load Logo (with fallback) ───────────────────────
  function loadLogo() {
    const img = new Image();
    img.onload = () => { logoImg = img; render(); };
    img.onerror = () => { logoFailed = true; render(); };
    // Try WebP first, fallback to PNG
    img.src = "assets/img/logo-dsjb-fullcolor-whitebg.webp";
  }
  loadLogo();

  // ── SVG Icon Paths ──────────────────────────────────
  const ICONS = {
    phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
    mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
    map: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    leaf: "M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75",
    share: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13",
    check: "M20 6L9 17l-5-5",
  };

  function drawIcon(iconName, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 24, size / 24);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "none";
    const path = new Path2D(ICONS[iconName]);
    ctx.stroke(path);
    ctx.restore();
  }

  // ── Helper: Multi-line text with newline support ────
  function drawMultilineText(text, x, y, maxWidth, lineHeight, font, color, align) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align || "left";
    ctx.textBaseline = "top";

    // Split by newlines first, then wrap each paragraph
    const paragraphs = text.split("\n");
    let curY = y;

    for (const para of paragraphs) {
      if (para.trim() === "") {
        curY += lineHeight * 0.5; // Empty line = half spacing
        continue;
      }
      const words = para.split(" ");
      let line = "";
      for (const word of words) {
        const test = line + word + " ";
        if (ctx.measureText(test).width > maxWidth && line !== "") {
          ctx.fillText(line.trim(), x, curY);
          line = word + " ";
          curY += lineHeight;
        } else {
          line = test;
        }
      }
      if (line.trim()) {
        ctx.fillText(line.trim(), x, curY);
        curY += lineHeight;
      }
    }
    return curY;
  }

  // ── Helper: Measure text height (for layout calc) ──
  function measureTextHeight(text, maxWidth, lineHeight, font) {
    ctx.font = font;
    const paragraphs = text.split("\n");
    let lines = 0;
    for (const para of paragraphs) {
      if (para.trim() === "") { lines += 0.5; continue; }
      const words = para.split(" ");
      let line = "";
      for (const word of words) {
        const test = line + word + " ";
        if (ctx.measureText(test).width > maxWidth && line !== "") {
          lines++;
          line = word + " ";
        } else {
          line = test;
        }
      }
      if (line.trim()) lines++;
    }
    return lines * lineHeight;
  }

  // ── Helper: Rounded rectangle ───────────────────────
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ── Helper: Clamp font size if text too long ────────
  function clampFontSize(text, maxWidth, maxLines, startSize, minSize, fontSuffix) {
    for (let size = startSize; size >= minSize; size -= 2) {
      const height = measureTextHeight(text, maxWidth, size * 1.25, `bold ${size}px ${fontSuffix}`);
      if (height <= size * 1.25 * maxLines) return size;
    }
    return minSize;
  }

  // ── Draw Background ─────────────────────────────────
  function drawBg(theme) {
    const t = THEMES[theme];
    // Gradient
    const grad = ctx.createLinearGradient(0, 0, W * 0.3, H);
    t.grad.forEach((c, i) => grad.addColorStop(i / (t.grad.length - 1), c));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Decorative geometric shapes
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = t.accent;
    ctx.beginPath(); ctx.arc(W * 0.85, H * 0.12, 320, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W * 0.08, H * 0.78, 220, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W * 0.5, H * 0.5, 500, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    // Top accent bar
    ctx.fillStyle = t.accent;
    ctx.fillRect(0, 0, W, 6);

    // Bottom accent bar
    ctx.fillStyle = t.accentDark;
    ctx.fillRect(0, H - 6, W, 6);
  }

  // ── Draw Logo ───────────────────────────────────────
  function drawLogo(y, size) {
    size = size || 180;
    if (logoImg) {
      const lw = size;
      const lh = (logoImg.height / logoImg.width) * lw;
      ctx.globalAlpha = 0.95;
      ctx.drawImage(logoImg, W / 2 - lw / 2, y, lw, lh);
      ctx.globalAlpha = 1;
      return y + lh + 16;
    }
    // Fallback: text logo
    if (logoFailed) {
      ctx.font = "bold 28px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("PT DSITU JAYA BERSAMA", W / 2, y);
      return y + 40;
    }
    return y;
  }

  // ── Draw Eyebrow Badge ──────────────────────────────
  function drawBadge(text, y, theme) {
    const t = THEMES[theme];
    ctx.font = "bold 22px 'Segoe UI', sans-serif";
    const tw = ctx.measureText(text).width;
    const bw = tw + 48, bh = 44, bx = (W - bw) / 2;
    roundRect(bx, y, bw, bh, 22);
    ctx.fillStyle = t.accentLight;
    ctx.fill();
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = t.accent;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, W / 2, y + bh / 2);
    return y + bh + 28;
  }

  // ── Draw Divider ────────────────────────────────────
  function drawDivider(y, theme, width) {
    const t = THEMES[theme];
    const w = width || 80;
    ctx.fillStyle = t.accent;
    roundRect(W / 2 - w / 2, y, w, 3, 1.5);
    ctx.fill();
    return y + 24;
  }

  // ── Draw CTA Button ─────────────────────────────────
  function drawCTAButton(text, y, theme, size) {
    const t = THEMES[theme];
    const fontSize = size || 30;
    ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`;
    const tw = ctx.measureText(text).width;
    const bw = Math.max(tw + 80, 360);
    const bh = fontSize + 40;
    const bx = (W - bw) / 2;
    roundRect(bx, y, bw, bh, bh / 2);
    ctx.fillStyle = t.accent;
    ctx.fill();
    // Subtle inner shadow
    ctx.shadowColor = "rgba(0,0,0,.2)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, W / 2, y + bh / 2);
    return y + bh + 24;
  }

  // ── Draw Contact Footer ─────────────────────────────
  function drawContactBar(y, theme) {
    const t = THEMES[theme];
    const items = [
      { icon: "phone", text: "0813-4841-4190" },
      { icon: "mail", text: "dsitujayabersama@gmail.com" },
      { icon: "map", text: "Tanah Bumbu, Kalimantan Selatan" },
    ];
    const lineH = 44;
    const startX = W / 2 - 200;
    for (const item of items) {
      drawIcon(item.icon, startX - 30, y + 4, 20, t.accent);
      ctx.font = "22px 'Segoe UI', sans-serif";
      ctx.fillStyle = t.muted;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(item.text, startX + 8, y);
      y += lineH;
    }
    return y;
  }

  // ── Draw Bottom Footer ──────────────────────────────
  function drawFooter(theme) {
    const t = THEMES[theme];
    // Fade
    const fade = ctx.createLinearGradient(0, H - 160, 0, H);
    fade.addColorStop(0, "transparent");
    fade.addColorStop(1, t.overlay);
    ctx.fillStyle = fade;
    ctx.fillRect(0, H - 160, W, 160);
    // Website
    ctx.font = "20px 'Segoe UI', sans-serif";
    ctx.fillStyle = t.muted;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.globalAlpha = 0.6;
    ctx.fillText("verrysimatupang99.github.io/dsjb-company-profile", W / 2, H - 30);
    ctx.globalAlpha = 1;
  }

  // ═══════════════════════════════════════════════════
  //  TEMPLATES
  // ═══════════════════════════════════════════════════

  function renderCompany(theme, data) {
    const t = THEMES[theme];
    const pad = 100;
    const maxW = W - pad * 2;
    drawBg(theme);

    let y = 140;
    y = drawLogo(y, 160);
    y += 40;

    // Tagline
    ctx.font = "bold 26px 'Segoe UI', sans-serif";
    ctx.fillStyle = t.accent;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.letterSpacing = "2px";
    ctx.fillText("THE RIGHT PARTNER, THE GREAT STEP.", W / 2, y);
    ctx.letterSpacing = "0px";
    y += 50;
    y = drawDivider(y, theme, 120);
    y += 20;

    // Title — auto font size
    const titleSize = clampFontSize(data.title, maxW, 3, 56, 32, "'Segoe UI', sans-serif");
    y = drawMultilineText(data.title, W / 2, y, maxW, titleSize * 1.3, `bold ${titleSize}px 'Segoe UI', sans-serif`, t.text, "center");
    y += 16;

    // Subtitle
    const subSize = clampFontSize(data.subtitle, maxW, 2, 28, 20, "'Segoe UI', sans-serif");
    y = drawMultilineText(data.subtitle, W / 2, y, maxW, subSize * 1.4, `${subSize}px 'Segoe UI', sans-serif`, t.muted, "center");
    y += 30;

    // Body
    const bodySize = clampFontSize(data.body, maxW, 6, 26, 18, "'Segoe UI', sans-serif");
    y = drawMultilineText(data.body, W / 2, y, maxW, bodySize * 1.5, `${bodySize}px 'Segoe UI', sans-serif`, t.muted, "center");
    y += 50;

    drawCTAButton(data.cta, y, theme);

    drawFooter(theme);
  }

  function renderService(theme, data) {
    const t = THEMES[theme];
    const pad = 100;
    const maxW = W - pad * 2;
    drawBg(theme);

    let y = 100;
    y = drawLogo(y, 140);
    y += 30;

    y = drawBadge("LAYANAN KAMI", y, theme);

    // Service icon
    const iconSize = 100;
    const ix = W / 2 - iconSize / 2;
    roundRect(ix, y, iconSize, iconSize, 20);
    ctx.fillStyle = t.accentLight;
    ctx.fill();
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 3;
    ctx.stroke();
    drawIcon("leaf", ix + 25, y + 25, 50, t.accent);
    y += iconSize + 40;

    // Title
    const titleSize = clampFontSize(data.title, maxW, 3, 52, 28, "'Segoe UI', sans-serif");
    y = drawMultilineText(data.title, W / 2, y, maxW, titleSize * 1.3, `bold ${titleSize}px 'Segoe UI', sans-serif`, t.text, "center");
    y += 12;

    // Subtitle
    const subSize = clampFontSize(data.subtitle, maxW, 2, 26, 18, "'Segoe UI', sans-serif");
    y = drawMultilineText(data.subtitle, W / 2, y, maxW, subSize * 1.4, `${subSize}px 'Segoe UI', sans-serif`, t.accent, "center");
    y += 24;

    // Body
    const bodySize = clampFontSize(data.body, maxW, 5, 26, 18, "'Segoe UI', sans-serif");
    y = drawMultilineText(data.body, W / 2, y, maxW, bodySize * 1.5, `${bodySize}px 'Segoe UI', sans-serif`, t.muted, "center");
    y += 40;

    drawCTAButton(data.cta, y, theme);
    drawFooter(theme);
  }

  function renderQuote(theme, data) {
    const t = THEMES[theme];
    const pad = 120;
    const maxW = W - pad * 2;
    drawBg(theme);

    let y = 180;
    y = drawLogo(y, 140);
    y += 60;

    // Big quote mark
    ctx.font = "180px Georgia, serif";
    ctx.fillStyle = t.accent;
    ctx.globalAlpha = 0.15;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("\u201C", W / 2, y - 30);
    ctx.globalAlpha = 1;
    y += 30;

    // Quote body — italic, auto size
    const bodySize = clampFontSize(data.body, maxW, 6, 40, 24, "'Segoe UI', sans-serif");
    y = drawMultilineText(data.body, W / 2, y, maxW, bodySize * 1.5, `italic ${bodySize}px 'Segoe UI', sans-serif`, t.text, "center");
    y += 40;

    y = drawDivider(y, theme, 60);
    y += 16;

    // Author
    ctx.font = "bold 28px 'Segoe UI', sans-serif";
    ctx.fillStyle = t.accent;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(data.title, W / 2, y);
    y += 40;

    ctx.font = "22px 'Segoe UI', sans-serif";
    ctx.fillStyle = t.muted;
    ctx.fillText(data.subtitle, W / 2, y);
    y += 50;

    drawCTAButton(data.cta, y, theme);
    drawFooter(theme);
  }

  function renderCTA(theme, data) {
    const t = THEMES[theme];
    const pad = 100;
    const maxW = W - pad * 2;
    drawBg(theme);

    let y = 200;
    y = drawLogo(y, 160);
    y += 60;

    // Big title
    const titleSize = clampFontSize(data.title, maxW, 3, 60, 32, "'Segoe UI', sans-serif");
    y = drawMultilineText(data.title, W / 2, y, maxW, titleSize * 1.3, `bold ${titleSize}px 'Segoe UI', sans-serif`, t.text, "center");
    y += 20;

    y = drawDivider(y, theme, 100);
    y += 20;

    // Subtitle
    const subSize = clampFontSize(data.subtitle, maxW, 3, 28, 20, "'Segoe UI', sans-serif");
    y = drawMultilineText(data.subtitle, W / 2, y, maxW, subSize * 1.45, `${subSize}px 'Segoe UI', sans-serif`, t.muted, "center");
    y += 16;

    // Body
    const bodySize = clampFontSize(data.body, maxW, 4, 26, 18, "'Segoe UI', sans-serif");
    y = drawMultilineText(data.body, W / 2, y, maxW, bodySize * 1.5, `${bodySize}px 'Segoe UI', sans-serif`, t.muted, "center");
    y += 50;

    drawCTAButton(data.cta, y, theme, 34);
    y += 90;

    // Contact info with icons
    drawContactBar(y, theme);

    drawFooter(theme);
  }

  // ── Templates & Defaults ────────────────────────────
  const TEMPLATES = { company: renderCompany, service: renderService, quote: renderQuote, cta: renderCTA };

  const DEFAULT_DATA = {
    company: {
      title: "PT DSITU JAYA BERSAMA",
      subtitle: "The Right Partner, The Great Step.",
      body: "General Contractor & Integrated Plantation Services.\nPengembangan perkebunan, rental alat berat, pupuk & agro kimia, konstruksi, dan penangkaran bibit.",
      cta: "Hubungi Kami",
    },
    service: {
      title: "Pengembangan Perkebunan",
      subtitle: "Divisi 01 \u2014 DSJB",
      body: "Survey kawasan, validasi lahan, pengelolaan kebun, dan pekerjaan pengembangan perkebunan secara berkelanjutan.",
      cta: "Pelajari Layanan",
    },
    quote: {
      title: "Manajemen DSJB",
      subtitle: "PT DSITU JAYA BERSAMA",
      body: "Kami percaya bahwa keberhasilan dimulai dari langkah yang tepat, dengan mitra yang tepat.",
      cta: "Jadi Mitra Kami",
    },
    cta: {
      title: "Butuh Kontraktor Terpercaya?",
      subtitle: "DSJB siap mendukung kebutuhan perkebunan, konstruksi, dan operasional lapangan Anda.",
      body: "Lima divisi layanan, satu mitra terpercaya.\nHubungi kami untuk konsultasi dan penawaran.",
      cta: "Hubungi Sekarang",
    },
  };

  // Template label hints
  const LABELS = {
    company: { title: "Nama Perusahaan", subtitle: "Tagline", body: "Deskripsi Layanan", cta: "Tombol Ajakan" },
    service: { title: "Nama Layanan/Divisi", subtitle: "Kategori", body: "Deskripsi Layanan", cta: "Tombol Ajakan" },
    quote: { title: "Nama Pengirim", subtitle: "Jabatan/Perusahaan", body: "Isi Kutipan", cta: "Tombol Ajakan" },
    cta: { title: "Judul Penawaran", subtitle: "Subjudul", body: "Deskripsi", cta: "Teks Tombol" },
  };

  // ── Get Data from Inputs ────────────────────────────
  function getData() {
    return {
      title: document.getElementById("storyTitle").value,
      subtitle: document.getElementById("storySubtitle").value,
      body: document.getElementById("storyBody").value,
      cta: document.getElementById("storyCTA").value,
    };
  }

  function render() {
    const fn = TEMPLATES[currentTemplate];
    if (fn) fn(currentTheme, getData());
  }

  // ── Character Counter ───────────────────────────────
  function updateCounters() {
    const fields = [
      { id: "storyTitle", counterId: "countTitle", max: 60 },
      { id: "storySubtitle", counterId: "countSubtitle", max: 80 },
      { id: "storyBody", counterId: "countBody", max: 200 },
      { id: "storyCTA", counterId: "countCTA", max: 30 },
    ];
    for (const f of fields) {
      const el = document.getElementById(f.id);
      const counter = document.getElementById(f.counterId);
      if (el && counter) {
        const len = el.value.length;
        counter.textContent = `${len}/${f.max}`;
        counter.style.color = len > f.max * 0.9 ? "#f87171" : "";
      }
    }
  }

  // ── Update Labels ───────────────────────────────────
  function updateLabels() {
    const labels = LABELS[currentTemplate];
    if (!labels) return;
    document.getElementById("labelTitle").textContent = labels.title;
    document.getElementById("labelSubtitle").textContent = labels.subtitle;
    document.getElementById("labelBody").textContent = labels.body;
    document.getElementById("labelCTA").textContent = labels.cta;
  }

  // ── Download (mobile-safe) ──────────────────────────
  function downloadStory() {
    // Create high-quality blob
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dsjb-story-${currentTemplate}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png", 1.0);
  }

  // ── Event Listeners ─────────────────────────────────

  // Template buttons
  document.getElementById("templateSelector").addEventListener("click", (e) => {
    const btn = e.target.closest(".template-btn");
    if (!btn) return;
    document.querySelectorAll(".template-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentTemplate = btn.dataset.template;
    const def = DEFAULT_DATA[currentTemplate];
    if (def) {
      document.getElementById("storyTitle").value = def.title;
      document.getElementById("storySubtitle").value = def.subtitle;
      document.getElementById("storyBody").value = def.body;
      document.getElementById("storyCTA").value = def.cta;
    }
    updateLabels();
    updateCounters();
    render();
  });

  // Color swatches
  document.getElementById("colorRow").addEventListener("click", (e) => {
    const swatch = e.target.closest(".color-swatch");
    if (!swatch) return;
    document.querySelectorAll(".color-swatch").forEach((s) => s.classList.remove("active"));
    swatch.classList.add("active");
    currentTheme = swatch.dataset.theme;
    render();
  });

  // Text inputs — live update + counter
  ["storyTitle", "storySubtitle", "storyBody", "storyCTA"].forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener("input", () => { render(); updateCounters(); });
  });

  // Reset button
  document.getElementById("btnReset").addEventListener("click", () => {
    const def = DEFAULT_DATA[currentTemplate];
    if (def) {
      document.getElementById("storyTitle").value = def.title;
      document.getElementById("storySubtitle").value = def.subtitle;
      document.getElementById("storyBody").value = def.body;
      document.getElementById("storyCTA").value = def.cta;
    }
    updateCounters();
    render();
  });

  // Download
  document.getElementById("btnDownload").addEventListener("click", downloadStory);

  // WhatsApp share
  document.getElementById("btnWhatsApp").addEventListener("click", () => {
    const data = getData();
    const text = [
      data.title,
      data.subtitle,
      "",
      data.body.replace(/\n/g, "\n"),
      "",
      "Hubungi: 0813-4841-4190",
      "Email: dsitujayabersama@gmail.com",
      "",
      "https://verrysimatupang99.github.io/dsjb-company-profile/",
    ].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  });

  // Initial state
  updateLabels();
  updateCounters();
  render();

})();
