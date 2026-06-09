(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const navToggle = $("#navToggle");
  const sidebar = $("#sidebar");
  const backdrop = $("#sidebarBackdrop");
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

  if (year) year.textContent = String(new Date().getFullYear());

  function setSidebar(open) {
    sidebar?.classList.toggle("is-open", open);
    navToggle?.setAttribute("aria-expanded", String(open));
    if (backdrop) backdrop.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  }

  navToggle?.addEventListener("click", () => {
    setSidebar(!sidebar?.classList.contains("is-open"));
  });

  backdrop?.addEventListener("click", () => setSidebar(false));

  navLinks?.addEventListener("click", (e) => {
    const a = e.target instanceof Element ? e.target.closest("a") : null;
    if (!a) return;
    setSidebar(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setSidebar(false);
  });

  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  function updateToTop() {
    toTop?.classList.toggle("is-visible", window.scrollY > 500);
  }

  window.addEventListener("scroll", updateToTop, { passive: true });
  updateToTop();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      });
    },
    { threshold: 0.1 }
  );

  $$(".reveal").forEach((el) => io.observe(el));

  const skillsSection = $("#skills");
  const skillFills = $$(".skill-fill");
  if (skillsSection && skillFills.length) {
    const skillIo = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        skillFills.forEach((f) => {
          f.style.width = `${Math.min(100, Number(f.dataset.level || 0))}%`;
        });
        skillIo.disconnect();
      },
      { threshold: 0.2 }
    );
    skillIo.observe(skillsSection);
  }

  const sections = navLinkEls
    .map((a) => a.getAttribute("href")?.replace("#", ""))
    .filter((id) => id && document.getElementById(id))
    .map((id) => document.getElementById(id));

  function updateActive() {
    if (!sections.length) return;
    const pos = window.scrollY + 120;
    let current = sections[0].id;
    sections.forEach((s) => { if (s.offsetTop <= pos) current = s.id; });
    navLinkEls.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${current}`));
  }

  window.addEventListener("scroll", updateActive, { passive: true });
  updateActive();

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate() {
    if (formSuccess) formSuccess.hidden = true;
    const name = (contactName?.value || "").trim();
    const email = (contactEmail?.value || "").trim();
    const message = (contactMessage?.value || "").trim();
    let ok = true;

    errName.textContent = name ? "" : "Please enter your name.";
    if (!name) ok = false;

    if (!email) { errEmail.textContent = "Please enter your email."; ok = false; }
    else if (!emailRe.test(email)) { errEmail.textContent = "Invalid email."; ok = false; }
    else errEmail.textContent = "";

    if (!message) { errMessage.textContent = "Please enter a message."; ok = false; }
    else if (message.length < 10) { errMessage.textContent = "At least 10 characters."; ok = false; }
    else errMessage.textContent = "";

    return ok;
  }

  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validate() && formSuccess) formSuccess.hidden = false;
  });

  [contactName, contactEmail, contactMessage].forEach((el) => el?.addEventListener("input", validate));
})();
