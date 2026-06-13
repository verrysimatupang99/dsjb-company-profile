(function () {
  "use strict";

  const OWNER = "verrysimatupang99";
  const REPO = "dsjb-company-profile";
  const BRANCH = "main";
  const CONTENT_PATH = "data/company-profile.json";
  const TOKEN_KEY = "dsjb-admin-github-token";
  const API = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${CONTENT_PATH}`;

  const state = { data: null, sha: null, tab: "site" };
  const root = document.getElementById("editor-root");
  const status = document.getElementById("admin-status");
  const tokenInput = document.getElementById("github-token");

  tokenInput.value = localStorage.getItem(TOKEN_KEY) || "";

  function setStatus(message, type) {
    status.textContent = message || "";
    status.className = `admin-status ${type || ""}`.trim();
  }

  function token() {
    const value = tokenInput.value.trim();
    if (value) localStorage.setItem(TOKEN_KEY, value);
    return value;
  }

  async function loadContent(useGithub) {
    setStatus("Memuat konten...", "");
    try {
      if (useGithub && token()) {
        const res = await fetch(`${API}?ref=${BRANCH}`, {
          headers: {
            Authorization: `Bearer ${token()}`,
            Accept: "application/vnd.github+json"
          }
        });
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        const payload = await res.json();
        state.sha = payload.sha;
        state.data = JSON.parse(decodeBase64(payload.content));
        setStatus("Konten GitHub berhasil dimuat.", "ok");
      } else {
        const res = await fetch(`../${CONTENT_PATH}?v=${Date.now()}`);
        if (!res.ok) throw new Error(`Fetch lokal ${res.status}`);
        state.sha = null;
        state.data = await res.json();
        setStatus("Konten lokal dimuat. Load dari GitHub untuk publish aman.", "ok");
      }
      render();
    } catch (error) {
      setStatus(error.message, "error");
    }
  }

  function decodeBase64(value) {
    const binary = atob(value.replace(/\n/g, ""));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function encodeBase64(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = "";
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }

  function get(path) {
    return path.split(".").reduce((acc, key) => acc?.[key], state.data);
  }

  function set(path, value) {
    const keys = path.split(".");
    const last = keys.pop();
    const target = keys.reduce((acc, key) => acc[key], state.data);
    target[last] = value;
  }

  function field(label, path, type = "text") {
    const value = get(path) || "";
    const tag = type === "textarea" ? "textarea" : "input";
    const attrs = tag === "input" ? `type="${type}" value="${escapeAttr(value)}"` : "";
    const content = tag === "textarea" ? escapeHtml(value) : "";
    return `<div class="admin-field ${type === "textarea" ? "full" : ""}"><label>${label}</label><${tag} data-path="${path}" ${attrs}>${content}</${tag}></div>`;
  }

  function render() {
    if (!state.data) return;
    const renderers = { site: renderSite, home: renderHome, services: renderServices, testimonials: renderTestimonials, json: renderJson };
    root.innerHTML = renderers[state.tab]();
    root.querySelectorAll("[data-path]").forEach((node) => {
      node.addEventListener("input", () => set(node.dataset.path, node.value));
    });
    root.querySelectorAll("[data-array-path]").forEach((node) => {
      node.addEventListener("input", () => {
        const parts = node.dataset.arrayPath.split("|");
        const list = get(parts[0]);
        list[Number(parts[1])][parts[2]] = node.value;
      });
    });
  }

  function renderSite() {
    return `<h2>Profil & Kontak</h2><div class="field-grid">
      ${field("Nama Perusahaan", "site.name")}
      ${field("Tagline", "site.tagline")}
      ${field("Website", "site.baseUrl")}
      ${field("Email", "contact.email", "email")}
      ${field("WhatsApp angka", "contact.whatsappNumber")}
      ${field("WhatsApp tampil", "contact.whatsappDisplay")}
      ${field("Alamat kantor", "contact.office", "textarea")}
    </div>`;
  }

  function renderHome() {
    return `<h2>Hero Beranda</h2><div class="field-grid">
      ${field("Eyebrow", "home.hero.eyebrow")}
      ${field("Gambar hero", "home.hero.backgroundImage")}
      ${field("Judul", "home.hero.title", "textarea")}
      ${field("Lead", "home.hero.lead", "textarea")}
      ${field("CTA utama label", "home.hero.primaryCta.label")}
      ${field("CTA utama link", "home.hero.primaryCta.href")}
      ${field("CTA kedua label", "home.hero.secondaryCta.label")}
      ${field("CTA kedua link", "home.hero.secondaryCta.href")}
    </div>${renderArray("Metrik", "home.hero.metrics", ["value", "label"])}`;
  }

  function renderServices() {
    return `<h2>Layanan</h2>${renderArray("Daftar layanan", "home.services.items", ["title", "body", "image", "href"])}`;
  }

  function renderTestimonials() {
    return `<h2>Testimoni</h2>${renderArray("Daftar testimoni", "home.testimonials.items", ["quote", "initials", "name", "location"])}`;
  }

  function renderJson() {
    return `<h2>JSON Preview</h2><p>Preview ini ikut berubah setelah field diedit.</p><pre class="admin-preview">${escapeHtml(JSON.stringify(state.data, null, 2))}</pre>`;
  }

  function renderArray(title, path, keys) {
    const list = get(path) || [];
    return `<section class="admin-field full"><h3>${title}</h3><div class="repeat-list">${list.map((item, index) => `
      <article class="repeat-item">
        <h4>Item ${index + 1}</h4>
        <div class="field-grid">${keys.map((key) => {
          const textarea = String(item[key] || "").length > 80 || key === "body" || key === "quote";
          return `<div class="admin-field ${textarea ? "full" : ""}"><label>${key}</label>${textarea
            ? `<textarea data-array-path="${path}|${index}|${key}">${escapeHtml(item[key] || "")}</textarea>`
            : `<input data-array-path="${path}|${index}|${key}" value="${escapeAttr(item[key] || "")}">`}</div>`;
        }).join("")}</div>
      </article>`).join("")}</div></section>`;
  }

  async function saveContent() {
    if (!state.data) return setStatus("Konten belum dimuat.", "error");
    if (!token()) return setStatus("Token GitHub wajib diisi untuk publish.", "error");
    if (!state.sha) return setStatus("Klik Load dari GitHub dulu agar SHA file valid.", "error");
    setStatus("Publish ke GitHub...", "");
    const content = `${JSON.stringify(state.data, null, 2)}\n`;
    const res = await fetch(API, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token()}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "content: update company profile via admin panel",
        content: encodeBase64(content),
        sha: state.sha,
        branch: BRANCH
      })
    });
    const payload = await res.json();
    if (!res.ok) return setStatus(payload.message || `GitHub API ${res.status}`, "error");
    state.sha = payload.content.sha;
    setStatus("Berhasil publish. GitHub Actions akan deploy ke Spaceship.", "ok");
  }

  function downloadJson() {
    const blob = new Blob([`${JSON.stringify(state.data, null, 2)}\n`], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "company-profile.json";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }

  document.querySelectorAll(".admin-tab").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.tab = button.dataset.tab;
      render();
    });
  });

  document.querySelector("[data-action='load']").addEventListener("click", () => loadContent(true));
  document.querySelector("[data-action='save']").addEventListener("click", saveContent);
  document.querySelector("[data-action='download']").addEventListener("click", downloadJson);
  document.querySelector("[data-action='reset']").addEventListener("click", () => loadContent(false));
  document.querySelector("[data-action='clear-token']").addEventListener("click", () => {
    localStorage.removeItem(TOKEN_KEY);
    tokenInput.value = "";
    setStatus("Token dihapus dari browser.", "ok");
  });

  loadContent(false);
})();
