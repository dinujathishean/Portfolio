/**
 * Portfolio interactions (frontend only)
 * - Mobile menu toggle
 * - Active nav link on scroll
 * - Reveal-on-scroll animations
 * - Skill bar animation
 * - Contact form validation (no backend)
 * - Footer year + back-to-top button
 */

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");
  const navLinkEls = $$(".nav-link");
  const toTop = $("#toTop");
  const year = $("#year");

  const contactForm = $("#contactForm");
  const contactName = $("#contactName");
  const contactEmail = $("#contactEmail");
  const contactMessage = $("#contactMessage");
  const errName = $("#errName");
  const errEmail = $("#errEmail");
  const errMessage = $("#errMessage");
  const formSuccess = $("#formSuccess");

  // Footer year
  if (year) year.textContent = String(new Date().getFullYear());

  // Mobile menu
  function setMenu(open) {
    if (!navToggle || !navLinks) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navLinks.classList.toggle("is-open", open);
  }

  navToggle?.addEventListener("click", () => {
    const open = navLinks?.classList.contains("is-open");
    setMenu(!open);
    navToggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
  });

  // Close menu after clicking a link (mobile)
  navLinks?.addEventListener("click", (e) => {
    const a = e.target instanceof Element ? e.target.closest("a") : null;
    if (!a) return;
    setMenu(false);
    navToggle?.setAttribute("aria-label", "Open menu");
  });

  // Close menu when pressing Escape or clicking outside
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      setMenu(false);
      navToggle?.setAttribute("aria-label", "Open menu");
    }
  });

  document.addEventListener("click", (e) => {
    if (!navLinks?.classList.contains("is-open")) return;
    const target = e.target instanceof Element ? e.target : null;
    if (!target || target.closest(".nav")) return;
    setMenu(false);
    navToggle?.setAttribute("aria-label", "Open menu");
  });

  // Back to top button
  toTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function updateToTop() {
    if (!toTop) return;
    const show = window.scrollY > 600;
    toTop.classList.toggle("is-visible", show);
  }

  window.addEventListener("scroll", updateToTop, { passive: true });
  updateToTop();

  // Reveal animations
  const revealEls = $$(".reveal");
  const skillFills = $$(".skill-fill");

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.14 }
  );

  revealEls.forEach((el) => io.observe(el));

  // Animate skill bars when the skills section is visible
  const skillsSection = $("#skills");
  if (skillsSection && skillFills.length) {
    const skillIo = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        skillFills.forEach((fill) => {
          const level = Number(fill.getAttribute("data-level") || "0");
          fill.style.width = `${Math.max(0, Math.min(100, level))}%`;
        });
        skillIo.disconnect();
      },
      { threshold: 0.25 }
    );
    skillIo.observe(skillsSection);
  }

  // Active nav link on scroll (simple scrollspy)
  const sectionIds = navLinkEls
    .map((a) => a.getAttribute("href"))
    .filter(Boolean)
    .map((h) => h.replace("#", ""))
    .filter((id) => Boolean(document.getElementById(id)));

  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  function setActiveLink(id) {
    navLinkEls.forEach((a) => {
      const href = a.getAttribute("href") || "";
      a.classList.toggle("active", href === `#${id}`);
    });
  }

  function updateActiveLink() {
    if (!sections.length) return;
    const scrollPos = window.scrollY + 110; // header offset
    let currentId = sections[0].id;

    for (const sec of sections) {
      if (sec.offsetTop <= scrollPos) currentId = sec.id;
    }

    setActiveLink(currentId);
  }

  window.addEventListener("scroll", updateActiveLink, { passive: true });
  updateActiveLink();

  // Contact form validation (frontend only)
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(el, msg) {
    if (!el) return;
    el.textContent = msg;
  }

  function clearSuccess() {
    if (formSuccess) formSuccess.hidden = true;
  }

  function validate() {
    clearSuccess();

    const name = String(contactName?.value || "").trim();
    const email = String(contactEmail?.value || "").trim();
    const message = String(contactMessage?.value || "").trim();

    let ok = true;
    if (!name) {
      setError(errName, "Please enter your name.");
      ok = false;
    } else {
      setError(errName, "");
    }

    if (!email) {
      setError(errEmail, "Please enter your email.");
      ok = false;
    } else if (!emailRe.test(email)) {
      setError(errEmail, "Please enter a valid email address.");
      ok = false;
    } else {
      setError(errEmail, "");
    }

    if (!message) {
      setError(errMessage, "Please enter a message.");
      ok = false;
    } else if (message.length < 10) {
      setError(errMessage, "Please write at least 10 characters.");
      ok = false;
    } else {
      setError(errMessage, "");
    }

    return ok;
  }

  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;

    // No backend — show success only.
    if (formSuccess) formSuccess.hidden = false;

    // Optional UX: keep fields so user can copy their message
    // If you prefer clearing, uncomment:
    // contactForm.reset();
  });

  // Live validation feedback (lightweight)
  [contactName, contactEmail, contactMessage].forEach((el) => {
    el?.addEventListener("input", () => {
      // Only validate after the user has interacted
      validate();
    });
  });
})();

