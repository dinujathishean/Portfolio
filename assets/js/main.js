/**
 * Dinuja Thishean — SOC Terminal Portfolio
 * Grid canvas · Terminal boot · Scroll progress · Live clock
 */

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");
  const navLinkEls = $$(".nav-link");
  const toTop = $("#toTop");
  const year = $("#year");
  const scrollProgress = $("#scrollProgress");
  const gridCanvas = $("#gridCanvas");
  const terminalOutput = $("#terminalOutput");
  const liveClock = $("#liveClock");

  const contactForm = $("#contactForm");
  const contactName = $("#contactName");
  const contactEmail = $("#contactEmail");
  const contactMessage = $("#contactMessage");
  const errName = $("#errName");
  const errEmail = $("#errEmail");
  const errMessage = $("#errMessage");
  const formSuccess = $("#formSuccess");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (year) year.textContent = String(new Date().getFullYear());

  /* ── Animated grid background ── */
  function initGrid() {
    if (!gridCanvas || prefersReducedMotion) return;

    const ctx = gridCanvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let frame = 0;
    let raf = 0;

    const resize = () => {
      w = gridCanvas.width = window.innerWidth;
      h = gridCanvas.height = window.innerHeight;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const spacing = 56;
      const offset = (frame * 0.3) % spacing;

      ctx.strokeStyle = "rgba(0, 255, 159, 0.04)";
      ctx.lineWidth = 1;

      for (let x = -spacing + offset; x < w + spacing; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      for (let y = -spacing + offset; y < h + spacing; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Floating nodes
      const nodes = 18;
      for (let i = 0; i < nodes; i++) {
        const nx = ((i * 137.5 + frame * 0.15) % w);
        const ny = ((i * 97.3 + frame * 0.1) % h);
        const pulse = 0.4 + Math.sin(frame * 0.02 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(nx, ny, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${pulse * 0.35})`;
        ctx.fill();
      }

      frame++;
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => cancelAnimationFrame(raf);
  }

  initGrid();

  /* ── Terminal boot sequence ── */
  const bootLines = [
    { type: "cmd", text: "$ whoami" },
    { type: "out", text: "dinuja_thishean @ sl_iit_sec_ops" },
    { type: "cmd", text: "$ cat role.txt" },
    { type: "out", text: "Network Engineer Intern — Hayleys Fentons IT" },
    { type: "cmd", text: "$ nmap --status certs" },
    { type: "ok", text: "NSE 1 ✓  Cisco Cybersecurity ✓  Python ✓" },
    { type: "cmd", text: "$ system_status" },
    { type: "ok", text: "ALL SYSTEMS OPERATIONAL — PORTFOLIO ONLINE" },
  ];

  async function runTerminal() {
    if (!terminalOutput || prefersReducedMotion) {
      if (terminalOutput) {
        terminalOutput.innerHTML = bootLines
          .map((l) => `<div class="terminal-line"><span class="${l.type}">${l.text}</span></div>`)
          .join("");
      }
      return;
    }

    for (const line of bootLines) {
      await new Promise((r) => setTimeout(r, 280));
      const el = document.createElement("div");
      el.className = "terminal-line";
      el.innerHTML = `<span class="${line.type}">${line.text}</span>`;
      terminalOutput.appendChild(el);
    }

    const cursor = document.createElement("div");
    cursor.className = "terminal-line";
    cursor.innerHTML = '<span class="cmd">$</span><span class="terminal-cursor"></span>';
    terminalOutput.appendChild(cursor);
  }

  runTerminal();

  /* ── Live clock ── */
  function updateClock() {
    if (!liveClock) return;
    const now = new Date();
    liveClock.textContent = now.toLocaleTimeString("en-GB", { hour12: false });
  }

  updateClock();
  setInterval(updateClock, 1000);

  /* ── Scroll progress ── */
  function updateScrollProgress() {
    if (!scrollProgress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    scrollProgress.style.width = `${pct}%`;
  }

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* ── Mobile menu ── */
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

  navLinks?.addEventListener("click", (e) => {
    const a = e.target instanceof Element ? e.target.closest("a") : null;
    if (!a) return;
    setMenu(false);
    navToggle?.setAttribute("aria-label", "Open menu");
  });

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

  /* ── Back to top ── */
  toTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function updateToTop() {
    if (!toTop) return;
    toTop.classList.toggle("is-visible", window.scrollY > 600);
  }

  window.addEventListener("scroll", updateToTop, { passive: true });
  updateToTop();

  /* ── Reveal animations ── */
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
    { threshold: 0.12 }
  );

  revealEls.forEach((el) => io.observe(el));

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

  /* ── Scrollspy ── */
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
    const scrollPos = window.scrollY + 110;
    let currentId = sections[0].id;

    for (const sec of sections) {
      if (sec.offsetTop <= scrollPos) currentId = sec.id;
    }

    setActiveLink(currentId);
  }

  window.addEventListener("scroll", updateActiveLink, { passive: true });
  updateActiveLink();

  /* ── Contact form ── */
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
    } else setError(errName, "");

    if (!email) {
      setError(errEmail, "Please enter your email.");
      ok = false;
    } else if (!emailRe.test(email)) {
      setError(errEmail, "Please enter a valid email address.");
      ok = false;
    } else setError(errEmail, "");

    if (!message) {
      setError(errMessage, "Please enter a message.");
      ok = false;
    } else if (message.length < 10) {
      setError(errMessage, "Please write at least 10 characters.");
      ok = false;
    } else setError(errMessage, "");

    return ok;
  }

  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (formSuccess) formSuccess.hidden = false;
  });

  [contactName, contactEmail, contactMessage].forEach((el) => {
    el?.addEventListener("input", validate);
  });
})();
