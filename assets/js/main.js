(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");
  const navLinkEls = $$(".nav-link");
  const toTop = $("#toTop");
  const year = $("#year");

  if (year) year.textContent = new Date().getFullYear();

  function setMenu(open) {
    navToggle?.setAttribute("aria-expanded", String(open));
    navLinks?.classList.toggle("is-open", open);
  }

  navToggle?.addEventListener("click", () => setMenu(!navLinks?.classList.contains("is-open")));
  navLinks?.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => toTop?.classList.toggle("is-visible", scrollY > 500), { passive: true });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  $$(".reveal").forEach((el) => io.observe(el));

  const skills = $("#skills");
  if (skills) {
    const sio = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      $$(".fill").forEach((f) => { f.style.width = `${f.dataset.level || 0}%`; });
      sio.disconnect();
    }, { threshold: 0.2 });
    sio.observe(skills);
  }

  const sections = navLinkEls.map((a) => document.getElementById(a.getAttribute("href")?.slice(1))).filter(Boolean);
  window.addEventListener("scroll", () => {
    const pos = scrollY + 100;
    let cur = sections[0]?.id;
    sections.forEach((s) => { if (s.offsetTop <= pos) cur = s.id; });
    navLinkEls.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${cur}`));
  }, { passive: true });

  const form = $("#contactForm");
  const errName = $("#errName"), errEmail = $("#errEmail"), errMessage = $("#errMessage");
  const formSuccess = $("#formSuccess");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate() {
    if (formSuccess) formSuccess.hidden = true;
    const name = $("#contactName").value.trim();
    const email = $("#contactEmail").value.trim();
    const msg = $("#contactMessage").value.trim();
    let ok = true;
    errName.textContent = name ? "" : "Required.";
    if (!name) ok = false;
    if (!email) { errEmail.textContent = "Required."; ok = false; }
    else if (!emailRe.test(email)) { errEmail.textContent = "Invalid email."; ok = false; }
    else errEmail.textContent = "";
    if (!msg || msg.length < 10) { errMessage.textContent = "At least 10 characters."; ok = false; }
    else errMessage.textContent = "";
    return ok;
  }

  form?.addEventListener("submit", (e) => { e.preventDefault(); if (validate()) formSuccess.hidden = false; });
  ["contactName", "contactEmail", "contactMessage"].forEach((id) => $("#" + id)?.addEventListener("input", validate));
})();
