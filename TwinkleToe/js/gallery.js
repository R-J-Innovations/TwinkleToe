(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initMobileNav();
    initScrollAnimations();
    initGalleryFilters();
    initGalleryLightbox();
  });

  /* ============================================================
     1. NAVBAR SCROLL BACKGROUND
  ============================================================ */
  function initNavbar() {
    var nav = document.getElementById('navbar');
    if (!nav) return;
    function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 60); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============================================================
     2. MOBILE NAV TOGGLE
  ============================================================ */
  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var menu   = document.getElementById('navMobile');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    menu.querySelectorAll('.nav-mobile-link').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ============================================================
     3. GSAP SCROLL ANIMATIONS
  ============================================================ */
  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      document.querySelectorAll('.gallery-item').forEach(function (el) { el.style.opacity = '1'; });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    var ST = { start: 'top 88%', toggleActions: 'play none none none' };

    gsap.utils.toArray('.section-eyebrow').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: el, ...ST } });
    });
    gsap.utils.toArray('.section-title, .gallery-page-hero h1').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, ...ST } });
    });
    gsap.utils.toArray('.section-desc, .gallery-page-hero p').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    if (document.querySelector('.gallery-full-grid')) {
      gsap.fromTo(
        '.gallery-full-grid .gallery-item',
        { opacity: 0, y: 40, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.65, stagger: 0.07, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.gallery-full-grid', start: 'top 85%' } }
      );
    }

    if (document.querySelector('.gallery-filters')) {
      gsap.fromTo('.gallery-filter-btn',
        { opacity: 0, y: 18, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.gallery-filters', start: 'top 90%' } }
      );
    }

    // Hero floats
    gsap.utils.toArray('.gph-float').forEach(function (el, i) {
      gsap.fromTo(el, { opacity: 0, scale: 0.5 }, { opacity: 0.35, scale: 1, duration: 0.8, delay: 0.5 + i * 0.1, ease: 'back.out(2)' });
    });
  }

  /* ============================================================
     4. GALLERY FILTER TABS
  ============================================================ */
  function initGalleryFilters() {
    var btns  = document.querySelectorAll('.gallery-filter-btn');
    var items = document.querySelectorAll('.gallery-full-grid .gallery-item');
    if (!btns.length || !items.length) return;

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.dataset.filter;

        // Update button states
        btns.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        // Filter items
        if (typeof gsap !== 'undefined') {
          items.forEach(function (item) {
            var match = filter === 'all' || item.dataset.category === filter;
            if (match) {
              item.style.display = '';
              gsap.fromTo(item,
                { opacity: 0, scale: 0.88, y: 16 },
                { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' }
              );
            } else {
              gsap.to(item, {
                opacity: 0, scale: 0.88, duration: 0.22, ease: 'power2.in',
                onComplete: function () { item.style.display = 'none'; }
              });
            }
          });
        } else {
          items.forEach(function (item) {
            var match = filter === 'all' || item.dataset.category === filter;
            item.style.display  = match ? '' : 'none';
            item.style.opacity  = '1';
          });
        }
      });
    });
  }

  /* ============================================================
     5. GALLERY LIGHTBOX
  ============================================================ */
  function initGalleryLightbox() {
    var allItems = document.querySelectorAll('.gallery-item');
    if (!allItems.length) return;

    var lb         = document.getElementById('galleryLightbox');
    var lbClose    = document.getElementById('lightboxClose');
    var lbBackdrop = document.getElementById('lightboxBackdrop');
    var lbDisplay  = document.getElementById('lightboxDisplay');
    var lbCap      = document.getElementById('lightboxCap');
    var lbPrev     = document.getElementById('lightboxPrev');
    var lbNext     = document.getElementById('lightboxNext');
    if (!lb) return;

    var current      = 0;
    var colorClasses = ['gp-blue', 'gp-peach', 'gp-lavender', 'gp-mint', 'gp-pink', 'gp-gold'];

    function getVisible() {
      return Array.from(document.querySelectorAll('.gallery-item')).filter(function (i) {
        return i.style.display !== 'none';
      });
    }

    function getData(item) {
      var ph  = item.querySelector('.gallery-placeholder');
      var cap = item.querySelector('.gallery-caption');
      var colorClass = 'gp-blue';
      if (ph) { colorClasses.forEach(function (c) { if (ph.classList.contains(c)) colorClass = c; }); }
      return {
        colorClass: colorClass,
        emoji:      ph && ph.querySelector('.gp-emoji') ? ph.querySelector('.gp-emoji').textContent : '🎨',
        caption:    cap ? cap.textContent : ''
      };
    }

    function render(index) {
      var visible = getVisible();
      if (!visible.length) return;
      current = ((index % visible.length) + visible.length) % visible.length;
      var d = getData(visible[current]);
      lbDisplay.innerHTML =
        '<div class="gallery-placeholder ' + d.colorClass + '">' +
          '<span class="gp-emoji">' + d.emoji + '</span>' +
        '</div>';
      lbCap.textContent = d.caption;
    }

    function openLightbox(item) {
      var visible = getVisible();
      var idx = visible.indexOf(item);
      render(idx === -1 ? 0 : idx);
      lb.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }

    function closeLightbox() {
      lb.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }

    allItems.forEach(function (item) {
      item.addEventListener('click', function () { openLightbox(item); });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbBackdrop.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { render(current - 1); });
    lbNext.addEventListener('click', function () { render(current + 1); });

    document.addEventListener('keydown', function (e) {
      if (lb.hasAttribute('hidden')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  render(current - 1);
      if (e.key === 'ArrowRight') render(current + 1);
    });
  }

})();
