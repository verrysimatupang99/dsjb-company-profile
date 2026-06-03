/* ============================================
   DSJB Story Generator v3 — Canvas 1080×1920
   Fully dynamic layout, overflow-safe, cross-browser
   ============================================ */
(function () {
  "use strict";

  const W = 1080, H = 1920;
  const canvas = document.getElementById("storyCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // ── State ───────────────────────────────────────────
  let theme = "green";
  let template = "company";
  let logoImg = null;
  let logoReady = false;
  const FONT = "'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif";

  // ── Themes ──────────────────────────────────────────
  const THEMES = {
    green:  { bg: ["#061a0e","#0a2e18","#155c2e","#2f8f46"], accent: "#67b846", accentDark: "#2a7a3c", text: "#fff", muted: "#b0d4be", dim: "rgba(103,184,70,.08)" },
    navy:   { bg: ["#020a14","#081828","#0e3050","#1a60a8"], accent: "#50b0f0", accentDark: "#145da0", text: "#fff", muted: "#a8c4dc", dim: "rgba(80,176,240,.08)" },
    gold:   { bg: ["#0e0804","#1c1208","#3a2410","#6a4418"], accent: "#e0b860", accentDark: "#b08030", text: "#fff", muted: "#d8ccb0", dim: "rgba(224,184,96,.08)" },
    dark:   { bg: ["#06080a","#0e1418","#18242c","#243840"], accent: "#67b846", accentDark: "#2a7a3c", text: "#fff", muted: "#889ca4", dim: "rgba(103,184,70,.06)" },
  };

  // ── Load Logo ───────────────────────────────────────
  function loadLogo() {
    const img = new Image();
    img.onload = () => { logoImg = img; logoReady = true; render(); };
    img.onerror = () => { logoReady = true; render(); }; // still render, just without logo
    img.src = "assets/img/logo-dsjb-fullcolor-whitebg.webp";
  }
  loadLogo();

  // ── Core: Layout Tracker ────────────────────────────
  // All rendering uses this to track Y position dynamically
  const L = {
    y: 0,
    marginX: 100,
    maxW() { return W - this.marginX * 2; },
    reset(startY) { this.y = startY; },
    add(px) { this.y += px; return this.y; },
    remaining() { return H - this.y - 140; }, // 140px footer reserve
  };

  // ── Drawing Primitives ──────────────────────────────

  function fillBg(th) {
    const t = THEMES[th];
    const g = ctx.createLinearGradient(0, 0, W * 0.35, H);
    t.bg.forEach((c, i) => g.addColorStop(i / (t.bg.length - 1), c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function fillDecorations(th) {
    const t = THEMES[th];
    // Circles
    ctx.save();
    ctx.globalAlpha = 0.025;
    ctx.fillStyle = t.accent;
    ctx.beginPath(); ctx.arc(W * 0.82, H * 0.1, 340, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W * 0.12, H * 0.72, 240, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W * 0.5, H * 0.45, 480, 0, Math.PI * 2); ctx.fill();
    // Diagonal lines
    ctx.globalAlpha = 0.015;
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 1;
    for (let i = -H; i < W + H; i += 80) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke();
    }
    ctx.restore();
  }

  function fillAccentBars(th) {
    const t = THEMES[th];
    ctx.fillStyle = t.accent;
    ctx.fillRect(0, 0, W, 5);
    ctx.fillStyle = t.accentDark;
    ctx.fillRect(0, H - 5, W, 5);
  }

  function drawBgFull(th) {
    fillBg(th);
    fillDecorations(th);
    fillAccentBars(th);
  }

  function drawLogoScaled(size) {
    if (!logoImg) return 0;
    const lw = size;
    const lh = (logoImg.height / logoImg.width) * lw;
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.drawImage(logoImg, W / 2 - lw / 2, L.y, lw, lh);
    ctx.restore();
    L.add(lh + 20);
    return lh + 20;
  }

  function drawBadge(text, th) {
    const t = THEMES[th];
    ctx.font = `bold 21px ${FONT}`;
    const tw = ctx.measureText(text).width;
    const bw = tw + 50, bh = 42, bx = (W - bw) / 2;
    ctx.save();
    roundRect(bx, L.y, bw, bh, 21);
    ctx.fillStyle = t.dim;
    ctx.fill();
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = t.accent;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, W / 2, L.y + bh / 2);
    ctx.restore();
    L.add(bh + 24);
  }

  function drawDividerLine(th, width) {
    const t = THEMES[th];
    const w = width || 80;
    ctx.fillStyle = t.accent;
    roundRect(W / 2 - w / 2, L.y, w, 3, 1.5);
    ctx.fill();
    L.add(24);
  }

  function drawTextBlock(text, size, weight, color, align, maxLines) {
    if (!text || !text.trim()) return;
    maxLines = maxLines || 99;
    const maxW = L.maxW();
    const lineHeight = size * 1.35;
    const fontStr = `${weight || ""} ${size}px ${FONT}`.trim();

    ctx.font = fontStr;
    ctx.fillStyle = color;
    ctx.textAlign = align || "center";
    ctx.textBaseline = "top";

    const paragraphs = text.split("\n");
    let lineCount = 0;

    for (const para of paragraphs) {
      if (lineCount >= maxLines) break;
      if (para.trim() === "") { L.add(lineHeight * 0.4); continue; }
      const words = para.split(/\s+/);
      let line = "";
      for (const word of words) {
        if (lineCount >= maxLines) break;
        const test = line ? line + " " + word : word;
        if (ctx.measureText(test).width > maxW && line) {
          const x = align === "center" ? W / 2 : L.marginX;
          ctx.fillText(line, x, L.y);
          L.add(lineHeight);
          lineCount++;
          line = word;
        } else {
          line = test;
        }
      }
      if (line && lineCount < maxLines) {
        const x = align === "center" ? W / 2 : L.marginX;
        ctx.fillText(line, x, L.y);
        L.add(lineHeight);
        lineCount++;
      }
    }
  }

  function drawCTAButton(text, th, size) {
    const t = THEMES[th];
    const fs = size || 30;
    ctx.font = `bold ${fs}px ${FONT}`;
    const tw = ctx.measureText(text).width;
    const bw = Math.max(tw + 80, 340);
    const bh = fs * 2 + 16;
    const bx = (W - bw) / 2;
    const by = L.y;

    ctx.save();
    // Shadow
    ctx.shadowColor = "rgba(0,0,0,.25)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;
    // Button shape
    roundRect(bx, by, bw, bh, bh / 2);
    const btnGrad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    btnGrad.addColorStop(0, t.accent);
    btnGrad.addColorStop(1, t.accentDark);
    ctx.fillStyle = btnGrad;
    ctx.fill();
    ctx.restore();

    // Text
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${fs}px ${FONT}`;
    ctx.fillText(text, W / 2, by + bh / 2);
    L.add(bh + 20);
  }

  function drawContactItems(th) {
    const t = THEMES[th];
    const items = [
      ["0813-4841-4190", "Telp/WhatsApp"],
      ["dsitujayabersama@gmail.com", "Email"],
      ["Tanah Bumbu, Kalimantan Selatan", "Lokasi"],
    ];
    for (const [val, label] of items) {
      ctx.font = `600 20px ${FONT}`;
      ctx.fillStyle = t.accent;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(label.toUpperCase(), L.marginX, L.y);
      ctx.font = `22px ${FONT}`;
      ctx.fillStyle = t.muted;
      ctx.fillText(val, L.marginX + 180, L.y);
      L.add(40);
    }
  }

  function drawFooter(th) {
    const t = THEMES[th];
    // Fade
    const fade = ctx.createLinearGradient(0, H - 120, 0, H);
    fade.addColorStop(0, "rgba(0,0,0,0)");
    fade.addColorStop(1, "rgba(0,0,0,.35)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, H - 120, W, 120);
    // Website
    ctx.font = `500 18px ${FONT}`;
    ctx.fillStyle = t.muted;
    ctx.globalAlpha = 0.5;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("dsjb-company-profile  ·  PT DSITU JAYA BERSAMA", W / 2, H - 28);
    ctx.globalAlpha = 1;
  }

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

  // ── Auto font size: find largest that fits maxLines ──
  function autoSize(text, maxSize, minSize, maxLines) {
    const maxW = L.maxW();
    for (let s = maxSize; s >= minSize; s -= 2) {
      ctx.font = `bold ${s}px ${FONT}`;
      // Count wrapped lines
      let lines = 0;
      for (const para of text.split("\n")) {
        if (!para.trim()) { lines += 0.4; continue; }
        let line = "";
        for (const word of para.split(/\s+/)) {
          const test = line ? line + " " + word : word;
          if (ctx.measureText(test).width > maxW && line) { lines++; line = word; }
          else { line = test; }
        }
        if (line) lines++;
      }
      if (lines <= maxLines) return s;
    }
    return minSize;
  }

  // ═══════════════════════════════════════════════════
  //  TEMPLATES
  // ═══════════════════════════════════════════════════

  function renderCompany(th, d) {
    const t = THEMES[th];
    drawBgFull(th);
    L.reset(130);
    drawLogoScaled(160);
    L.add(30);

    // Tagline
    ctx.font = `bold 24px ${FONT}`;
    ctx.fillStyle = t.accent;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("THE RIGHT PARTNER, THE GREAT STEP.", W / 2, L.y);
    L.add(44);
    drawDividerLine(th, 120);
    L.add(10);

    // Title
    const ts = autoSize(d.title, 58, 30, 3);
    drawTextBlock(d.title, ts, "bold", t.text, "center", 3);
    L.add(12);

    // Subtitle
    const ss = autoSize(d.subtitle, 28, 18, 2);
    drawTextBlock(d.subtitle, ss, "500", t.muted, "center", 2);
    L.add(24);

    // Body
    const bs = autoSize(d.body, 26, 16, 6);
    drawTextBlock(d.body, bs, "normal", t.muted, "center", 6);
    L.add(40);

    if (L.remaining() > 80) drawCTAButton(d.cta, th);
    drawFooter(th);
  }

  function renderService(th, d) {
    const t = THEMES[th];
    drawBgFull(th);
    L.reset(90);
    drawLogoScaled(130);
    L.add(20);
    drawBadge("LAYANAN KAMI", th);

    // Icon box
    const boxSize = 100;
    const bx = W / 2 - boxSize / 2;
    roundRect(bx, L.y, boxSize, boxSize, 18);
    ctx.fillStyle = t.dim;
    ctx.fill();
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Leaf shape inside
    ctx.save();
    ctx.translate(W / 2, L.y + boxSize / 2);
    ctx.fillStyle = t.accent;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 38, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 28);
    ctx.quadraticCurveTo(0, -10, -16, -28);
    ctx.moveTo(0, 28);
    ctx.quadraticCurveTo(4, 0, 20, -20);
    ctx.stroke();
    ctx.restore();
    L.add(boxSize + 36);

    // Title
    const ts = autoSize(d.title, 52, 26, 3);
    drawTextBlock(d.title, ts, "bold", t.text, "center", 3);
    L.add(8);

    // Subtitle
    const ss = autoSize(d.subtitle, 26, 16, 2);
    drawTextBlock(d.subtitle, ss, "600", t.accent, "center", 2);
    L.add(20);

    // Body
    const bs = autoSize(d.body, 26, 16, 5);
    drawTextBlock(d.body, bs, "normal", t.muted, "center", 5);
    L.add(36);

    if (L.remaining() > 80) drawCTAButton(d.cta, th);
    drawFooter(th);
  }

  function renderQuote(th, d) {
    const t = THEMES[th];
    drawBgFull(th);
    L.reset(160);
    drawLogoScaled(130);
    L.add(50);

    // Big quote mark
    ctx.font = `180px Georgia, 'Times New Roman', serif`;
    ctx.fillStyle = t.accent;
    ctx.globalAlpha = 0.12;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("\u201C", W / 2, L.y - 20);
    ctx.globalAlpha = 1;
    L.add(60);

    // Quote body
    const bs = autoSize(d.body, 42, 22, 5);
    drawTextBlock(d.body, bs, "normal", t.text, "center", 5);
    // Override font to italic
    ctx.font = `italic ${bs}px ${FONT}`;
    ctx.fillStyle = t.text;
    ctx.textAlign = "center";
    L.add(30);

    drawDividerLine(th, 60);
    L.add(6);

    // Author name
    ctx.font = `bold 28px ${FONT}`;
    ctx.fillStyle = t.accent;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(d.title, W / 2, L.y);
    L.add(38);

    // Author role
    ctx.font = `22px ${FONT}`;
    ctx.fillStyle = t.muted;
    ctx.fillText(d.subtitle, W / 2, L.y);
    L.add(40);

    if (L.remaining() > 80) drawCTAButton(d.cta, th);
    drawFooter(th);
  }

  function renderCTA(th, d) {
    const t = THEMES[th];
    drawBgFull(th);
    L.reset(170);
    drawLogoScaled(150);
    L.add(40);

    // Title
    const ts = autoSize(d.title, 62, 30, 3);
    drawTextBlock(d.title, ts, "bold", t.text, "center", 3);
    L.add(16);
    drawDividerLine(th, 100);

    // Subtitle
    const ss = autoSize(d.subtitle, 28, 18, 3);
    drawTextBlock(d.subtitle, ss, "500", t.muted, "center", 3);
    L.add(12);

    // Body
    const bs = autoSize(d.body, 26, 16, 4);
    drawTextBlock(d.body, bs, "normal", t.muted, "center", 4);
    L.add(40);

    if (L.remaining() > 160) {
      drawCTAButton(d.cta, th, 34);
      L.add(20);
    }

    if (L.remaining() > 140) drawContactItems(th);
    drawFooter(th);
  }

  // ── Render Dispatcher ───────────────────────────────
  const TEMPLATES = { company: renderCompany, service: renderService, quote: renderQuote, cta: renderCTA };

  function getData() {
    return {
      title:   document.getElementById("storyTitle").value || "PT DSITU JAYA BERSAMA",
      subtitle:document.getElementById("storySubtitle").value || "The Right Partner, The Great Step.",
      body:    document.getElementById("storyBody").value || "",
      cta:     document.getElementById("storyCTA").value || "Hubungi Kami",
    };
  }

  function render() {
    const fn = TEMPLATES[template];
    if (fn) fn(theme, getData());
  }

  // ── Defaults per template ───────────────────────────
  const DEFAULTS = {
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

  const LABELS = {
    company: { t: "Nama Perusahaan", s: "Tagline", b: "Deskripsi Layanan", c: "Tombol Ajakan" },
    service: { t: "Nama Layanan/Divisi", s: "Kategori", b: "Deskripsi Layanan", c: "Tombol Ajakan" },
    quote:   { t: "Nama Pengirim", s: "Jabatan/Perusahaan", b: "Isi Kutipan", c: "Tombol Ajakan" },
    cta:     { t: "Judul Penawaran", s: "Subjudul", b: "Deskripsi", c: "Teks Tombol" },
  };

  function updateLabels() {
    const l = LABELS[template];
    if (!l) return;
    document.getElementById("labelTitle").textContent = l.t;
    document.getElementById("labelSubtitle").textContent = l.s;
    document.getElementById("labelBody").textContent = l.b;
    document.getElementById("labelCTA").textContent = l.c;
  }

  function updateCounters() {
    [{ id: "storyTitle", c: "countTitle", max: 60 },
     { id: "storySubtitle", c: "countSubtitle", max: 80 },
     { id: "storyBody", c: "countBody", max: 200 },
     { id: "storyCTA", c: "countCTA", max: 30 }].forEach(({ id, c, max }) => {
      const el = document.getElementById(id);
      const ct = document.getElementById(c);
      if (el && ct) {
        const n = el.value.length;
        ct.textContent = n + "/" + max;
        ct.style.color = n > max * 0.9 ? "#f87171" : "";
      }
    });
  }

  // ── Event Wiring ────────────────────────────────────

  // Template selector
  document.getElementById("templateSelector").addEventListener("click", (e) => {
    const btn = e.target.closest(".template-btn");
    if (!btn) return;
    document.querySelectorAll(".template-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    template = btn.dataset.template;
    const def = DEFAULTS[template];
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
    const sw = e.target.closest(".color-swatch");
    if (!sw) return;
    document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("active"));
    sw.classList.add("active");
    theme = sw.dataset.theme;
    render();
  });

  // Live input
  ["storyTitle", "storySubtitle", "storyBody", "storyCTA"].forEach(id => {
    document.getElementById(id).addEventListener("input", () => { render(); updateCounters(); });
  });

  // Reset
  document.getElementById("btnReset").addEventListener("click", () => {
    const def = DEFAULTS[template];
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
  document.getElementById("btnDownload").addEventListener("click", () => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dsjb-story-" + template + ".png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, "image/png", 1.0);
  });

  // WhatsApp
  document.getElementById("btnWhatsApp").addEventListener("click", () => {
    const d = getData();
    const msg = [
      d.title, d.subtitle, "",
      d.body, "",
      "Hubungi: 0813-4841-4190",
      "Email: dsitujayabersama@gmail.com", "",
      "https://verrysimatupang99.github.io/dsjb-company-profile/",
    ].join("\n");
    window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
  });

  // Init
  updateLabels();
  updateCounters();
  render();

})();
