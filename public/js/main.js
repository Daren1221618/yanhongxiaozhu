/**
 * 嫣红小主 · 花果茶鲜酿 — 前端交互脚本
 * 东方微醺美学 — 单页滚动长页面
 */

(function () {
  'use strict';

  // ─── DOM References ────────────────────────────────────
  const mainContent = document.getElementById('main-content');
  const loading = document.getElementById('loading');
  const nav = document.getElementById('nav');
  const navLogo = document.getElementById('navLogo');
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');
  const footerLinks = document.getElementById('footerLinks');
  const footerCopy = document.getElementById('footerCopy');

  let sectionsData = [];
  let siteData = {};

  // ─── Content Loading (API mode with static fallback) ────
  async function fetchContent() {
    // Static mode: content embedded at build time
    if (window.__STATIC_DATA__) {
      return window.__STATIC_DATA__;
    }

    // API mode: load from backend server
    try {
      const res = await fetch('/api/sections');
      if (!res.ok) throw new Error('Failed to load content');
      const data = await res.json();
      return data;
    } catch (err) {
      // Fallback to static data if API unavailable and static data exists
      if (window.__STATIC_DATA__) {
        return window.__STATIC_DATA__;
      }
      console.error('Failed to load content:', err);
      return null;
    }
  }

  // ─── Render Sections ────────────────────────────────────
  function renderSections(data) {
    siteData = data.site || {};
    sectionsData = data.sections || [];

    // Update logo (text or image)
    updateLogo(siteData);

    // Update document title
    document.title = `${siteData.name} · ${siteData.subtitle} — ${siteData.tagline}`;

    // Update footer
    if (footerCopy) {
      footerCopy.textContent = siteData.footerText || '© 2026 嫣红小主 · 花果茶鲜酿。保留所有权利。';
    }

    // Build sections HTML
    let html = '';

    sectionsData.forEach((section, index) => {
      const sectionNum = String(index + 1).padStart(2, '0');
      html += `
      <section class="section" id="${section.id}">
        <div class="section-inner">
          <div class="section-header">
            <div class="section-number">No. ${sectionNum}</div>
            <h2 class="section-title">${escapeHtml(section.title)}</h2>
            ${section.subtitle ? `<p class="section-subtitle">${escapeHtml(section.subtitle)}</p>` : ''}
          </div>
          <div class="section-divider"><span>✦</span></div>
          ${section.content || ''}
        </div>
      </section>`;
    });

    mainContent.innerHTML = html;

    // Build navigation
    buildNavigation();

    // Build footer links
    buildFooterLinks();
  }

  function buildNavigation() {
    if (!navLinks) return;

    let linksHtml = '';
    sectionsData.forEach(section => {
      const label = section.navLabel || section.title;
      linksHtml += `<a href="#${section.id}">${escapeHtml(label)}</a>`;
    });

    navLinks.innerHTML = linksHtml;

    // Build footer links
    buildFooterLinks();
  }

  function buildFooterLinks() {
    if (!footerLinks) return;

    let linksHtml = '';
    sectionsData.forEach(section => {
      const label = section.navLabel || section.title;
      linksHtml += `<a href="#${section.id}">${escapeHtml(label)}</a>`;
    });

    footerLinks.innerHTML = linksHtml;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── Logo Update ──────────────────────────────────────
  function updateLogo(site) {
    if (!navLogo) return;
    if (site.logoType === 'image' && site.logoUrl) {
      navLogo.innerHTML = `<img src="${escapeHtml(site.logoUrl)}" alt="${escapeHtml(site.name)}">`;
    } else {
      navLogo.innerHTML = `${escapeHtml(site.name)}<small>· ${escapeHtml(site.subtitle)}</small>`;
    }
  }

  // ─── Navigation Active State ────────────────────────────
  function updateActiveNav() {
    const links = navLinks.querySelectorAll('a');
    const sections = document.querySelectorAll('.section');

    let currentId = '';

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 150) {
        currentId = section.id;
      }
    });

    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }

  // ─── Nav Scroll Effect ──────────────────────────────────
  function updateNavBackground() {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  // ─── Mobile Menu ────────────────────────────────────────
  function setupMobileMenu() {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    // Close menu when clicking a link
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
      }
    });
  }

  // ─── Scroll Animations ──────────────────────────────────
  function setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe section headers and cards
    document.querySelectorAll('.section-header, .pain-card, .value-card, .stat-card, .comp-card, .case-card, .model-tier, .asset-card, .finance-card, .roi-card, .vision-phase, .timing-item').forEach(el => {
      el.classList.add('animate-on-scroll');
      observer.observe(el);
    });
  }

  // ─── Smooth Scroll ──────────────────────────────────────
  function setupSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      const navHeight = nav.offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 10;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  }

  // ─── Scroll Event Handler ───────────────────────────────
  function onScroll() {
    updateNavBackground();
    updateActiveNav();
  }

  // ─── Initialize ─────────────────────────────────────────
  async function init() {
    const data = await fetchContent();

    if (!data) {
      mainContent.innerHTML = `
        <section class="section" style="min-height:60vh;display:flex;align-items:center;justify-content:center;">
          <div style="text-align:center;">
            <p style="font-family:var(--font-display);font-size:1.5rem;color:var(--color-primary-dark);">嫣红小主</p>
            <p style="color:var(--color-text-secondary);margin-top:1rem;">内容加载中，请稍候或刷新页面...</p>
          </div>
        </section>`;
      return;
    }

    renderSections(data);

    if (loading) loading.remove();

    // Setup interactions
    setupMobileMenu();
    setupSmoothScroll();
    setupScrollAnimations();

    // Initial scroll check
    updateNavBackground();
    updateActiveNav();

    // Scroll listener
    window.addEventListener('scroll', onScroll, { passive: true });

    // Resize listener for responsive adjustments
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
      }
    });
  }

  // ─── Start ──────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
