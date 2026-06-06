/* ============================================
   PT DSITU JAYA BERSAMA — Main JS
   Nav toggle · scroll animations · dark mode · back-to-top · form
   ============================================ */

(function() {
  "use strict";

  // ── Navigation Toggle ──────────────────────────────
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("nav-open", isOpen);
    });

    // Close nav on link click (mobile)
    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      });
    });

    // Close nav on resize if viewport becomes wide
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 980) {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
          document.body.classList.remove("nav-open");
        }
      }, 150);
    });

    // Close nav on outside click
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("open") &&
          !nav.contains(e.target) &&
          !toggle.contains(e.target)) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      }
    });

    // Close nav on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
        toggle.focus();
      }
    });
  }

  // ── Active Nav Link ────────────────────────────────
  const currentPage = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a, .footer-links a").forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("active");
    }
  });

  // ── Auto Year ──────────────────────────────────────
  document.querySelectorAll("[data-year]").forEach(node => {
    node.textContent = new Date().getFullYear();
  });

  // ── Scroll Animations ──────────────────────────────
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animateElements = document.querySelectorAll(".animate");

  if (animateElements.length > 0) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      // Respect reduced motion preference or fallback
      animateElements.forEach(el => el.classList.add("visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
      );
      animateElements.forEach(el => observer.observe(el));
    }
  }

  // ── Theme Toggle ───────────────────────────────────
  (function() {
    const STORAGE_KEY = "dsjb-theme";
    const sunIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    const moonIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

    const btn = document.createElement("button");
    btn.className = "theme-toggle";
    btn.setAttribute("aria-label", "Toggle tema gelap/terang");

    function applyTheme(theme) {
      if (theme === "light") {
        document.body.classList.add("light-mode");
        btn.innerHTML = moonIcon;
        btn.setAttribute("aria-pressed", "true");
      } else {
        document.body.classList.remove("light-mode");
        btn.innerHTML = sunIcon;
        btn.setAttribute("aria-pressed", "false");
      }
    }

    applyTheme("dark");
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) applyTheme(saved);

    // Respect OS preference if no saved choice
    if (!saved && window.matchMedia("(prefers-color-scheme: light)").matches) {
      applyTheme("light");
    }

    btn.addEventListener("click", () => {
      const current = document.body.classList.contains("light-mode") ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
    });

    document.body.appendChild(btn);
  })();

  // ── Header Shadow on Scroll ────────────────────────
  const header = document.querySelector(".site-header");
  if (header) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          header.style.boxShadow = window.scrollY > 10
            ? "0 4px 20px rgba(0,0,0,.3)"
            : "none";
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ── Back to Top Button ─────────────────────────────
  (function() {
    const btn = document.createElement("button");
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Kembali ke atas");
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>';

    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          btn.classList.toggle("visible", window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    document.body.appendChild(btn);
  })();

  // ── Contact Form Handler (Formspree) ───────────────
  (function() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = form.querySelector(".form-status");
      const btn = form.querySelector("button[type=\"submit\"]");

      btn.disabled = true;
      btn.textContent = "Mengirim...";

      try {
        const data = new FormData(form);
        const res = await fetch(form.action, {
          method: "POST",
          body: data,
          headers: { "Accept": "application/json" }
        });

        if (res.ok) {
          status.className = "form-status success";
          status.textContent = "Pesan berhasil dikirim! Tim DSJB akan segera menghubungi Anda.";
          form.reset();
        } else {
          throw new Error("Gagal mengirim");
        }
      } catch {
        status.className = "form-status error";
        status.textContent = "Gagal mengirim pesan. Silakan coba lagi atau hubungi via WhatsApp.";
      } finally {
        btn.disabled = false;
        btn.textContent = "Kirim Pesan";
      }
    });
  })();

})();
