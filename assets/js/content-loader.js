/* PT DSITU JAYA BERSAMA - JSON content loader */
(function () {
  "use strict";

  const DATA_URL = "data/company-profile.json";

  function byPath(source, path) {
    return path.split(".").reduce((value, key) => {
      if (value && Object.prototype.hasOwnProperty.call(value, key)) {
        return value[key];
      }
      return undefined;
    }, source);
  }

  function setText(selector, value) {
    if (typeof value !== "string") return;
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = value;
    });
  }

  function setContentMarkers(data) {
    document.querySelectorAll("[data-content]").forEach((node) => {
      const value = byPath(data, node.getAttribute("data-content"));
      if (typeof value === "string") node.textContent = value;
    });
  }

  function updateMeta(data) {
    const site = data.site || {};
    const hero = data.home?.hero || {};
    const baseUrl = site.baseUrl || location.origin;
    const title = `${site.name || "PT DSITU JAYA BERSAMA"} | ${hero.eyebrow || "Company Profile"}`;
    const description = hero.lead || "";
    const ogImage = new URL(site.ogImage || "assets/img/cp-umum-logo-resmi.webp", baseUrl).href;

    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", hero.title || description, "property");
    setMeta("og:image", ogImage, "property");
    setMeta("og:url", baseUrl + "/", "property");
  }

  function setMeta(name, value, attr = "name") {
    if (!value) return;
    const node = document.querySelector(`meta[${attr}="${name}"]`);
    if (node) node.setAttribute("content", value);
  }

  function updateContactLinks(data) {
    const contact = data.contact || {};
    const whatsapp = contact.whatsappNumber ? `https://wa.me/${contact.whatsappNumber}` : "";
    const mailto = contact.email ? `mailto:${contact.email}` : "";

    document.querySelectorAll('a[href^="https://wa.me/"]').forEach((link) => {
      if (whatsapp) link.href = whatsapp;
    });
    document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
      if (mailto) link.href = mailto;
    });
  }

  function updateHero(data) {
    const hero = data.home?.hero || {};
    const heroNode = document.querySelector(".hero");
    if (heroNode && hero.backgroundImage) {
      heroNode.style.backgroundImage = [
        "linear-gradient(90deg, rgba(6, 19, 28, .97) 0%, rgba(6, 19, 28, .84) 48%, rgba(6, 19, 28, .42) 100%)",
        `url("${hero.backgroundImage}")`
      ].join(", ");
    }

    const primary = document.querySelector("[data-home-primary]");
    const secondary = document.querySelector("[data-home-secondary]");
    if (primary && hero.primaryCta) {
      primary.textContent = hero.primaryCta.label || primary.textContent;
      primary.href = hero.primaryCta.href || primary.href;
    }
    if (secondary && hero.secondaryCta) {
      secondary.textContent = hero.secondaryCta.label || secondary.textContent;
      secondary.href = hero.secondaryCta.href || secondary.href;
    }

    renderMetrics(hero.metrics || []);
  }

  function renderMetrics(metrics) {
    const target = document.querySelector("[data-render='home.metrics']");
    if (!target || !metrics.length) return;
    target.innerHTML = metrics.map((item) => (
      `<div class="metric"><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span></div>`
    )).join("");
  }

  function renderValues(values) {
    const target = document.querySelector("[data-render='home.values']");
    if (!target || !values?.length) return;
    const icons = Array.from(target.querySelectorAll(".value-icon")).map((node) => node.innerHTML);
    target.innerHTML = values.map((item, index) => `
      <article class="value-card animate visible">
        <div class="value-icon">${icons[index] || icons[0] || ""}</div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.body)}</p>
      </article>
    `).join("");
  }

  function renderServices(services) {
    const target = document.querySelector("[data-render='home.services']");
    if (!target || !services?.length) return;
    target.innerHTML = services.map((item) => `
      <article class="service-card animate visible">
        <picture>
          <source srcset="${escapeAttr(item.image)}" type="image/webp">
          <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.alt || item.title)}" loading="lazy" width="400" height="210">
        </picture>
        <div class="card-body">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.body)}</p>
          <a class="text-link" href="${escapeAttr(item.href)}">Detail divisi &rarr;</a>
        </div>
      </article>
    `).join("");
  }

  function renderTestimonials(testimonials) {
    const target = document.querySelector("[data-render='home.testimonials']");
    if (!target || !testimonials?.length) return;
    target.innerHTML = testimonials.map((item) => `
      <article class="testimonial-card animate visible">
        <blockquote>"${escapeHtml(item.quote)}"</blockquote>
        <div class="testimonial-author">
          <div class="avatar">${escapeHtml(item.initials || "")}</div>
          <div class="info"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.location)}</span></div>
        </div>
      </article>
    `).join("");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll("`", "&#96;");
  }

  function applyContent(data) {
    setText(".brand strong, .site-footer strong", data.site?.name);
    setContentMarkers(data);
    updateMeta(data);
    updateContactLinks(data);
    updateHero(data);
    renderValues(data.home?.profile?.values || []);
    renderServices(data.home?.services?.items || []);
    renderTestimonials(data.home?.testimonials?.items || []);
  }

  document.addEventListener("DOMContentLoaded", () => {
    fetch(DATA_URL, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`Content fetch failed: ${response.status}`);
        return response.json();
      })
      .then(applyContent)
      .catch((error) => {
        console.warn("DSJB content loader skipped:", error.message);
      });
  });
})();
