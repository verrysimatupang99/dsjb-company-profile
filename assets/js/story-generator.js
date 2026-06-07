/* ============================================
   DSJB Story Generator v5
   Preview canvas = display size (crisp)
   Export canvas = 1080×1920 offscreen (high-res)
   Font: system stack with fallback
   ============================================ */
(function () {
  "use strict";

  const EXPORT_W = 1080, EXPORT_H = 1920;
  const FONT = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  const canvas = document.getElementById("storyCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Offscreen export canvas
  const off = document.createElement("canvas");
  off.width = EXPORT_W;
  off.height = EXPORT_H;
  const octx = off.getContext("2d");

  let theme = "green";
  let template = "company";
  let logoImg = null;

  // ── Themes ──────────────────────────────────────────
  const THEMES = {
    green: { bg: ["#061a0e","#0a2e18","#155c2e","#2f8f46"], accent: "#67b846", accentDark: "#2a7a3c", text: "#fff", muted: "#b0d4be", dim: "rgba(103,184,70,.08)" },
    navy:  { bg: ["#020a14","#081828","#0e3050","#1a60a8"], accent: "#50b0f0", accentDark: "#145da0", text: "#fff", muted: "#a8c4dc", dim: "rgba(80,176,240,.08)" },
    gold:  { bg: ["#0e0804","#1c1208","#3a2410","#6a4418"], accent: "#e0b860", accentDark: "#b08030", text: "#fff", muted: "#d8ccb0", dim: "rgba(224,184,96,.08)" },
    dark:  { bg: ["#06080a","#0e1418","#18242c","#243840"], accent: "#67b846", accentDark: "#2a7a3c", text: "#fff", muted: "#889ca4", dim: "rgba(103,184,70,.06)" },
  };

  // ── Load Logo ───────────────────────────────────────
  function loadLogo() {
    const img = new Image();
    img.onload = () => { logoImg = img; render(); };
    img.onerror = () => { logoImg = null; };
    img.src = "assets/img/logo-dsjb-fullcolor-whitebg.webp";
  }
  loadLogo();

  // ── Canvas fixed at export resolution ───────────────
  // CSS scales display; canvas coordinates stay at 1080×1920
  function sizeCanvas() {
    if (canvas.width !== EXPORT_W || canvas.height !== EXPORT_H) {
      canvas.width = EXPORT_W;
      canvas.height = EXPORT_H;
    }
    return { w: EXPORT_W, h: EXPORT_H };
  }

  // ── Layout tracker (works with any size) ────────────
  function L(W, H) {
    this.W = W;
    this.H = H;
    this.mx = Math.round(W * 0.09);
    this.y = 0;
  }
  L.prototype.contentW = function() { return this.W - this.mx * 2; };
  L.prototype.reset = function(y) { this.y = y; };
  L.prototype.add = function(px) { this.y += px; return this.y; };
  L.prototype.space = function() { return this.H - this.y - this.H * 0.07; };

  // ── Drawing helpers ─────────────────────────────────

  function drawBg(c, l, th) {
    const t = THEMES[th];
    const g = c.createLinearGradient(0, 0, l.W * 0.3, l.H);
    t.bg.forEach((clr, i) => g.addColorStop(i / (t.bg.length - 1), clr));
    c.fillStyle = g;
    c.fillRect(0, 0, l.W, l.H);

    // Decorative circles
    c.save();
    c.globalAlpha = 0.025;
    c.fillStyle = t.accent;
    [[.82,.1,.3],[.12,.72,.2],[.5,.45,.42]].forEach(([cx,cy,r]) => {
      c.beginPath();
      c.arc(l.W*cx, l.H*cy, l.W*r, 0, Math.PI*2);
      c.fill();
    });
    c.restore();

    // Diagonal lines
    c.save();
    c.globalAlpha = 0.012;
    c.strokeStyle = t.accent;
    c.lineWidth = 1;
    const step = l.W * 0.07;
    for (let i = -l.H; i < l.W + l.H; i += step) {
      c.beginPath(); c.moveTo(i, 0); c.lineTo(i + l.H, l.H); c.stroke();
    }
    c.restore();

    // Accent bars
    const barH = Math.max(2, l.W * 0.005);
    c.fillStyle = t.accent;
    c.fillRect(0, 0, l.W, barH);
    c.fillStyle = t.accentDark;
    c.fillRect(0, l.H - barH, l.W, barH);
  }

  function drawLogo(c, l) {
    if (!logoImg) return;
    const lw = l.W * 0.16;
    const lh = (logoImg.height / logoImg.width) * lw;
    c.save();
    c.globalAlpha = 0.92;
    c.drawImage(logoImg, l.W / 2 - lw / 2, l.y, lw, lh);
    c.restore();
    l.add(lh + l.W * 0.02);
  }

  function drawBadge(c, l, text, th) {
    const t = THEMES[th];
    const fs = Math.round(l.W * 0.02);
    c.font = `bold ${fs}px ${FONT}`;
    const tw = c.measureText(text.toUpperCase()).width;
    const pad = fs * 2.5;
    const bw = tw + pad * 2;
    const bh = fs * 2.2;
    const bx = (l.W - bw) / 2;
    c.save();
    roundRect(c, bx, l.y, bw, bh, bh / 2);
    c.fillStyle = t.dim;
    c.fill();
    c.strokeStyle = t.accent;
    c.lineWidth = Math.max(1, l.W * 0.002);
    c.stroke();
    c.fillStyle = t.accent;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text.toUpperCase(), l.W / 2, l.y + bh / 2);
    c.restore();
    l.add(bh + l.W * 0.025);
  }

  function drawDivider(c, l, th, widthRatio) {
    const t = THEMES[th];
    const w = l.W * (widthRatio || 0.07);
    c.fillStyle = t.accent;
    roundRect(c, l.W / 2 - w / 2, l.y, w, Math.max(2, l.W * 0.003), 1);
    c.fill();
    l.add(l.W * 0.022);
  }

  function drawText(c, l, text, size, weight, color, align, maxLines) {
    if (!text || !text.trim()) return;
    align = align || "center";
    maxLines = maxLines || 99;
    const maxW = l.contentW();
    const lh = size * 1.35;
    const fontStr = (weight ? weight + " " : "") + size + "px " + FONT;
    c.font = fontStr;
    c.fillStyle = color;
    c.textAlign = align;
    c.textBaseline = "top";
    const x = align === "center" ? l.W / 2 : l.mx;
    let lines = 0;

    for (const para of text.split("\n")) {
      if (lines >= maxLines) break;
      if (!para.trim()) { l.add(lh * 0.4); continue; }
      let line = "";
      for (const word of para.split(/\s+/)) {
        if (lines >= maxLines) break;
        const test = line ? line + " " + word : word;
        if (c.measureText(test).width > maxW && line) {
          c.fillText(line, x, l.y);
          l.add(lh);
          lines++;
          line = word;
        } else {
          line = test;
        }
      }
      if (line && lines < maxLines) {
        c.fillText(line, x, l.y);
        l.add(lh);
        lines++;
      }
    }
  }

  function autoSize(c, text, maxW, maxSize, minSize, maxLines) {
    for (let s = maxSize; s >= minSize; s -= Math.max(1, Math.round((maxSize - minSize) / 15))) {
      c.font = `bold ${s}px ${FONT}`;
      let lines = 0;
      for (const para of text.split("\n")) {
        if (!para.trim()) { lines += 0.4; continue; }
        let line = "";
        for (const word of para.split(/\s+/)) {
          const test = line ? line + " " + word : word;
          if (c.measureText(test).width > maxW && line) { lines++; line = word; }
          else { line = test; }
        }
        if (line) lines++;
      }
      if (lines <= maxLines) return s;
    }
    return minSize;
  }

  function drawCTA(c, l, text, th, sizeRatio) {
    const t = THEMES[th];
    const fs = Math.round(l.W * (sizeRatio || 0.028));
    c.font = `bold ${fs}px ${FONT}`;
    const tw = c.measureText(text).width;
    const bw = Math.max(tw + fs * 2.5, l.W * 0.35);
    const bh = fs * 2.2;
    const bx = (l.W - bw) / 2;
    c.save();
    c.shadowColor = "rgba(0,0,0,.2)";
    c.shadowBlur = l.W * 0.015;
    c.shadowOffsetY = l.W * 0.004;
    roundRect(c, bx, l.y, bw, bh, bh / 2);
    const btnG = c.createLinearGradient(bx, l.y, bx + bw, l.y + bh);
    btnG.addColorStop(0, t.accent);
    btnG.addColorStop(1, t.accentDark);
    c.fillStyle = btnG;
    c.fill();
    c.restore();
    c.fillStyle = "#fff";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = `bold ${fs}px ${FONT}`;
    c.fillText(text, l.W / 2, l.y + bh / 2);
    l.add(bh + l.W * 0.02);
  }

  function drawContact(c, l, th) {
    const t = THEMES[th];
    const items = [
      ["0813-4841-4190", "TELP / WA"],
      ["dsitujayabersama@gmail.com", "EMAIL"],
      ["Tanah Bumbu, Kalimantan Selatan", "LOKASI"],
    ];
    const fs = Math.round(l.W * 0.019);
    const labelFs = Math.round(fs * 0.85);
    const lineH = fs * 2.2;
    for (const [val, label] of items) {
      c.font = `600 ${labelFs}px ${FONT}`;
      c.fillStyle = t.accent;
      c.textAlign = "left";
      c.textBaseline = "top";
      c.fillText(label, l.mx, l.y);
      c.font = `${fs}px ${FONT}`;
      c.fillStyle = t.muted;
      c.fillText(val, l.mx + labelFs * 5.5, l.y);
      l.add(lineH);
    }
  }

  function drawFooter(c, l, th) {
    const t = THEMES[th];
    const fadeH = l.H * 0.08;
    const fade = c.createLinearGradient(0, l.H - fadeH, 0, l.H);
    fade.addColorStop(0, "rgba(0,0,0,0)");
    fade.addColorStop(1, "rgba(0,0,0,.35)");
    c.fillStyle = fade;
    c.fillRect(0, l.H - fadeH, l.W, fadeH);
    c.font = `${Math.round(l.W * 0.017)}px ${FONT}`;
    c.fillStyle = t.muted;
    c.globalAlpha = 0.5;
    c.textAlign = "center";
    c.textBaseline = "bottom";
    c.fillText("dsjb-company-profile  \u00b7  PT DSITU JAYA BERSAMA", l.W / 2, l.H - l.W * 0.025);
    c.globalAlpha = 1;
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x+r,y); c.lineTo(x+w-r,y);
    c.quadraticCurveTo(x+w,y,x+w,y+r); c.lineTo(x+w,y+h-r);
    c.quadraticCurveTo(x+w,y+h,x+w-r,y+h); c.lineTo(x+r,y+h);
    c.quadraticCurveTo(x,y+h,x,y+h-r); c.lineTo(x,y+r);
    c.quadraticCurveTo(x,y,x+r,y);
    c.closePath();
  }

  // ── Templates ───────────────────────────────────────

  // ── Updated Layout Logic ───────────────────────────
  function renderCompany(c, l, d, th) {
    const t = THEMES[th];
    drawBg(c, l, th);
    
    // Top section: Logo & Title
    l.reset(l.H * 0.12);
    drawLogo(c, l);
    l.add(l.H * 0.04);

    const cw = l.contentW();
    const ts = autoSize(c, d.title, cw, l.W * 0.06, l.W * 0.03, 3);
    drawText(c, l, d.title, ts, "bold", t.text, "center", 3);
    l.add(l.H * 0.02);

    // Body content: Mid-upper section
    const bs = autoSize(c, d.body, cw, l.W * 0.026, l.W * 0.018, 8);
    drawText(c, l, d.body, bs, "normal", t.muted, "center", 8);
    
    // Bottom section: CTA & Footer (Sticky logic)
    const ctaY = l.H - (l.H * 0.25);
    l.reset(ctaY);
    drawCTA(c, l, d.cta, th);
    
    drawFooter(c, l, th);
  }

  function renderService(c, l, d, th) {
    const t = THEMES[th];
    drawBg(c, l, th);
    l.reset(l.H * 0.05);
    drawLogo(c, l);
    l.add(l.H * 0.02);
    drawBadge(c, l, "Layanan Kami", th);

    const boxSize = l.W * 0.1;
    const bx = l.W / 2 - boxSize / 2;
    roundRect(c, bx, l.y, boxSize, boxSize, boxSize * 0.18);
    c.fillStyle = t.dim;
    c.fill();
    c.strokeStyle = t.accent;
    c.lineWidth = Math.max(1, l.W * 0.003);
    c.stroke();
    c.save();
    c.translate(l.W / 2, l.y + boxSize / 2);
    c.fillStyle = t.accent;
    c.globalAlpha = 0.25;
    c.beginPath();
    c.ellipse(0, 0, boxSize*0.25, boxSize*0.35, -0.2, 0, Math.PI*2);
    c.fill();
    c.globalAlpha = 1;
    c.strokeStyle = t.accent;
    c.lineWidth = Math.max(1, l.W * 0.002);
    c.beginPath();
    c.moveTo(0, boxSize*0.25);
    c.quadraticCurveTo(0, -boxSize*0.08, -boxSize*0.15, -boxSize*0.25);
    c.moveTo(0, boxSize*0.25);
    c.quadraticCurveTo(boxSize*0.04, 0, boxSize*0.18, -boxSize*0.18);
    c.stroke();
    c.restore();
    l.add(boxSize + l.H * 0.03);

    const cw = l.contentW();
    const ts = autoSize(c, d.title, cw, l.W * 0.05, l.W * 0.025, 3);
    drawText(c, l, d.title, ts, "bold", t.text, "center", 3);
    l.add(l.H * 0.008);

    const ss = autoSize(c, d.subtitle, cw, l.W * 0.026, l.W * 0.016, 2);
    drawText(c, l, d.subtitle, ss, "600", t.accent, "center", 2);
    l.add(l.H * 0.015);

    const bs = autoSize(c, d.body, cw, l.W * 0.024, l.W * 0.016, 5);
    drawText(c, l, d.body, bs, "normal", t.muted, "center", 5);
    l.add(l.H * 0.03);

    if (l.space() > l.W * 0.08) drawCTA(c, l, d.cta, th);
    drawFooter(c, l, th);
  }

  function renderQuote(c, l, d, th) {
    const t = THEMES[th];
    drawBg(c, l, th);
    l.reset(l.H * 0.09);
    drawLogo(c, l);
    l.add(l.H * 0.04);

    const qFs = l.W * 0.17;
    c.font = `${qFs}px Georgia, serif`;
    c.fillStyle = t.accent;
    c.globalAlpha = 0.12;
    c.textAlign = "center";
    c.textBaseline = "top";
    c.fillText("\u201C", l.W / 2, l.y - qFs * 0.15);
    c.globalAlpha = 1;
    l.add(qFs * 0.4);

    const cw = l.contentW();
    const bs = autoSize(c, d.body, cw, l.W * 0.04, l.W * 0.02, 5);
    drawText(c, l, d.body, bs, "normal", t.text, "center", 5);
    l.add(l.H * 0.025);
    drawDivider(c, l, th, 0.06);
    l.add(l.H * 0.01);

    c.font = `bold ${Math.round(l.W * 0.026)}px ${FONT}`;
    c.fillStyle = t.accent;
    c.textAlign = "center";
    c.fillText(d.title, l.W / 2, l.y);
    l.add(l.W * 0.04);

    c.font = `${Math.round(l.W * 0.02)}px ${FONT}`;
    c.fillStyle = t.muted;
    c.fillText(d.subtitle, l.W / 2, l.y);
    l.add(l.H * 0.04);

    if (l.space() > l.W * 0.08) drawCTA(c, l, d.cta, th);
    drawFooter(c, l, th);
  }

  function renderCTA(c, l, d, th) {
    const t = THEMES[th];
    drawBg(c, l, th);
    l.reset(l.H * 0.1);
    drawLogo(c, l);
    l.add(l.H * 0.04);

    const cw = l.contentW();
    const ts = autoSize(c, d.title, cw, l.W * 0.06, l.W * 0.028, 3);
    drawText(c, l, d.title, ts, "bold", t.text, "center", 3);
    l.add(l.H * 0.015);
    drawDivider(c, l, th, 0.09);

    const ss = autoSize(c, d.subtitle, cw, l.W * 0.028, l.W * 0.018, 3);
    drawText(c, l, d.subtitle, ss, "500", t.muted, "center", 3);
    l.add(l.H * 0.01);

    const bs = autoSize(c, d.body, cw, l.W * 0.024, l.W * 0.016, 4);
    drawText(c, l, d.body, bs, "normal", t.muted, "center", 4);
    l.add(l.H * 0.04);

    if (l.space() > l.W * 0.15) {
      drawCTA(c, l, d.cta, th, 0.032);
      l.add(l.H * 0.02);
    }
    if (l.space() > l.W * 0.12) drawContact(c, l, th);
    drawFooter(c, l, th);
  }

  // ── Render to any context ───────────────────────────
  const TEMPLATES = { company: renderCompany, service: renderService, quote: renderQuote, cta: renderCTA };

  function renderTo(c, w, h) {
    const l = new L(w, h);
    const fn = TEMPLATES[template];
    if (fn) fn(c, l, getData(), theme);
  }

  function render() {
    sizeCanvas();
    renderTo(ctx, EXPORT_W, EXPORT_H);
  }

  function getData() {
    return {
      title:    document.getElementById("storyTitle").value || "PT DSITU JAYA BERSAMA",
      subtitle: document.getElementById("storySubtitle").value || "The Right Partner, The Great Step.",
      body:     document.getElementById("storyBody").value || "",
      cta:      document.getElementById("storyCTA").value || "Hubungi Kami",
    };
  }

  // ── Defaults ────────────────────────────────────────
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

  // ── Events ──────────────────────────────────────────
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

  document.getElementById("colorRow").addEventListener("click", (e) => {
    const sw = e.target.closest(".color-swatch");
    if (!sw) return;
    document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("active"));
    sw.classList.add("active");
    theme = sw.dataset.theme;
    render();
  });

  ["storyTitle", "storySubtitle", "storyBody", "storyCTA"].forEach(id => {
    document.getElementById(id).addEventListener("input", () => { render(); updateCounters(); });
  });

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

  // Download: render to offscreen 1080x1920, then export
  document.getElementById("btnDownload").addEventListener("click", () => {
    renderTo(octx, EXPORT_W, EXPORT_H);
    off.toBlob((blob) => {
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

  // WhatsApp share
  document.getElementById("btnWhatsApp").addEventListener("click", () => {
    const d = getData();
    const msg = [d.title, d.subtitle, "", d.body, "", "Hubungi: 0813-4841-4190", "Email: dsitujayabersama@gmail.com", "", "https://dsitujayabersama.com/"].join("\n");
    window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
  });

  // Resize handler
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 150);
  });

  updateLabels();
  updateCounters();
  render();
})();
