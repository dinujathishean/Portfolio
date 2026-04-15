const THEME_STORAGE_KEY = 'portfolio-theme';
const DEFAULT_PORTFOLIO_DATA = {
    bio: {
        name: 'Dinuja Thishean',
        title: 'Cyber Security Undergraduate | SLIIT',
        description:
            'Cyber Security undergraduate building practical and secure digital solutions through real-world projects and continuous learning.'
    }
};

function escapeHtml(value) {
    if (value == null) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function safeExternalHref(url) {
    const u = (url || '').trim();
    if (!u || u === '#') return '#';
    try {
        const parsed = new URL(u, window.location.href);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.href;
        if (parsed.protocol === 'mailto:') return parsed.href;
        if (parsed.protocol === 'file:') return parsed.href;
    } catch (e) {
        return '#';
    }
    if (u.startsWith('#')) return u;
    if (!/^[a-z]+:/i.test(u)) return u;
    return '#';
}

async function forceDownloadFile(fileUrl, filename) {
    try {
        const response = await fetch(fileUrl, { cache: 'no-store' });
        if (!response.ok) throw new Error('Download request failed');
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const tempLink = document.createElement('a');
        tempLink.href = blobUrl;
        tempLink.download = filename || 'download.pdf';
        document.body.appendChild(tempLink);
        tempLink.click();
        tempLink.remove();
        URL.revokeObjectURL(blobUrl);
    } catch (err) {
        const fallbackLink = document.createElement('a');
        fallbackLink.href = fileUrl;
        fallbackLink.download = filename || 'download.pdf';
        document.body.appendChild(fallbackLink);
        fallbackLink.click();
        fallbackLink.remove();
    }
}

function getTheme() {
    const t = document.documentElement.getAttribute('data-theme');
    return t === 'light' || t === 'dark' ? t : 'dark';
}

function setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') return;
    document.documentElement.setAttribute('data-theme', theme);
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
        /* ignore */
    }
    document.querySelectorAll('.theme-btn[data-set-theme]').forEach((btn) => {
        btn.setAttribute('aria-pressed', btn.getAttribute('data-set-theme') === theme ? 'true' : 'false');
    });
}

function initThemeControls() {
    setTheme(getTheme());
    document.querySelectorAll('.theme-btn[data-set-theme]').forEach((btn) => {
        btn.addEventListener('click', () => {
            setTheme(btn.getAttribute('data-set-theme'));
            const menuBtn = document.getElementById('menu-btn');
            const navLinks = document.getElementById('nav-links');
            if (menuBtn && navLinks && window.matchMedia('(max-width: 900px)').matches) {
                menuBtn.classList.remove('open');
                navLinks.classList.remove('active');
            }
        });
    });
}

function parsePortfolioInlineJson() {
    const inlineEl = document.getElementById('portfolio-data-inline');
    if (!inlineEl) return null;
    const raw = inlineEl.textContent.trim();
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error('Invalid portfolio JSON in page:', e);
        return null;
    }
}

function loadPortfolioData() {
    const inlineData = parsePortfolioInlineJson();
    const legacyData =
        typeof window.PORTFOLIO_DATA !== 'undefined' && window.PORTFOLIO_DATA !== null
            ? window.PORTFOLIO_DATA
            : null;

    const proto = window.location.protocol;
    const useNetworkFirst = proto === 'http:' || proto === 'https:';

    if (useNetworkFirst) {
        return fetch('data.json', { cache: 'no-store' })
            .then((response) => {
                if (!response.ok) throw new Error('data.json not available');
                return response.json();
            })
            .catch(() => {
                if (inlineData) return Promise.resolve(inlineData);
                if (legacyData) return Promise.resolve(legacyData);
                return Promise.resolve(DEFAULT_PORTFOLIO_DATA);
            });
    }

    if (inlineData) return Promise.resolve(inlineData);
    if (legacyData) return Promise.resolve(legacyData);

    return fetch('data.json', { cache: 'no-store' }).then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    }).catch(() => Promise.resolve(DEFAULT_PORTFOLIO_DATA));
}

document.addEventListener('DOMContentLoaded', () => {
    initThemeControls();

    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    loadPortfolioData()
        .then((data) => {
            if (!data || typeof data !== 'object') throw new Error('Invalid portfolio data');
            populateHero(data.bio, data.cvLink, data.cvDownloadFilename);
            populateAbout(data.about || {});
            populateSkills(data.skills || { technical: [], soft: [] });
            populateCertifications(Array.isArray(data.certifications) ? data.certifications : []);
            populateEducation(Array.isArray(data.education) ? data.education : []);
            populateExperience(Array.isArray(data.experiences) ? data.experiences : []);
            populateExtracurricular(data.extracurricular || null);
            populateProjects(
                Array.isArray(data.projects) ? data.projects : [],
                data.projectCategories
            );
            populateContact(data.contact || {});
            initRevealOnScroll();
        })
        .catch((error) => {
            console.error('Error loading data:', error);
            const heroName = document.getElementById('hero-name');
            if (heroName) heroName.textContent = 'Dinuja Thishean';
        });

    const menuBtn = document.getElementById('menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('open');
            navLinks.classList.toggle('active');
            menuBtn.setAttribute('aria-expanded', navLinks.classList.contains('active') ? 'true' : 'false');
        });

        document.querySelectorAll('.nav-links a').forEach((link) => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('open');
                navLinks.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    initBackToTop();
    initNavbarScrollState();

    initSlidePanels();
});

