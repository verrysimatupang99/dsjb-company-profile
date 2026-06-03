/* ============================================
   DSJB Story Generator — Canvas-based 9:16
   Templates: company, service, quote, cta
   Output: 1080×1920 PNG
   ============================================ */

(function () {
  "use strict";

  const W = 1080, H = 1920;
  const canvas = document.getElementById("storyCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // ── Theme Colors ────────────────────────────────────
  const THEMES = {
    green: {
      grad: ["#0e2d45", "#1a5c30", "#2f8f46"],
      accent: "#67b846",
      accentLight: "rgba(103,184,70,.15)",
      text: "#ffffff",
      muted: "#b8d4c4",
    },
    navy: {
      grad: ["#06131c", "#0e2d45", "#145da0"],
      accent: "#67b846",
      accentLight: "rgba(103,184,70,.12)",
      text: "#ffffff",
      muted: "#b8c4c8",
    },
    gold: {
      grad: ["#1a1008", "#3d2810", "#5c3a14"],
      accent: "#d6ad63",
      accentLight: "rgba(214,173,99,.15)",
      text: "#ffffff",
      muted: "#d4c8b0",
    },
    dark: {
      grad: ["#0a0e12", "#1a2430", "#10202b"],
      accent: "#67b846",
      accentLight: "rgba(103,184,70,.1)",
      text: "#ffffff",
      muted: "#8a9a9e",
    },
  };

  let currentTheme = "green";
  let currentTemplate = "company";
  let logoImg = null;

  // Load logo
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => { logoImg = img; render(); };
  img.src = "assets/img/logo-dsjb-fullcolor-whitebg.webp";

  // ── Helper: wrap text ───────────────────────────────
  function wrapText(text, x, y, maxWidth, lineHeight, font, color, align) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align || "left";
    ctx.textBaseline = "top";
    const words = text.split(" ");
    let line = "";
    let curY = y;
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
    ctx.fillText(line.trim(), x, curY);
    return curY + lineHeight;
  }

  // ── Helper: rounded rect ────────────────────────────
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

  // ── Draw Background ─────────────────────────────────
  function drawBg(theme) {
    const t = THEMES[theme];
    const grad = ctx.createLinearGradient(0, 0, W * 0.4, H);
    t.grad.forEach((c, i) => grad.addColorStop(i / (t.grad.length - 1), c));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Decorative circles
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = t.accent;
    ctx.beginPath();
    ctx.arc(W * 0.85, H * 0.15, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W * 0.1, H * 0.75, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // ── Draw Logo ───────────────────────────────────────
  function drawLogo(y) {
    if (!logoImg) return;
    const lw = 200, lh = (logoImg.height / logoImg.width) * lw;
    ctx.globalAlpha = 0.9;
    ctx.drawImage(logoImg, W / 2 - lw / 2, y, lw, lh);
    ctx.globalAlpha = 1;
    return y + lh + 20;
  }

  // ── Draw Divider Line ───────────────────────────────
  function drawDivider(y, theme) {
    const t = THEMES[theme];
    ctx.fillStyle = t.accent;
    ctx.fillRect(W / 2 - 40, y, 80, 3);
    return y + 30;
  }

  // ── Draw CTA Button ─────────────────────────────────
  function drawCTA(text, y, theme) {
    const t = THEMES[theme];
    const bw = 480, bh = 72, bx = (W - bw) / 2;
    roundRect(bx, y, bw, bh, 36);
    ctx.fillStyle = t.accent;
    ctx.fill();
    ctx.font = "bold 30px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, W / 2, y + bh / 2);
    return y + bh + 30;
  }

  // ── Draw Footer Bar ─────────────────────────────────
  function drawFooter(theme) {
    const t = THEMES[theme];
    // Bottom gradient fade
    const fadeGrad = ctx.createLinearGradient(0, H - 200, 0, H);
    fadeGrad.addColorStop(0, "transparent");
    fadeGrad.addColorStop(1, "rgba(0,0,0,.4)");
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(0, H - 200, W, 200);

    // Footer text
    ctx.font = "24px 'Segoe UI', sans-serif";
    ctx.fillStyle = t.muted;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("dsitujayabersama@gmail.com  ·  0813-4841-4190", W / 2, H - 60);
    ctx.fillText("Kalimantan Selatan", W / 2, H - 28);
  }

  // ── TEMPLATE: Company Profile ───────────────────────
  function renderCompany(theme, data) {
    const t = THEMES[theme];
    drawBg(theme);

    // Top accent bar
    ctx.fillStyle = t.accent;
    ctx.fillRect(0, 0, W, 8);

    let y = 180;
    y = drawLogo(y);
    y += 60;

    // Tagline
    ctx.font = "bold 28px 'Segoe UI', sans-serif";
    ctx.fillStyle = t.accent;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("THE RIGHT PARTNER, THE GREAT STEP.", W / 2, y);
    y += 70;

    y = drawDivider(y, theme);
    y += 20;

    // Title
    y = wrapText(data.title, W / 2, y, W - 160, 68, "bold 56px 'Segoe UI', sans-serif", t.text, "center");
    y += 20;

    // Subtitle
    y = wrapText(data.subtitle, W / 2, y, W - 200, 42, "28px 'Segoe UI', sans-serif", t.muted, "center");
    y += 30;

    // Body
    y = wrapText(data.body, W / 2, y, W - 200, 40, "26px 'Segoe UI', sans-serif", t.muted, "center");
    y += 50;

    // CTA
    drawCTA(data.cta, y, theme);

    drawFooter(theme);
  }

  // ── TEMPLATE: Service Highlight ─────────────────────
  function renderService(theme, data) {
    const t = THEMES[theme];
    drawBg(theme);

    ctx.fillStyle = t.accent;
    ctx.fillRect(0, 0, W, 8);

    let y = 120;
    y = drawLogo(y);
    y += 50;

    // "LAYANAN KAMI" badge
    const badgeW = 320, badgeH = 50, badgeX = (W - badgeW) / 2;
    roundRect(badgeX, y, badgeW, badgeH, 25);
    ctx.fillStyle = t.accentLight;
    ctx.fill();
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = "bold 22px 'Segoe UI', sans-serif";
    ctx.fillStyle = t.accent;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("LAYANAN KAMI", W / 2, y + badgeH / 2);
    y += badgeH + 50;

    // Service icon area (decorative)
    const iconSize = 120;
    const iconX = W / 2 - iconSize / 2;
    roundRect(iconX, y, iconSize, iconSize, 20);
    ctx.fillStyle = t.accentLight;
    ctx.fill();
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 3;
    ctx.stroke();
    // Simple leaf icon
    ctx.font = "60px serif";
    ctx.fillStyle = t.accent;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🌱", W / 2, y + iconSize / 2);
    y += iconSize + 50;

    // Title
    y = wrapText(data.title, W / 2, y, W - 160, 64, "bold 52px 'Segoe UI', sans-serif", t.text, "center");
    y += 20;

    // Subtitle
    y = wrapText(data.subtitle, W / 2, y, W - 200, 40, "26px 'Segoe UI', sans-serif", t.muted, "center");
    y += 30;

    // Body
    y = wrapText(data.body, W / 2, y, W - 200, 38, "24px 'Segoe UI', sans-serif", t.muted, "center");
    y += 50;

    drawCTA(data.cta, y, theme);
    drawFooter(theme);
  }

  // ── TEMPLATE: Quote / Motto ─────────────────────────
  function renderQuote(theme, data) {
    const t = THEMES[theme];
    drawBg(theme);

    ctx.fillStyle = t.accent;
    ctx.fillRect(0, 0, W, 8);

    let y = 200;
    y = drawLogo(y);
    y += 80;

    // Big quote mark
    ctx.font = "200px Georgia, serif";
    ctx.fillStyle = t.accent;
    ctx.globalAlpha = 0.2;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("\u201C", W / 2, y - 40);
    ctx.globalAlpha = 1;
    y += 40;

    // Quote text (the body)
    y = wrapText(data.body, W / 2, y, W - 200, 56, "italic 42px 'Segoe UI', sans-serif", t.text, "center");
    y += 50;

    y = drawDivider(y, theme);
    y += 20;

    // Author (title = name, subtitle = role)
    ctx.font = "bold 30px 'Segoe UI', sans-serif";
    ctx.fillStyle = t.accent;
    ctx.textAlign = "center";
    ctx.fillText(data.title, W / 2, y);
    y += 44;

    ctx.font = "24px 'Segoe UI', sans-serif";
    ctx.fillStyle = t.muted;
    ctx.fillText(data.subtitle, W / 2, y);
    y += 60;

    drawCTA(data.cta, y, theme);
    drawFooter(theme);
  }

  // ── TEMPLATE: CTA / Ajakan ──────────────────────────
  function renderCTA(theme, data) {
    const t = THEMES[theme];
    drawBg(theme);

    ctx.fillStyle = t.accent;
    ctx.fillRect(0, 0, W, 8);

    let y = 250;
    y = drawLogo(y);
    y += 80;

    // Big title
    y = wrapText(data.title, W / 2, y, W - 140, 80, "bold 64px 'Segoe UI', sans-serif", t.text, "center");
    y += 30;

    y = drawDivider(y, theme);
    y += 30;

    // Subtitle
    y = wrapText(data.subtitle, W / 2, y, W - 200, 44, "30px 'Segoe UI', sans-serif", t.muted, "center");
    y += 30;

    // Body
    y = wrapText(data.body, W / 2, y, W - 200, 40, "26px 'Segoe UI', sans-serif", t.muted, "center");
    y += 60;

    // CTA button (bigger)
    const bw = 560, bh = 84, bx = (W - bw) / 2;
    roundRect(bx, y, bw, bh, 42);
    ctx.fillStyle = t.accent;
    ctx.fill();
    ctx.font = "bold 34px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(data.cta, W / 2, y + bh / 2);
    y += bh + 30;

    // Contact info
    ctx.font = "26px 'Segoe UI', sans-serif";
    ctx.fillStyle = t.muted;
    ctx.textAlign = "center";
    ctx.fillText("📞 0813-4841-4190", W / 2, y);
    y += 40;
    ctx.fillText("✉ dsitujayabersama@gmail.com", W / 2, y);
    y += 40;
    ctx.fillText("📍 Tanah Bumbu, Kalimantan Selatan", W / 2, y);

    drawFooter(theme);
  }

  // ── Render Dispatcher ───────────────────────────────
  const TEMPLATES = {
    company: renderCompany,
    service: renderService,
    quote: renderQuote,
    cta: renderCTA,
  };

  const DEFAULT_DATA = {
    company: {
      title: "PT DSITU JAYA BERSAMA",
      subtitle: "The Right Partner, The Great Step.",
      body: "General Contractor & Integrated Plantation Services. Pengembangan perkebunan, rental alat berat, pupuk & agro kimia, konstruksi, dan penangkaran bibit.",
      cta: "Hubungi Kami",
    },
    service: {
      title: "Pengembangan Perkebunan",
      subtitle: "Divisi 01 — DSJB",
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
      body: "Lima divisi layanan, satu mitra terpercaya. Hubungi kami untuk konsultasi dan penawaran.",
      cta: "Hubungi Sekarang",
    },
  };

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

  // ── Event Listeners ─────────────────────────────────

  // Template buttons
  document.getElementById("templateSelector").addEventListener("click", (e) => {
    const btn = e.target.closest(".template-btn");
    if (!btn) return;
    document.querySelectorAll(".template-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentTemplate = btn.dataset.template;

    // Load default data for template
    const def = DEFAULT_DATA[currentTemplate];
    if (def) {
      document.getElementById("storyTitle").value = def.title;
      document.getElementById("storySubtitle").value = def.subtitle;
      document.getElementById("storyBody").value = def.body;
      document.getElementById("storyCTA").value = def.cta;
    }
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

  // Text inputs — live update
  ["storyTitle", "storySubtitle", "storyBody", "storyCTA"].forEach((id) => {
    document.getElementById(id).addEventListener("input", render);
  });

  // Download button
  document.getElementById("btnDownload").addEventListener("click", () => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dsjb-story-${currentTemplate}-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  });

  // WhatsApp share
  document.getElementById("btnWhatsApp").addEventListener("click", () => {
    const data = getData();
    const text = `🏢 *${data.title}*\n${data.subtitle}\n\n${data.body}\n\n📞 0813-4841-4190\n✉ dsitujayabersama@gmail.com\n\n🌐 https://verrysimatupang99.github.io/dsjb-company-profile/`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  });

  // Initial render
  render();

})();
