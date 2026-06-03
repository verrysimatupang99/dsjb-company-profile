/* ============================================
   PT DSITU JAYA BERSAMA — Main JS
   Features: nav toggle, scroll animations, dark mode, year
   ============================================ */

// Navigation toggle
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".main-nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close nav on link click (mobile)
  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Active nav link
const currentPage = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".main-nav a, .footer-links a").forEach(link => {
  const href = link.getAttribute("href");
  if (href === currentPage) {
    link.classList.add("active");
  }
});

// Auto year
document.querySelectorAll("[data-year]").forEach(node => {
  node.textContent = new Date().getFullYear();
});

// Scroll animations (Intersection Observer)
const animateElements = document.querySelectorAll(".animate");
if (animateElements.length > 0 && "IntersectionObserver" in window) {
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
} else {
  // Fallback: show all immediately
  animateElements.forEach(el => el.classList.add("visible"));
}

// Dark/Light mode toggle
(function() {
  const STORAGE_KEY = "dsjb-theme";

  // Create toggle button
  const btn = document.createElement("button");
  btn.className = "theme-toggle";
  btn.setAttribute("aria-label", "Toggle tema gelap/terang");
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

  function applyTheme(theme) {
    if (theme === "light") {
      document.body.classList.add("light-mode");
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    } else {
      document.body.classList.remove("light-mode");
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    }
  }

  // Load saved theme
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) applyTheme(saved);

  btn.addEventListener("click", () => {
    const current = document.body.classList.contains("light-mode") ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  });

  document.body.appendChild(btn);
})();

// Smooth header shadow on scroll
const header = document.querySelector(".site-header");
if (header) {
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 10) {
          header.style.boxShadow = "0 4px 20px rgba(0,0,0,.3)";
        } else {
          header.style.boxShadow = "none";
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}