function populateHero(bio, cvLink, cvDownloadFilename) {
    if (!bio || typeof bio !== 'object') return;

    const name = bio.name || 'Portfolio';
    document.title = `${name} | Cyber Security Portfolio`;

    const nameEl = document.getElementById('hero-name');
    if (nameEl) {
        nameEl.textContent = name;
        nameEl.setAttribute('data-text', name);
    }

    const navLogo = document.getElementById('nav-logo');
    if (navLogo) navLogo.textContent = String(name).split(' ')[0] + '.';

    const heroTitle = document.getElementById('hero-title');
    if (heroTitle) heroTitle.textContent = bio.title || '';

    const heroDesc = document.getElementById('hero-desc');
    if (heroDesc) heroDesc.textContent = bio.description || '';
    populateHeroHighlights(bio);

    const rawCv = cvLink ? String(cvLink).trim() : '';
    const safeCv = rawCv ? safeExternalHref(rawCv) : '';
    const downloadCvBtn = document.getElementById('download-cv-btn');
    if (safeCv && safeCv !== '#') {
        const isPdf = /\.pdf($|\?|#)/i.test(safeCv);
        const downloadName =
            (cvDownloadFilename && String(cvDownloadFilename).trim()) ||
            (() => {
                try {
                    return new URL(safeCv, window.location.href).pathname.split('/').pop() || 'CV.pdf';
                } catch (e) {
                    return 'CV.pdf';
                }
            })();
        if (downloadCvBtn) {
            downloadCvBtn.href = safeCv;
            downloadCvBtn.removeAttribute('target');
            downloadCvBtn.removeAttribute('rel');
            if (isPdf) {
                downloadCvBtn.setAttribute('download', downloadName);
                downloadCvBtn.onclick = (event) => {
                    event.preventDefault();
                    forceDownloadFile(safeCv, downloadName);
                };
            } else {
                downloadCvBtn.setAttribute('download', downloadName);
                downloadCvBtn.onclick = null;
            }
            downloadCvBtn.style.display = '';
        }
    } else {
        if (downloadCvBtn) downloadCvBtn.style.display = 'none';
    }
}

function populateAbout(about) {
    const headline = document.getElementById('about-headline');
    const summary = document.getElementById('about-summary');
    const highlights = document.getElementById('about-highlights');
    const stats = document.getElementById('about-stats');

    if (headline) {
        headline.textContent =
            about.headline || 'Building secure, reliable, and user-focused digital solutions.';
    }
    if (summary) {
        summary.textContent =
            about.summary ||
            'I combine cyber security fundamentals with hands-on web development to create projects that are both functional and resilient.';
    }
    if (highlights) {
        highlights.innerHTML = '';
        const rows = Array.isArray(about.highlights) ? about.highlights : [];
        rows.forEach((text) => {
            const li = document.createElement('li');
            li.textContent = text;
            highlights.appendChild(li);
        });
    }
    if (stats) {
        stats.innerHTML = '';
        const rows = Array.isArray(about.stats) ? about.stats : [];
        rows.forEach((row) => {
            const card = document.createElement('div');
            card.className = 'about-stat';
            card.innerHTML = `
                <span class="about-stat-label">${escapeHtml(row.label || '')}</span>
                <span class="about-stat-value">${escapeHtml(row.value || '')}</span>
            `;
            stats.appendChild(card);
        });
    }
}

function populateHeroHighlights(bio) {
    const row = document.getElementById('hero-pill-row');
    if (!row) return;
    row.innerHTML = '';
    const pills = [];
    if (bio && bio.title) pills.push(String(bio.title).trim());
    pills.push('Cyber Security');
    pills.push('Open to Internship Opportunities');
    pills.forEach((item) => {
        if (!item) return;
        const span = document.createElement('span');
        span.className = 'hero-pill';
        span.textContent = item;
        row.appendChild(span);
    });
}

let skillsTabListenersBound = false;

function populateSkills(skills) {
    const techContainer = document.getElementById('technical-skills-container');
    if (techContainer) {
        techContainer.innerHTML = '';
        const technicalCategories = Array.isArray(skills.technicalCategories)
            ? skills.technicalCategories
            : [];
        technicalCategories.forEach((category) => {
            const card = document.createElement('article');
            card.className = 'skill-category-card';
            const title = escapeHtml(category.title || 'Technical Skills');
            const icon = escapeHtml(category.icon || '🛠️');
            const tags = Array.isArray(category.items)
                ? category.items
                      .map((item) => `<li class="skill-tag">${escapeHtml(item)}</li>`)
                      .join('')
                : '';
            card.innerHTML = `
                <h3 class="skill-category-title"><span class="skill-category-icon" aria-hidden="true">${icon}</span> ${title}</h3>
                <ul class="skill-tag-list">${tags}</ul>
            `;
            techContainer.appendChild(card);
        });
    }

    const softContainer = document.getElementById('soft-skills-container');
    if (softContainer) {
        softContainer.innerHTML = '';
        const softSkills = skills.soft || [];
        softSkills.forEach((skill) => {
            const card = document.createElement('article');
            card.className = 'soft-skill-card';
            const title = typeof skill === 'string' ? skill : skill.title || '';
            const icon = typeof skill === 'string' ? '✨' : skill.icon || '✨';
            const description =
                typeof skill === 'string'
                    ? 'Professional interpersonal capability that supports strong technical execution.'
                    : skill.description || '';
            card.innerHTML = `
                <h3 class="soft-skill-title"><span class="soft-skill-icon" aria-hidden="true">${escapeHtml(icon)}</span> ${escapeHtml(title)}</h3>
                <p class="soft-skill-description">${escapeHtml(description)}</p>
            `;
            softContainer.appendChild(card);
        });
    }

    const techCount = (skills.technicalCategories || []).length;
    const softCount = (skills.soft || []).length;
    setupSkillsTabs(techCount, softCount);
    populateTools(Array.isArray(skills.tools) ? skills.tools : []);
}

function populateTools(tools) {
    const container = document.getElementById('tools-container');
    if (!container) return;
    container.innerHTML = '';
    tools.forEach((tool) => {
        const tag = document.createElement('span');
        tag.className = 'tool-chip';
        tag.textContent = tool;
        container.appendChild(tag);
    });
}

function setupSkillsTabs(techCount, softCount) {
    const techBtn = document.getElementById('skills-tab-tech');
    const softBtn = document.getElementById('skills-tab-soft');
    const techPanel = document.getElementById('technical-skills-panel');
    const softPanel = document.getElementById('soft-skills-panel');
    if (!techBtn || !softBtn || !techPanel || !softPanel) return;

    function setActive(which) {
        const tech = which === 'tech';
        techBtn.classList.toggle('is-active', tech);
        softBtn.classList.toggle('is-active', !tech);
        techBtn.setAttribute('aria-selected', tech ? 'true' : 'false');
        softBtn.setAttribute('aria-selected', tech ? 'false' : 'true');
        techPanel.hidden = !tech;
        softPanel.hidden = tech;
    }

    if (!skillsTabListenersBound) {
        skillsTabListenersBound = true;
        techBtn.addEventListener('click', () => setActive('tech'));
        softBtn.addEventListener('click', () => setActive('soft'));
    }

    if (techCount === 0 && softCount > 0) {
        setActive('soft');
    } else {
        setActive('tech');
    }
}

function populateCertifications(certifications) {
    const list = document.getElementById('cert-list');
    if (!list) return;
    list.innerHTML = '';
    certifications.forEach((cert) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <h4>${escapeHtml(cert.name)}</h4>
            <span>${escapeHtml(cert.issuer)} &bull; ${escapeHtml(cert.date)}</span>
        `;
        list.appendChild(li);
    });
}

function renderEducationEntry(parent, edu) {
    if (!parent || !edu) return;
    const item = document.createElement('div');
    item.className = 'timeline-item glass-panel';
    item.style.marginBottom = '1.5rem';

    const dateEl = document.createElement('div');
    dateEl.className = 'timeline-date';
    dateEl.textContent = edu.year || '';
    item.appendChild(dateEl);

    const h3 = document.createElement('h3');
    h3.textContent = edu.degree || '';
    item.appendChild(h3);

    const h4 = document.createElement('h4');
    h4.className = 'neon-text';
    h4.style.fontSize = '0.9rem';
    h4.style.marginBottom = '0.5rem';
    h4.textContent = edu.institution || '';
    item.appendChild(h4);

    if (edu.details) {
        const p = document.createElement('p');
        p.className = 'education-details';
        p.textContent = edu.details;
        item.appendChild(p);
    }

    const subjects = Array.isArray(edu.subjects) ? edu.subjects : [];
    if (subjects.length) {
        const deg = String(edu.degree || '').toLowerCase();
        let defaultLabel = 'Results';
        if (deg.includes('advanced level') || deg.includes('a/l') || deg.includes('a.l')) {
            defaultLabel = 'A/L results';
        } else if (deg.includes('ordinary level') || deg.includes('o/l') || deg.includes('o.l')) {
            defaultLabel = 'O/L results';
        }
        const heading = edu.resultsTitle || defaultLabel;

        const details = document.createElement('details');
        details.className = 'education-results-details';

        const summary = document.createElement('summary');
        summary.className = 'education-results-summary';
        summary.textContent = edu.resultsSummary || `View ${heading}`;

        const ul = document.createElement('ul');
        ul.className = 'education-subject-list';
        subjects.forEach((row) => {
            const li = document.createElement('li');
            const nameSpan = document.createElement('span');
            nameSpan.className = 'education-subject-name';
            nameSpan.textContent = row.name || '';
            const gradeSpan = document.createElement('span');
            gradeSpan.className = 'education-subject-grade';
            gradeSpan.textContent = row.grade || '';
            li.appendChild(nameSpan);
            li.appendChild(gradeSpan);
            ul.appendChild(li);
        });

        details.appendChild(summary);
        details.appendChild(ul);
        item.appendChild(details);
    }

    parent.appendChild(item);
}

function populateEducation(education) {
    const timeline = document.getElementById('education-timeline');
    if (!timeline) return;
    timeline.innerHTML = '';
    const list = Array.isArray(education) ? education : [];
    list.forEach((edu) => renderEducationEntry(timeline, edu));
}

function populateExtracurricular(block) {
    const root = document.getElementById('extracurricular-root');
    const section = document.getElementById('extracurricular');
    if (!root || !section) return;

    const items = block && Array.isArray(block.items) ? block.items : [];
    if (!items.length) {
        root.innerHTML = '';
        section.hidden = true;
        return;
    }

    section.hidden = false;
    root.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'achievement-card glass-panel extracurricular-card';

    const header = document.createElement('div');
    header.className = 'achievement-header';
    const badge = document.createElement('span');
    badge.className = 'achievement-badge';
    badge.textContent = block.categoryLabel || block.sportLabel || 'Extracurricular';
    header.appendChild(badge);

    if (block.intro) {
        const intro = document.createElement('p');
        intro.className = 'achievement-intro';
        intro.textContent = block.intro;
        header.appendChild(intro);
    }
    wrap.appendChild(header);

    const list = document.createElement('ul');
    list.className = 'achievement-list';
    items.forEach((row, index) => {
        const li = document.createElement('li');
        li.className = 'achievement-item';
        li.style.animationDelay = `${index * 0.06}s`;
        const when = document.createElement('span');
        when.className = 'achievement-when';
        when.textContent = row.when || '';
        const text = document.createElement('span');
        text.className = 'achievement-text';
        text.textContent = row.text || '';
        li.appendChild(when);
        li.appendChild(text);
        list.appendChild(li);
    });
    wrap.appendChild(list);
    root.appendChild(wrap);
}

function populateExperience(experiences) {
    const root = document.getElementById('experience-list');
    if (!root) return;
    root.innerHTML = '';
    if (!experiences || !experiences.length) return;

    experiences.forEach((exp, index) => {
        const card = document.createElement('article');
        card.className = 'experience-card glass-panel';
        const bullets = Array.isArray(exp.bullets) ? exp.bullets : [];
        const bulletsHtml = bullets
            .map((b) => `<li>${escapeHtml(b)}</li>`)
            .join('');
        const tagline = exp.tagline ? `<p class="experience-tagline">${escapeHtml(exp.tagline)}</p>` : '';

        card.innerHTML = `
            <div class="experience-card-meta">
                <span class="experience-tier">${escapeHtml(exp.tier || 'Experience')}</span>
                <span class="experience-context">${escapeHtml(exp.context || '')}</span>
            </div>
            <h3 class="experience-card-title">${escapeHtml(exp.title || '')}</h3>
            <p class="experience-card-role neon-text">${escapeHtml(exp.role || '')}</p>
            ${tagline}
            <ul class="experience-bullets">${bulletsHtml}</ul>
        `;
        card.style.animationDelay = `${index * 0.08}s`;
        root.appendChild(card);
    });
}

const DEFAULT_PROJECT_CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'security', label: 'Security' },
    { id: 'web', label: 'Web' },
    { id: 'iot', label: 'IoT' }
];

function normalizeProjectCategory(raw) {
    const c = String(raw || 'other').toLowerCase();
    if (c === 'security' || c === 'web' || c === 'iot') return c;
    return 'other';
}

function categoryLabel(categoryId, tabsDef) {
    const row = tabsDef.find((t) => t.id === categoryId);
    if (row && row.label) return row.label;
    if (categoryId === 'other') return 'Other';
    return categoryId;
}

function populateProjects(projects, projectCategoryConfig) {
    const root = document.getElementById('projects-grid');
    if (!root) return;
    root.innerHTML = '';

    const tabsDef =
        Array.isArray(projectCategoryConfig) && projectCategoryConfig.length > 0
            ? projectCategoryConfig
            : DEFAULT_PROJECT_CATEGORIES;

    const tabRow = document.createElement('div');
    tabRow.className = 'project-category-tabs';
    tabRow.setAttribute('role', 'tablist');
    tabRow.setAttribute('aria-label', 'Filter projects by category');

    const innerGrid = document.createElement('div');
    innerGrid.className = 'projects-grid projects-grid-cards';

    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'projects-empty-msg';
    emptyMsg.hidden = true;
    emptyMsg.textContent = 'No projects in this category yet.';

    window.portfolioProjects = projects;

    function applyFilter(activeId) {
        tabRow.querySelectorAll('.project-category-tab').forEach((btn) => {
            const on = btn.dataset.category === activeId;
            btn.classList.toggle('is-active', on);
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
        });

        let visible = 0;
        innerGrid.querySelectorAll('.project-card').forEach((card) => {
            const c = card.dataset.projectCategory || 'other';
            const show = activeId === 'all' || c === activeId;
            card.toggleAttribute('hidden', !show);
            if (show) visible += 1;
        });
        emptyMsg.hidden = visible > 0;
    }

    tabsDef.forEach((tab) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'project-category-tab';
        btn.dataset.category = tab.id;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-controls', 'projects-grid-cards');
        btn.id = `project-tab-${tab.id}`;
        btn.textContent = tab.label;
        btn.addEventListener('click', () => applyFilter(tab.id));
        tabRow.appendChild(btn);
    });

    innerGrid.id = 'projects-grid-cards';

    projects.forEach((project, index) => {
        const card = document.createElement('div');
        card.className = 'project-card glass-panel';
        const cat = normalizeProjectCategory(project.category);
        card.dataset.projectCategory = cat;

        const href = safeExternalHref(project.link);
        if (project.screenshots && project.screenshots.length > 0) {
            card.style.cursor = 'pointer';
            card.onclick = () => window.openModal(index);
        }

        const catLabel = escapeHtml(categoryLabel(cat, tabsDef));
        const techList = Array.isArray(project.tech)
            ? `<ul class="project-tech-list">${project.tech
                  .map((tech) => `<li>${escapeHtml(tech)}</li>`)
                  .join('')}</ul>`
            : '';
        const outcomes = Array.isArray(project.outcomes)
            ? `<ul class="project-outcomes">${project.outcomes
                  .map((outcome) => `<li>${escapeHtml(outcome)}</li>`)
                  .join('')}</ul>`
            : '';
        card.innerHTML = `
            <p class="project-card-category">${catLabel}</p>
            <h3>${escapeHtml(project.title)}</h3>
            <p class="project-card-role">${escapeHtml(project.role || '')}</p>
            <p class="project-card-desc">${escapeHtml(project.description)}</p>
            ${techList}
            ${outcomes}
        `;
        const repoLink = document.createElement('a');
        repoLink.href = href;
        repoLink.textContent = href === '#' ? 'Project Details' : 'View Repository';
        repoLink.addEventListener('click', (e) => e.stopPropagation());
        if (href.startsWith('http')) {
            repoLink.target = '_blank';
            repoLink.rel = 'noopener noreferrer';
        }
        card.appendChild(repoLink);
        innerGrid.appendChild(card);
    });

    root.appendChild(tabRow);
    root.appendChild(innerGrid);
    root.appendChild(emptyMsg);

    applyFilter('all');
}

function initBackToTop() {
    const button = document.getElementById('back-to-top');
    if (!button) return;
    const toggleVisibility = () => {
        const show = window.scrollY > 420;
        button.classList.toggle('is-visible', show);
    };
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    toggleVisibility();
}

function initNavbarScrollState() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    const apply = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
    window.addEventListener('scroll', apply, { passive: true });
    apply();
}

function initRevealOnScroll() {
    const targets = document.querySelectorAll(
        '.section:not(.content-panel), .hero-content, .project-card, .experience-card'
    );
    if (!targets.length || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-up', 'is-visible');
                    obs.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.14 }
    );
    targets.forEach((el) => {
        el.classList.add('reveal-up');
        obs.observe(el);
    });
}

function initSlidePanels() {
    const overlay = document.getElementById('panel-overlay');
    const panelLinks = document.querySelectorAll('a[href^="#"]');
    const panels = Array.from(document.querySelectorAll('.content-panel'));
    if (!overlay || !panels.length) return;
    const NAV_SELECTOR = '.nav-links a[href^="#"]';
    const panelTitleMap = {
        about: 'About',
        skills: 'Skills',
        educational: 'Education',
        experience: 'Experience',
        certifications: 'Certificates',
        projects: 'Projects',
        extracurricular: 'Extracurricular',
        contact: 'Contact'
    };
    const PRIMARY_SLIDES = [
        'about',
        'skills',
        'projects',
        'certifications',
        'experience',
        'extracurricular',
        'contact'
    ];
    const PRIMARY_NEXT_MAP = {
        about: 'skills',
        skills: 'projects',
        projects: 'certifications',
        certifications: 'experience',
        experience: 'extracurricular',
        extracurricular: 'contact',
        contact: null
    };
    const orderedPanelIds = panels.map((panel) => panel.id).filter(Boolean);
    let activePanelId = null;
    const PANEL_TRANSITION_MS = 880;
    let isTransitioning = false;

    function setActiveNav(panelId) {
        document.querySelectorAll(NAV_SELECTOR).forEach((a) => {
            const active = panelId && a.getAttribute('href') === '#' + panelId;
            a.classList.toggle('is-active', !!active);
        });
    }

    function closePanels(options = {}) {
        if (isTransitioning) return;
        const { returnHome = false } = options;
        const activePanel = activePanelId ? document.getElementById(activePanelId) : null;
        if (activePanel) {
            activePanel.classList.add('is-leaving-right');
        }
        panels.forEach((panel) => {
            panel.classList.remove('is-open');
            panel.classList.remove('enter-from-left', 'enter-from-right');
            panel.classList.remove('is-leaving-left', 'is-leaving-right');
            panel.setAttribute('aria-hidden', 'true');
            panel.style.transition = '';
            panel.style.transform = '';
        });
        overlay.hidden = true;
        document.body.classList.remove('panel-open');
        setActiveNav(null);
        activePanelId = null;
        if (returnHome) {
            const hero = document.getElementById('hero');
            if (hero) {
                hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }

    function getAlternatingExitDirection(panelId) {
        const index = PRIMARY_SLIDES.indexOf(panelId);
        if (index < 0) return 'left';
        return index % 2 === 0 ? 'left' : 'right';
    }

    function oppositeDirection(direction) {
        return direction === 'left' ? 'right' : 'left';
    }

    function setPanelVisible(panel, visible) {
        if (!panel) return;
        panel.classList.toggle('is-open', !!visible);
        panel.setAttribute('aria-hidden', visible ? 'false' : 'true');
    }

    function clearTransitionClasses(panel) {
        if (!panel) return;
        panel.classList.remove('enter-from-left', 'enter-from-right');
        panel.classList.remove('is-leaving-left', 'is-leaving-right');
    }

    function getDirection(fromId, toId) {
        if (!fromId || !toId) return 'forward';
        const fromIndex = orderedPanelIds.indexOf(fromId);
        const toIndex = orderedPanelIds.indexOf(toId);
        if (fromIndex < 0 || toIndex < 0) return 'forward';
        return toIndex >= fromIndex ? 'forward' : 'backward';
    }

    function openPanelById(id) {
        if (isTransitioning) return;
        const target = document.getElementById(id);
        if (!target || !target.classList.contains('content-panel')) return;
        if (activePanelId === id) return;

        const direction = getDirection(activePanelId, id);
        const entryDirectionForGeneric = direction === 'backward' ? 'left' : 'right';
        const currentPanel = activePanelId ? document.getElementById(activePanelId) : null;
        let exitDirection = currentPanel ? getAlternatingExitDirection(activePanelId) : 'left';
        let enterDirection = oppositeDirection(exitDirection);
        if (
            !PRIMARY_SLIDES.includes(activePanelId || '') ||
            !PRIMARY_SLIDES.includes(id)
        ) {
            enterDirection = entryDirectionForGeneric;
            exitDirection = enterDirection === 'left' ? 'right' : 'left';
        }

        overlay.hidden = false;
        document.body.classList.add('panel-open');
        isTransitioning = true;

        const showTarget = () => {
            panels.forEach((panel) => {
                if (panel !== target) {
                    clearTransitionClasses(panel);
                    setPanelVisible(panel, false);
                }
            });
            clearTransitionClasses(target);
            setPanelVisible(target, true);
            target.classList.add(enterDirection === 'left' ? 'enter-from-left' : 'enter-from-right');
            requestAnimationFrame(() => {
                setPanelVisible(target, true);
                target.classList.remove('enter-from-left', 'enter-from-right');
                setTimeout(() => {
                    clearTransitionClasses(target);
                    isTransitioning = false;
                }, PANEL_TRANSITION_MS + 40);
            });
            setActiveNav(id);
            activePanelId = id;
        };

        if (currentPanel && currentPanel !== target) {
            clearTransitionClasses(currentPanel);
            currentPanel.classList.add(
                exitDirection === 'left' ? 'is-leaving-left' : 'is-leaving-right'
            );
            setTimeout(() => {
                clearTransitionClasses(currentPanel);
                setPanelVisible(currentPanel, false);
                showTarget();
            }, PANEL_TRANSITION_MS + 20);
            return;
        }

        showTarget();
    }

    function createPanelNextControls() {
        panels.forEach((panel, index) => {
            if (panel.querySelector('.panel-next-wrap')) return;
            const nextId = PRIMARY_NEXT_MAP[panel.id];
            const wrap = document.createElement('div');
            wrap.className = 'panel-next-wrap';
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn primary-btn panel-next-btn';
            if (typeof nextId === 'undefined') {
                return;
            }
            if (nextId) {
                const nextTitle = panelTitleMap[nextId] || 'Section';
                btn.textContent = `View ${nextTitle}`;
                btn.addEventListener('click', () => openPanelById(nextId));
            } else {
                btn.classList.remove('primary-btn');
                btn.classList.add('secondary-btn');
                btn.textContent = 'Back to Home';
                btn.addEventListener('click', () => closePanels({ returnHome: true }));
            }
            wrap.appendChild(btn);
            panel.appendChild(wrap);
        });
    }

    panels.forEach((panel) => {
        if (!panel.querySelector('.panel-topbar')) {
            const panelId = panel.id || '';
            const topbar = document.createElement('div');
            topbar.className = 'panel-topbar';
            const title = document.createElement('h3');
            title.className = 'panel-topbar-title';
            title.textContent = panelTitleMap[panelId] || 'Section';
            topbar.appendChild(title);
            panel.prepend(topbar);
        }
        const topbar = panel.querySelector('.panel-topbar');
        if (!topbar) return;
        if (!topbar.querySelector('.panel-topbar-right')) {
            const right = document.createElement('div');
            right.className = 'panel-topbar-right';
            const progressIndex = PRIMARY_SLIDES.indexOf(panel.id);
            if (progressIndex >= 0) {
                const progress = document.createElement('span');
                progress.className = 'panel-progress';
                progress.textContent = `${progressIndex + 1}/${PRIMARY_SLIDES.length}`;
                right.appendChild(progress);
            }
            topbar.appendChild(right);
        }
        if (topbar.querySelector('.panel-close-btn')) return;
        const rightSlot = topbar.querySelector('.panel-topbar-right') || topbar;
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'panel-close-btn';
        closeBtn.setAttribute('aria-label', 'Close panel');
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', closePanels);
        rightSlot.appendChild(closeBtn);
    });
    createPanelNextControls();

    panelLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;
            const id = href.slice(1);
            const target = document.getElementById(id);
            if (!target || !target.classList.contains('content-panel')) return;
            e.preventDefault();
            openPanelById(id);
        });
    });

    overlay.addEventListener('click', closePanels);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePanels();
    });

    // Mobile swipe-to-close for open panels.
    panels.forEach((panel) => {
        let startX = 0;
        let startY = 0;
        let dragging = false;
        let deltaX = 0;
        panel.addEventListener(
            'touchstart',
            (e) => {
                if (!panel.classList.contains('is-open')) return;
                const t = e.touches[0];
                startX = t.clientX;
                startY = t.clientY;
                deltaX = 0;
                dragging = false;
            },
            { passive: true }
        );
        panel.addEventListener(
            'touchmove',
            (e) => {
                if (!panel.classList.contains('is-open')) return;
                const t = e.touches[0];
                const dx = t.clientX - startX;
                const dy = t.clientY - startY;
                if (!dragging) {
                    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) && dx > 0) {
                        dragging = true;
                    } else {
                        return;
                    }
                }
                deltaX = Math.max(0, dx);
                panel.style.transition = 'none';
                panel.style.transform = `translateX(${deltaX}px)`;
            },
            { passive: true }
        );
        panel.addEventListener('touchend', () => {
            if (!panel.classList.contains('is-open') || !dragging) return;
            panel.style.transition = '';
            panel.style.transform = '';
            if (deltaX > 90) {
                closePanels();
            }
            dragging = false;
            deltaX = 0;
        });
    });
}

window.openModal = function (projectIndex) {
    const project = window.portfolioProjects && window.portfolioProjects[projectIndex];
    if (!project || !project.screenshots || !project.screenshots.length) return;

    const modalTitle = document.getElementById('modal-title');
    const gallery = document.getElementById('modal-gallery');
    const modal = document.getElementById('project-modal');
    if (!modalTitle || !gallery || !modal) return;

    modalTitle.textContent = project.title || 'Project';
    gallery.innerHTML = '';

    project.screenshots.forEach((src) => {
        const img = document.createElement('img');
        img.src = String(src);
        img.alt = (project.title || 'Project') + ' screenshot';
        gallery.appendChild(img);
    });

    modal.classList.add('show');
};

const closeModalEl = document.getElementById('close-modal');
if (closeModalEl) {
    closeModalEl.addEventListener('click', () => {
        const modal = document.getElementById('project-modal');
        if (modal) modal.classList.remove('show');
    });
}

window.addEventListener('click', (e) => {
    const modal = document.getElementById('project-modal');
    if (modal && e.target === modal) {
        modal.classList.remove('show');
    }
});

function formatLocalPhoneDisplay(raw) {
    const digits = String(raw || '').replace(/\D/g, '');
    if (digits.length === 10 && digits.startsWith('0')) {
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    return String(raw || '').trim();
}

function appendContactBubble(container, { href, label, sublabel, external, title }) {
    const a = document.createElement('a');
    a.className = 'contact-bubble';
    a.href = href;
    if (title) a.setAttribute('title', title);
    if (external) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
    }
    const lab = document.createElement('span');
    lab.className = 'contact-bubble-label' + (sublabel ? '' : ' contact-bubble-label--solo');
    lab.textContent = label;
    a.appendChild(lab);
    if (sublabel) {
        const sub = document.createElement('span');
        sub.className = 'contact-bubble-sublabel';
        sub.textContent = sublabel;
        a.appendChild(sub);
    }
    container.appendChild(a);
}

function getContactPhoneInfo(phoneRaw) {
    const raw = String(phoneRaw || '').trim();
    if (!raw) return null;
    const digits = raw.replace(/\D/g, '');
    if (!digits) return null;
    let intl = digits;
    if (digits.startsWith('0') && digits.length >= 9) {
        intl = '94' + digits.slice(1);
    } else if (!digits.startsWith('94')) {
        intl = '94' + digits;
    }
    return {
        display: raw,
        tel: 'tel:+' + intl,
        wa: 'https://wa.me/' + intl,
        e164: '+' + intl
    };
}

let contactFormSubmitBound = false;

function initContactFormSubmit() {
    if (contactFormSubmitBound) return;
    const form = document.getElementById('contact-form');
    if (!form) return;
    contactFormSubmitBound = true;
    form.addEventListener('submit', handleContactFormSubmit);
}

async function handleContactFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const status = document.getElementById('contact-form-status');
    const submitBtn = document.getElementById('contact-form-submit');
    const nameEl = document.getElementById('contact-name');
    const emailEl = document.getElementById('contact-email');
    const messageEl = document.getElementById('contact-message');
    if (!status || !nameEl || !emailEl || !messageEl) return;

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const message = messageEl.value.trim();
    const toEmail = (form.dataset.toEmail || '').trim();
    const web3key = (form.dataset.web3formsKey || '').trim();
    const ownerPhoneDisplay = (form.dataset.ownerPhoneDisplay || '').trim();
    const ownerPhoneE164 = (form.dataset.ownerPhoneE164 || '').trim();

    status.className = 'contact-form-status';
    status.textContent = '';

    if (!toEmail) {
        status.textContent = 'The contact form is not set up yet.';
        status.classList.add('error');
        return;
    }
    if (!name || !email || !message) {
        status.textContent = 'Please fill in your name, email, and message.';
        status.classList.add('error');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = 'Please enter a valid email address.';
        status.classList.add('error');
        return;
    }

    if (web3key) {
        if (submitBtn) submitBtn.disabled = true;
        try {
            const web3Body = {
                access_key: web3key,
                subject: `Portfolio message from ${name}`,
                name,
                email,
                message,
                from_name: name,
                replyto: email
            };
            if (ownerPhoneDisplay) {
                web3Body.portfolio_phone = ownerPhoneDisplay;
            }
            if (ownerPhoneE164) {
                web3Body.portfolio_phone_e164 = ownerPhoneE164;
            }
            const res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(web3Body)
            });
            const payload = await res.json();
            if (payload.success) {
                status.textContent = 'Thank you! Your message was sent.';
                status.classList.add('success');
                form.reset();
            } else {
                throw new Error(payload.message || 'Send failed');
            }
        } catch (err) {
            console.error(err);
            status.textContent =
                'Could not send the message. Try the Email link above, or try again later.';
            status.classList.add('error');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
        return;
    }

    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const maxLen = 1000;
    const msgBody =
        message.length > maxLen
            ? `${message.slice(0, maxLen)}\n… [truncated — keep messages under ~1000 characters for this send method]`
            : message;
    const phoneFooter =
        ownerPhoneDisplay && ownerPhoneE164
            ? `\n\n---\nContact number on portfolio: ${ownerPhoneDisplay} (${ownerPhoneE164})`
            : ownerPhoneDisplay
              ? `\n\n---\nContact number on portfolio: ${ownerPhoneDisplay}`
              : '';
    const body = encodeURIComponent(
        `Name: ${name}\nTheir email (reply to): ${email}\n\nMessage:\n${msgBody}${phoneFooter}`
    );
    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
    status.textContent =
        'Your email app should open with this message ready to send. If it does not, use the Email link above.';
    status.classList.add('success');
}

function populateContact(contact) {
    const links = document.getElementById('social-links');
    if (!links) return;
    links.innerHTML = '';

    const line1 = document.createElement('div');
    line1.className = 'contact-bubbles-line contact-bubbles-line--primary';
    const line2 = document.createElement('div');
    line2.className = 'contact-bubbles-line contact-bubbles-line--social';

    const c = contact || {};
    if (c.email) {
        const raw = String(c.email).trim().replace(/^mailto:/i, '');
        if (raw) {
            appendContactBubble(line1, {
                href: 'mailto:' + raw,
                label: 'Email',
                sublabel: raw,
                title: raw
            });
        }
    }

    const phoneInfo = c.phone ? getContactPhoneInfo(c.phone) : null;
    if (phoneInfo) {
        const pretty = formatLocalPhoneDisplay(phoneInfo.display);
        appendContactBubble(line1, {
            href: phoneInfo.tel,
            label: 'Mobile',
            sublabel: pretty,
            title: 'Call ' + pretty
        });
        appendContactBubble(line1, {
            href: phoneInfo.wa,
            label: 'WhatsApp',
            sublabel: pretty,
            external: true,
            title: 'Message on WhatsApp'
        });
    }

    const linkedinUrl = c.linkedin ? safeExternalHref(c.linkedin) : '#';
    if (linkedinUrl && linkedinUrl !== '#') {
        appendContactBubble(line2, {
            href: linkedinUrl,
            label: 'LinkedIn',
            external: true,
            title: 'LinkedIn profile'
        });
    }
    const githubUrl = c.github ? safeExternalHref(c.github) : '#';
    if (githubUrl && githubUrl !== '#') {
        appendContactBubble(line2, {
            href: githubUrl,
            label: 'GitHub',
            external: true,
            title: 'GitHub profile'
        });
    }

    if (line1.childElementCount > 0) {
        links.appendChild(line1);
    }
    if (line2.childElementCount > 0) {
        links.appendChild(line2);
    }

    const intro = document.getElementById('contact-form-intro');
    if (intro) {
        if (phoneInfo) {
            intro.textContent =
                'Leave your name, email, and message below. You can also reach me on ' +
                phoneInfo.display +
                ' (call or WhatsApp). I will get back to you when I can.';
        } else {
            intro.textContent =
                'Leave your name, email, and message. I will get back to you when I can.';
        }
    }

    const wrap = document.getElementById('contact-message-wrap');
    const form = document.getElementById('contact-form');
    if (wrap && form) {
        const to = c.email ? String(c.email).trim().replace(/^mailto:/i, '') : '';
        if (to) {
            wrap.hidden = false;
            form.dataset.toEmail = to;
            form.dataset.web3formsKey = c.formAccessKey ? String(c.formAccessKey).trim() : '';
            if (phoneInfo) {
                form.dataset.ownerPhoneDisplay = phoneInfo.display;
                form.dataset.ownerPhoneE164 = phoneInfo.e164;
            } else {
                delete form.dataset.ownerPhoneDisplay;
                delete form.dataset.ownerPhoneE164;
            }
        } else {
            wrap.hidden = true;
        }
    }
    initContactFormSubmit();
}
