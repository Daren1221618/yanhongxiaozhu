/**
 * 嫣红小主 · 静态站点构建脚本 — 完全自包含版本
 * 将所有 CSS、JS 和内容内嵌到单个 HTML 文件中
 * 生成的 dist/index.html 可以直接双击在浏览器中打开
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const DIST_DIR = path.join(__dirname, 'dist');

// Read content
const content = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
const { site, sections } = content;

// Read CSS
const cssRaw = fs.readFileSync(path.join(PUBLIC_DIR, 'css', 'style.css'), 'utf-8');

// Build sections HTML
function buildSectionsHTML(sections) {
  let html = '';
  sections.forEach((section, index) => {
    const sectionNum = String(index + 1).padStart(2, '0');
    html += `
      <section class="section" id="${section.id}">
        <div class="section-inner">
          <div class="section-header animate-on-scroll">
            <div class="section-number">No. ${sectionNum}</div>
            <h2 class="section-title">${escapeHtml(section.title)}</h2>
            ${section.subtitle ? `<p class="section-subtitle">${escapeHtml(section.subtitle)}</p>` : ''}
          </div>
          <div class="section-divider"><span>✦</span></div>
          ${section.content || ''}
        </div>
      </section>`;
  });
  return html;
}

// Build navigation HTML
function buildNavHTML(sections) {
  let html = '';
  sections.forEach(section => {
    const label = section.navLabel || section.title;
    html += `<a href="#${section.id}">${escapeHtml(label)}</a>`;
  });
  return html;
}

const sectionsHTML = buildSectionsHTML(sections);
const navHTML = buildNavHTML(sections);
const footerLinksHTML = buildNavHTML(sections);

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Build the complete self-contained HTML
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(site.description)}">
  <title>${escapeHtml(site.name)} · ${escapeHtml(site.subtitle)} — ${escapeHtml(site.tagline)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
${cssRaw}
  </style>
</head>
<body>
  <div class="bg-pattern"></div>

  <!-- Navigation -->
  <nav class="nav" id="nav">
    <div class="nav-inner">
      <a href="#hero" class="nav-logo">
        ${escapeHtml(site.logo || site.name)}<small>· ${escapeHtml(site.subtitle)}</small>
      </a>
      <div class="nav-links" id="navLinks">
        ${navHTML}
      </div>
      <button class="nav-toggle" id="navToggle" aria-label="菜单">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <!-- Main Content -->
  <main id="main-content">
    ${sectionsHTML}
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">${escapeHtml(site.name)}</div>
      <div class="footer-tagline">${escapeHtml(site.tagline)}</div>
      <div class="footer-links">
        ${footerLinksHTML}
      </div>
      <div class="footer-copy">${escapeHtml(site.footerText || '')}</div>
    </div>
  </footer>

  <script>
(function () {
  'use strict';

  const nav = document.getElementById('nav');
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');
  const sections = document.querySelectorAll('.section');

  // ─── Nav Background ───────────────────────────────────
  function updateNavBackground() {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  // ─── Active Nav ───────────────────────────────────────
  function updateActiveNav() {
    const links = navLinks.querySelectorAll('a');
    let currentId = '';
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= 150) {
        currentId = section.id;
      }
    });
    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentId) {
        link.classList.add('active');
      }
    });
  }

  // ─── Mobile Menu ──────────────────────────────────────
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });

  // ─── Smooth Scroll ────────────────────────────────────
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    e.preventDefault();
    const target = document.getElementById(link.getAttribute('href').substring(1));
    if (!target) return;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 10,
      behavior: 'smooth'
    });
  });

  // ─── Scroll Animations ────────────────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.section-header, .pain-card, .value-card, .stat-card, .comp-card, .case-card, .model-tier, .asset-card, .finance-card, .roi-card, .vision-phase, .timing-item').forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });

  // ─── Scroll Handler ───────────────────────────────────
  window.addEventListener('scroll', () => {
    updateNavBackground();
    updateActiveNav();
  }, { passive: true });

  // ─── Resize ───────────────────────────────────────────
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });

  // ─── Init ─────────────────────────────────────────────
  updateNavBackground();
  updateActiveNav();
})();
  </script>
</body>
</html>`;

// Ensure dist directory
if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });

// Write the self-contained HTML
fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html, 'utf-8');

console.log('✅ 完全自包含静态站点已生成: dist/index.html');
console.log(`   包含 ${sections.length} 个章节`);
console.log('   所有 CSS 和 JS 已内嵌');
console.log('   可直接双击用浏览器打开');
console.log('   也可上传到任意静态托管平台');
