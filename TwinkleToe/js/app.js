/* ============================================================
   TWINKLE TOE — 3D Experience v2
   Nursery Three.js Scene · Card Tilt · GSAP · Counters
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initMobileNav();
    initSmoothScroll();
    initThreeScene();
    initCardTilt();
    initSectionOrbParallax();
    initScrollAnimations();
    initCounters();
    initGalleryLightbox();
    loadSavedReviews();
    initReviewForm();
  });

  /* ============================================================
     1. NAVBAR
  ============================================================ */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ============================================================
     2. MOBILE NAV
  ============================================================ */
  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const menu   = document.getElementById('navMobile');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      const sp = toggle.querySelectorAll('span');
      if (open) {
        sp[0].style.transform = 'rotate(45deg) translate(5px,5px)';
        sp[1].style.opacity   = '0';
        sp[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
      } else {
        sp[0].style.transform = sp[1].style.opacity = sp[2].style.transform = '';
      }
    });

    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        const sp = toggle.querySelectorAll('span');
        sp[0].style.transform = sp[1].style.opacity = sp[2].style.transform = '';
      });
    });
  }

  /* ============================================================
     3. SMOOTH SCROLL
  ============================================================ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        const id = this.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
      });
    });
  }

  /* ============================================================
     4. THREE.JS NURSERY 3D SCENE
  ============================================================ */
  function initThreeScene() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    /* WebGL support check */
    try {
      const testCtx = document.createElement('canvas');
      if (!testCtx.getContext('webgl') && !testCtx.getContext('experimental-webgl')) return;
    } catch (e) { return; }

    const W = window.innerWidth, H = window.innerHeight;
    const mobile = W < 768;

    /* ── Scene, Camera, Renderer ── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 300);
    camera.position.set(0, 1, 22);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile, powerPreference: 'low-power' });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));

    /* ── Lighting ── */
    scene.add(new THREE.HemisphereLight(0xE8F4FD, 0xFFE5D0, 0.75));
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    const pL1 = new THREE.PointLight(0xA8D8EA, 5, 90);
    const pL2 = new THREE.PointLight(0xFFD6E0, 4, 80);
    const pL3 = new THREE.PointLight(0xC8F0E0, 3, 70);
    pL3.position.set(0, 16, -5);
    scene.add(pL1, pL2, pL3);

    /* ── Depth fog — warm cream, makes far objects melt into the hero bg ── */
    scene.fog = new THREE.Fog(0xFFF8F2, 20, 58);

    /* ── Warm nursery lamp — amber fill, like a cosy bedside light ── */
    const warmL = new THREE.PointLight(0xFFCC88, 3.8, 78);
    warmL.position.set(-10, 5, 7);
    scene.add(warmL);

    /* ── Helpers ── */
    const R  = (a, b) => a + Math.random() * (b - a);
    const RI = (arr) => arr[Math.floor(Math.random() * arr.length)];

    /* ============================================================
       NURSERY OBJECT BUILDERS
    ============================================================ */

    /* 3D Extruded Star (5 points) */
    function makeStar(color) {
      const shape = new THREE.Shape();
      const pts = 5, out = 0.52, inn = 0.22;
      for (let i = 0; i < pts * 2; i++) {
        const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? out : inn;
        i === 0 ? shape.moveTo(Math.cos(a) * r, Math.sin(a) * r)
                : shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.24, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 });
      return new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color, shininess: 95, specular: 0xffffff }));
    }

    /* 3D Extruded Heart */
    function makeHeart(color) {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0.28);
      shape.bezierCurveTo( 0,    0.55,  0.48, 0.55,  0.48, 0.28);
      shape.bezierCurveTo( 0.48, 0.01,  0,   -0.28,  0,   -0.5);
      shape.bezierCurveTo( 0,   -0.28, -0.48, 0.01, -0.48, 0.28);
      shape.bezierCurveTo(-0.48, 0.55,  0,    0.55,  0,    0.28);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 });
      return new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color, shininess: 75, specular: 0xffffff }));
    }

    /* Alphabet Block (6 different coloured faces) */
    function makeBlock(cols) {
      return new THREE.Mesh(
        new THREE.BoxGeometry(0.92, 0.92, 0.92),
        cols.map(c => new THREE.MeshPhongMaterial({ color: c, shininess: 55 }))
      );
    }

    /* Cloud (sphere cluster) */
    function makeCloud() {
      const g   = new THREE.Group();
      const mat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.9, shininess: 20 });
      [[0,0,0,0.58],[-.65,-.12,0,.40],[.65,-.12,0,.40],[0,.38,0,.46],[-.36,.22,0,.32],[.36,.22,0,.32]].forEach(([x,y,z,r]) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 12), mat);
        m.position.set(x, y, z);
        g.add(m);
      });
      return g;
    }

    /* Rainbow arc (6 coloured torus segments) */
    function makeRainbow() {
      const g = new THREE.Group();
      [0xFF8FA0, 0xFFB878, 0xFFE870, 0x88E898, 0x88C8F0, 0xC0A0F0].forEach((c, i) => {
        const geo = new THREE.TorusGeometry(0.52 + i * 0.19, 0.058, 8, 52, Math.PI);
        g.add(new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: c, transparent: true, opacity: 0.88 })));
      });
      return g;
    }

    /* Crescent Moon (torus arc) */
    function makeMoon(color) {
      const geo = new THREE.TorusGeometry(0.44, 0.21, 14, 52, Math.PI * 1.35);
      return new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color, shininess: 65, specular: 0xffffff }));
    }

    /* Balloon (elongated reflective sphere) */
    function makeBalloon(color) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.46, 18, 18),
        new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.82, shininess: 110, specular: 0xffffff })
      );
      m.scale.y = 1.35;
      return m;
    }

    /* Diamond (OctahedronGeometry) */
    function makeDiamond(color) {
      const m = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.4, 0),
        new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.78, shininess: 130, specular: 0xffffff })
      );
      m.scale.y = 1.4;
      return m;
    }

    /* Sparkle particle field */
    function makeSparkles(n) {
      const pos = new Float32Array(n * 3);
      const sp  = 30;
      for (let i = 0; i < n; i++) {
        pos[i * 3]     = R(-sp, sp);
        pos[i * 3 + 1] = R(-sp * .55, sp * .55);
        pos[i * 3 + 2] = R(-20, 1);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.1, transparent: true, opacity: 0.55, sizeAttenuation: true }));
    }

    /* Teddy Bear — sphere cluster, immediately reads as "nursery" */
    function makeTeddy(color) {
      const g   = new THREE.Group();
      const mat = new THREE.MeshPhongMaterial({ color, shininess: 22 });
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), mat);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), mat);
      head.position.set(0, 0.60, 0.05);
      const earL = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), mat);
      earL.position.set(-0.20, 0.82, 0.05);
      const earR = earL.clone(); earR.position.x = 0.20;
      const armL = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), mat);
      armL.position.set(-0.44, 0.06, 0.08); armL.scale.set(0.7, 1, 0.7);
      const armR = armL.clone(); armR.position.x = 0.44;
      const tummy = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 10, 10),
        new THREE.MeshPhongMaterial({ color: new THREE.Color(color).lerp(new THREE.Color(0xFFFFFF), 0.38), shininess: 15 })
      );
      tummy.position.set(0, -0.06, 0.30); tummy.scale.set(1, 0.88, 0.55);
      g.add(body, head, earL, earR, armL, armR, tummy);
      return g;
    }

    /* Baby Bottle — cylinder body + sphere bottom cap + conical neck + nipple */
    function makeBottle(color) {
      const g   = new THREE.Group();
      const mat = new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.75, shininess: 120, specular: 0xffffff });
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.80, 14), mat));
      const bot = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 14), mat);
      bot.position.y = -0.40; bot.scale.y = 0.52;
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.19, 0.24, 12), mat);
      neck.position.y = 0.52;
      const nip  = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 10), new THREE.MeshPhongMaterial({ color: 0xFFDEA0, shininess: 55 }));
      nip.position.y = 0.71;
      g.add(bot, neck, nip);
      return g;
    }

    /* Baby Rattle — large sphere head, thin handle, grip ball */
    function makeRattle(color) {
      const g   = new THREE.Group();
      const mat = new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.88, shininess: 85 });
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.30, 14, 14), mat);
      head.position.y = 0.48;
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.58, 12), mat);
      const grip   = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), mat);
      grip.position.y = -0.42;
      g.add(head, handle, grip);
      return g;
    }

    /* Multi-colour sparkle cloud (separate from the white one) */
    function makeColorSparkles(n, color) {
      const pos = new Float32Array(n * 3), sp = 30;
      for (let i = 0; i < n; i++) {
        pos[i * 3]     = R(-sp, sp);
        pos[i * 3 + 1] = R(-sp * .55, sp * .55);
        pos[i * 3 + 2] = R(-20, 1);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      return new THREE.Points(geo, new THREE.PointsMaterial({ color, size: 0.09, transparent: true, opacity: 0.46, sizeAttenuation: true }));
    }

    /* ── Place object with float physics data ── */
    const allObjects = [];
    function place(obj) {
      const sp = mobile ? 13 : 22;
      obj.position.set(R(-sp, sp), R(-sp * .55, sp * .55), R(-17, -0.5));
      obj.rotation.set(R(0, Math.PI * 2), R(0, Math.PI * 2), R(0, Math.PI * 2));
      obj.userData = {
        ox: obj.position.x, oy: obj.position.y,
        fy: R(.3, 1.0), fx: R(.14, .52),
        fqY: R(.22, .72), fqX: R(.15, .45),
        phY: R(0, Math.PI * 2), phX: R(0, Math.PI * 2),
        rX: R(-.013, .013), rY: R(-.013, .013), rZ: R(-.007, .007),
      };
      scene.add(obj);
      allObjects.push(obj);
    }

    /* ── Populate the nursery scene ── */
    const M = mobile;

    // Extruded Stars — gold
    for (let i = 0; i < (M ? 4 : 9); i++)  place(makeStar(RI([0xF0D060, 0xFFE080, 0xF8C050, 0xFAD000])));

    // Extruded Hearts — pink
    for (let i = 0; i < (M ? 3 : 7); i++)  place(makeHeart(RI([0xFFB0C8, 0xF7A8B8, 0xFFCCDD, 0xF090A8])));

    // Alphabet Blocks — multi-colour
    const bPals = [
      [0xF7A8B8, 0xA8D8EA, 0xC8F0E0, 0xE8D5F5, 0xFFE5D0, 0xF0E0A0],
      [0xA8D8EA, 0xFFD6E0, 0xC8F0E0, 0x98E8C8, 0xE8D5F5, 0xF0E0A0],
      [0xE8D5F5, 0xA8D8EA, 0xF7A8B8, 0xC8F0E0, 0xF0E0A0, 0xFFE5D0],
      [0xC8F0E0, 0xE8D5F5, 0xA8D8EA, 0xF7A8B8, 0xFFE5D0, 0xF0E0A0],
    ];
    for (let i = 0; i < (M ? 3 : 8); i++)  place(makeBlock(bPals[i % bPals.length]));

    // Clouds — white puffy
    for (let i = 0; i < (M ? 2 : 4); i++)  place(makeCloud());

    // Rainbows — arcs
    for (let i = 0; i < (M ? 1 : 3); i++)  place(makeRainbow());

    // Crescent Moons — yellow
    for (let i = 0; i < (M ? 2 : 4); i++)  place(makeMoon(RI([0xF0E0A0, 0xFFE878, 0xFFF0B0])));

    // Balloons — pastel
    for (let i = 0; i < (M ? 8 : 18); i++) place(makeBalloon(RI([0xA8D8EA, 0xFFD6E0, 0xC8F0E0, 0xE8D5F5, 0xFFE5D0, 0xF0E0A0])));

    // Diamonds — sparkly
    for (let i = 0; i < (M ? 3 : 7); i++)  place(makeDiamond(RI([0xA8D8EA, 0xE8D5F5, 0xFFD6E0])));

    // Teddy Bears — warm honey/caramel, the scene's heart
    for (let i = 0; i < (M ? 2 : 5); i++)  place(makeTeddy(RI([0xD4956A, 0xC8856A, 0xE8B898, 0xF0C8A8, 0xD4A882])));

    // Baby Bottles — pastel transparent
    for (let i = 0; i < (M ? 2 : 4); i++)  place(makeBottle(RI([0xA8D8EA, 0xFFD6E0, 0xC8F0E0, 0xE8D5F5])));

    // Rattles — bright & cheerful
    for (let i = 0; i < (M ? 2 : 4); i++)  place(makeRattle(RI([0xFFB0C8, 0xA8D8EA, 0xF0E0A0, 0xC8A8F0])));

    // Multi-colour sparkles: white · gold · sky blue · blush pink
    const allSparkles = [
      makeColorSparkles(M ? 80 : 180, 0xFFFFFF),
      makeColorSparkles(M ? 28 : 62,  0xFFE488),
      makeColorSparkles(M ? 20 : 46,  0xBEE8FF),
      makeColorSparkles(M ? 16 : 38,  0xFFD0E4),
    ];
    allSparkles.forEach(function (s) { scene.add(s); });

    /* ── Mouse / touch / gyro ── */
    let txC = 0, tyC = 0, cxC = 0, cyC = 0;
    const cr  = M ? 1.0 : 2.2;

    window.addEventListener('mousemove', e => {
      txC = (e.clientX / W - .5) * cr;
      tyC = (e.clientY / H - .5) * -cr * .65;
    }, { passive: true });

    window.addEventListener('touchmove', e => {
      txC = (e.touches[0].clientX / W - .5) * cr * .6;
      tyC = (e.touches[0].clientY / H - .5) * -cr * .4;
    }, { passive: true });

    if (M && typeof DeviceOrientationEvent !== 'undefined') {
      window.addEventListener('deviceorientation', e => {
        if (e.gamma !== null) txC = (e.gamma / 30) * 1.1;
        if (e.beta  !== null) tyC = ((e.beta - 45) / 45) * .75;
      }, { passive: true });
    }

    window.addEventListener('resize', () => {
      const nw = window.innerWidth, nh = window.innerHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    }, { passive: true });

    let running = true;
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) requestAnimationFrame(loop);
    });

    canvas.classList.add('loaded');

    /* ── Animation loop ── */
    function loop(ts) {
      if (!running) return;
      requestAnimationFrame(loop);
      const t = ts * 0.001;

      // Float all nursery objects
      allObjects.forEach(o => {
        const d = o.userData;
        o.position.y = d.oy + Math.sin(t * d.fqY + d.phY) * d.fy;
        o.position.x = d.ox + Math.cos(t * d.fqX + d.phX) * d.fx;
        o.rotation.x += d.rX;
        o.rotation.y += d.rY;
        o.rotation.z += d.rZ;
      });

      // Sparkle twinkle + slow rotation
      allSparkles.forEach(function (s, i) {
        s.material.opacity = 0.26 + Math.sin(t * (2.5 + i * 0.55) + i * 1.3) * 0.18;
        s.rotation.y = t * (0.007 + i * 0.003);
      });

      // Orbiting coloured lights — dynamic shadows
      pL1.position.set(Math.cos(t * 0.22) * 16, Math.sin(t * 0.14) * 7, Math.sin(t * 0.22) * 12);
      pL2.position.set(Math.cos(t * 0.17 + Math.PI) * 13, Math.sin(t * 0.21) * 6, Math.sin(t * 0.17) * 10);

      // Camera: smooth mouse parallax + slow orbit drift
      cxC += (txC - cxC) * 0.038;
      cyC += (tyC - cyC) * 0.038;
      camera.position.x = cxC + Math.sin(t * 0.08) * 1.4;
      camera.position.y = cyC + Math.sin(t * 0.055) * 0.8 + 1;
      camera.position.z = 22 + Math.sin(t * 0.11) * 0.55;  // gentle breathing zoom
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    requestAnimationFrame(loop);
  }

  /* ============================================================
     5. CARD 3D TILT — physics-based mouse tracking
  ============================================================ */
  function applyTilt(card) {
    var rafId, hovering = false;
    var tx = 0, ty = 0, cx = 0, cy = 0;

    card.style.willChange = 'transform';

    card.addEventListener('mouseenter', function () {
      hovering = true;
      cancelAnimationFrame(rafId);
      tick();
    });

    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      tx =  ((e.clientX - r.left  - r.width  / 2) / (r.width  / 2)) * 9;
      ty = -((e.clientY - r.top   - r.height / 2) / (r.height / 2)) * 9;
    });

    card.addEventListener('mouseleave', function () {
      hovering = false;
      tx = 0; ty = 0;
    });

    function tick() {
      cx += (tx - cx) * 0.11;
      cy += (ty - cy) * 0.11;
      var tz = hovering ? 16 : 0;
      card.style.transform = 'perspective(950px) rotateX(' + cy.toFixed(3) + 'deg) rotateY(' + cx.toFixed(3) + 'deg) translateZ(' + tz + 'px)';
      if (hovering || Math.abs(cx) > 0.04 || Math.abs(cy) > 0.04) {
        rafId = requestAnimationFrame(tick);
      } else {
        card.style.transform = '';
        card.style.boxShadow = '';
      }
    }
  }

  function initCardTilt() {
    // Skip on touch-only devices
    if (window.matchMedia('(hover: none)').matches) return;

    var selector = '.glass-card, .dev-card, .facility-card, .pricing-card, .tl-card';
    document.querySelectorAll(selector).forEach(function (card) {
      applyTilt(card);
    });
  }

  /* ============================================================
     6. SECTION ORB PARALLAX (mouse moves depth orbs)
  ============================================================ */
  function initSectionOrbParallax() {
    document.querySelectorAll('.section').forEach(function (section) {
      const orbs = section.querySelectorAll('.s-orb');
      if (!orbs.length) return;

      section.addEventListener('mousemove', function (e) {
        const r  = section.getBoundingClientRect();
        const mx = (e.clientX - r.left  - r.width  / 2) / r.width;
        const my = (e.clientY - r.top   - r.height / 2) / r.height;
        orbs.forEach(function (orb, i) {
          const d = (i + 1) * 28;
          orb.style.transform = `translate(${mx * d}px, ${my * d * 0.7}px) scale(${1 + i * 0.02})`;
        });
      }, { passive: true });

      section.addEventListener('mouseleave', function () {
        orbs.forEach(function (orb) { orb.style.transform = ''; });
      });
    });
  }

  /* ============================================================
     7. GSAP SCROLL ANIMATIONS
  ============================================================ */
  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      document.querySelectorAll('.glass-card, .dev-card, .facility-card, .testimonial-card, .pricing-card, .tl-card, .gallery-item').forEach(function (el) {
        el.style.opacity = '1';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ST = { start: 'top 88%', toggleActions: 'play none none none' };

    // Eyebrows
    gsap.utils.toArray('.section-eyebrow').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: el, ...ST } });
    });

    // Titles
    gsap.utils.toArray('.section-title').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, ...ST } });
    });

    // Descs
    gsap.utils.toArray('.section-desc').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    // Safety grid
    if (document.querySelector('.safety-grid')) {
      gsap.fromTo('.safety-card', { opacity: 0, y: 55, rotateX: 15 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.75, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.safety-grid', start: 'top 85%' } });
    }

    // Timeline alternating
    gsap.utils.toArray('.timeline-item').forEach(function (item) {
      const isLeft = item.classList.contains('tl-left');
      const mob    = window.innerWidth < 768;
      gsap.fromTo(item,
        { opacity: 0, x: mob ? 0 : (isLeft ? -75 : 75), y: mob ? 40 : 0, rotateY: mob ? 0 : (isLeft ? 8 : -8) },
        { opacity: 1, x: 0, y: 0, rotateY: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 88%' } }
      );
    });

    // Dev cards
    if (document.querySelector('.dev-grid')) {
      gsap.fromTo('.dev-card', { opacity: 0, y: 55, scale: 0.94, rotateX: 12 }, { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 0.8, stagger: 0.13, ease: 'power3.out', scrollTrigger: { trigger: '.dev-grid', start: 'top 85%' } });
    }

    // Facility cards
    if (document.querySelector('.facilities-grid')) {
      gsap.fromTo('.facility-card', { opacity: 0, y: 55, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.75, stagger: 0.12, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.facilities-grid', start: 'top 85%' } });
    }

    // Gallery featured items
    if (document.querySelector('.gallery-featured-grid')) {
      gsap.fromTo('.gallery-featured-grid .gallery-item', { opacity: 0, y: 45, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.75, stagger: 0.1, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.gallery-featured-grid', start: 'top 85%' } });
    }

    // Testimonials
    if (document.querySelector('.testimonials-grid')) {
      gsap.fromTo('.testimonial-card', { opacity: 0, y: 52, scale: 0.96, rotateX: 10 }, { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 0.78, stagger: 0.13, ease: 'power3.out', scrollTrigger: { trigger: '.testimonials-grid', start: 'top 85%' } });
    }

    // Pricing
    if (document.querySelector('.pricing-grid')) {
      gsap.fromTo('.pricing-card', { opacity: 0, y: 55, scale: 0.93, rotateY: 8 }, { opacity: 1, y: 0, scale: 1, rotateY: 0, duration: 0.85, stagger: 0.15, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.pricing-grid', start: 'top 85%' } });
    }

    // Stats
    if (document.getElementById('statsBar')) {
      gsap.fromTo('.stat-item', { opacity: 0, y: 22, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '#statsBar', start: 'top 92%' } });
    }

    // Address banner
    if (document.querySelector('.address-banner')) {
      gsap.fromTo('.address-banner', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: '.address-banner', start: 'top 90%' } });
    }

    // Pricing note
    if (document.querySelector('.pricing-note')) {
      gsap.fromTo('.pricing-note', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', scrollTrigger: { trigger: '.pricing-note', start: 'top 90%' } });
    }

    // CTA
    if (document.querySelector('.cta-inner')) {
      gsap.fromTo('.cta-inner', { opacity: 0, y: 55, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.cta-inner', start: 'top 80%' } });
    }

    // Footer columns
    if (document.querySelector('.footer-grid')) {
      gsap.fromTo('.footer-grid > *', { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: '.footer-grid', start: 'top 90%' } });
    }

    // WA float entrance
    const waFloat = document.getElementById('waFloat');
    if (waFloat) {
      gsap.fromTo(waFloat, { opacity: 0, x: 90, scale: 0.7 }, { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: 'back.out(1.8)', delay: 2.5 });
    }

    // Hero text parallax (scrub)
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      gsap.to(heroContent, { yPercent: 22, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    }

    // Section orbs parallax on scroll
    gsap.utils.toArray('.s-orb').forEach(function (orb) {
      const speed = parseFloat(orb.dataset.speed || '0.12');
      gsap.to(orb, {
        yPercent: -60 * speed,
        ease: 'none',
        scrollTrigger: { trigger: orb.closest('.section') || orb.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ============================================================
     8. ANIMATED COUNTERS
  ============================================================ */
  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el  = e.target;
        const tgt = parseInt(el.getAttribute('data-target'), 10);
        if (isNaN(tgt)) return;
        const dur = 1900, t0 = performance.now();
        (function tick(now) {
          const p = Math.min((now - t0) / dur, 1);
          el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * tgt);
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (c) { io.observe(c); });
  }

  /* ============================================================
     9. REVIEW STORAGE — JSONbin.io (shared) + localStorage fallback
     ──────────────────────────────────────────────────────────────
     SETUP (2 minutes, free):
       1. Go to https://jsonbin.io and sign up
       2. Click "+ Create Bin", paste in:  {"reviews":[]}  and save
       3. Copy the Bin ID from the URL bar  (looks like: 6634abc12...)
       4. Go to API Keys tab → copy your Master Key  ($2a$10$...)
       5. Paste both values into the two lines below
     ──────────────────────────────────────────────────────────────
     Until configured, reviews fall back to localStorage (per-browser).
  ============================================================ */

  var JSONBIN_BIN_ID  = '69cd16a3aaba882197b4e725';   // ← paste your Bin ID here
  var JSONBIN_API_KEY = '$2a$10$1XuZLXMp6rT7fqd6OxFwKus.GZilS8F/t9veh2p6Db2dUflVqw1se';   // ← paste your Master Key here
  var JSONBIN_BASE    = 'https://api.jsonbin.io/v3/b/';
  var LS_KEY          = 'tt_reviews_v1';   // localStorage fallback key

  var AVATAR_GRADS = [
    'linear-gradient(135deg,#A8D8EA,#7BC8E2)',
    'linear-gradient(135deg,#FFD6E0,#F7A8B8)',
    'linear-gradient(135deg,#C8F0E0,#98E8C8)',
    'linear-gradient(135deg,#E8D5F5,#C8A8F0)',
    'linear-gradient(135deg,#FFE8C0,#F0C870)',
    'linear-gradient(135deg,#D0F5FF,#7BC8E2)',
  ];
  var RATING_HINTS = { '1': 'Not great', '2': 'Could be better', '3': "It's okay", '4': 'Really good', '5': 'Absolutely love it! ✨' };

  /* Returns true when JSONbin credentials have been filled in */
  function jsonbinReady() {
    return JSONBIN_BIN_ID.length > 0 && JSONBIN_API_KEY.length > 0;
  }

  /* Fetch the current reviews array from JSONbin */
  function fetchReviews() {
    return fetch(JSONBIN_BASE + JSONBIN_BIN_ID + '/latest', {
      headers: { 'X-Master-Key': JSONBIN_API_KEY }
    })
    .then(function (r) {
      if (!r.ok) throw new Error('fetch failed: ' + r.status);
      return r.json();
    })
    .then(function (data) {
      return Array.isArray(data.record && data.record.reviews) ? data.record.reviews : [];
    });
  }

  /* Overwrite the bin with a new reviews array */
  function putReviews(reviews) {
    return fetch(JSONBIN_BASE + JSONBIN_BIN_ID, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_API_KEY },
      body:    JSON.stringify({ reviews: reviews })
    })
    .then(function (r) {
      if (!r.ok) throw new Error('save failed: ' + r.status);
    });
  }

  /* Build a review card DOM node identical to the static cards */
  function buildReviewCard(review) {
    var card = document.createElement('div');
    card.className = 'testimonial-card glass-card';

    var badge = document.createElement('span');
    badge.className = 'testi-new-badge';
    badge.textContent = '✦ Parent Review';
    card.appendChild(badge);

    var stars = document.createElement('div');
    stars.className = 'testi-stars';
    stars.textContent = '⭐'.repeat(Math.max(1, Math.min(5, review.rating || 5)));
    card.appendChild(stars);

    var bq = document.createElement('blockquote');
    bq.textContent = '\u201C' + review.comment + '\u201D';
    card.appendChild(bq);

    var author = document.createElement('div');
    author.className = 'testi-author';

    var avatar = document.createElement('div');
    avatar.className = 'testi-avatar';
    avatar.style.background = AVATAR_GRADS[(review.gradIndex || 0) % AVATAR_GRADS.length];
    avatar.textContent = (review.name.trim()[0] || '?').toUpperCase();
    author.appendChild(avatar);

    var info = document.createElement('div');
    info.className = 'testi-info';

    var nameEl = document.createElement('div');
    nameEl.className = 'testi-name';
    nameEl.textContent = review.name;
    info.appendChild(nameEl);

    var detail = document.createElement('div');
    detail.className = 'testi-detail';
    detail.textContent = review.child || 'Twinkle Toe Parent';
    info.appendChild(detail);

    author.appendChild(info);
    card.appendChild(author);

    if (!window.matchMedia('(hover: none)').matches) { applyTilt(card); }

    return card;
  }

  /* Render an array of review objects into the testimonials grid */
  function renderReviews(reviews, grid) {
    reviews.forEach(function (review) {
      grid.appendChild(buildReviewCard(review));
    });
  }

  /* ── Load reviews on page start ── */
  function loadSavedReviews() {
    var grid = document.querySelector('.testimonials-grid');
    if (!grid) return;

    if (!jsonbinReady()) {
      /* No JSONbin configured — use localStorage (per-browser only) */
      var local = [];
      try { local = JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) {}
      renderReviews(local, grid);
      return;
    }

    /* Show a subtle loading row while fetching */
    var loader = document.createElement('p');
    loader.className = 'reviews-loading';
    loader.textContent = 'Loading reviews…';
    grid.insertAdjacentElement('afterend', loader);

    fetchReviews()
      .then(function (reviews) {
        loader.remove();
        renderReviews(reviews, grid);
      })
      .catch(function () {
        loader.remove();
        /* Network error — silently fall back to localStorage */
        var local = [];
        try { local = JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) {}
        renderReviews(local, grid);
      });
  }

  /* ── Review form interactions ── */
  function initReviewForm() {
    var formWrap   = document.getElementById('reviewFormWrap');
    var successEl  = document.getElementById('reviewSuccess');
    var submitBtn  = document.getElementById('reviewSubmit');
    var anotherBtn = document.getElementById('reviewAnother');
    var nameInput  = document.getElementById('reviewName');
    var childInput = document.getElementById('reviewChild');
    var textInput  = document.getElementById('reviewText');
    var charCount  = document.getElementById('reviewCharCount');
    var errorEl    = document.getElementById('reviewError');
    var hintEl     = document.getElementById('starRatingHint');
    var grid       = document.querySelector('.testimonials-grid');
    if (!formWrap || !submitBtn || !grid) return;

    /* Character counter */
    if (textInput && charCount) {
      textInput.addEventListener('input', function () {
        var len = textInput.value.length;
        charCount.textContent = len + ' / 500';
        charCount.classList.toggle('near-limit', len >= 450);
      });
    }

    /* Star hint */
    document.querySelectorAll('input[name="review_rating"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (hintEl)  hintEl.textContent  = RATING_HINTS[radio.value] || '';
        if (errorEl) errorEl.hidden = true;
      });
    });

    /* Submit */
    submitBtn.addEventListener('click', function () {
      var ratingEl = document.querySelector('input[name="review_rating"]:checked');
      var rating   = ratingEl ? parseInt(ratingEl.value, 10) : 0;
      var name     = nameInput  ? nameInput.value.trim()  : '';
      var child    = childInput ? childInput.value.trim() : '';
      var comment  = textInput  ? textInput.value.trim()  : '';

      if (!rating)  { showError('Please select a star rating before submitting.'); return; }
      if (!name)    { showError('Please enter your name.');   nameInput  && nameInput.focus();  return; }
      if (!comment) { showError('Please write a short review.'); textInput && textInput.focus(); return; }

      /* Disable button while saving */
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Saving…';

      if (jsonbinReady()) {
        /* JSONbin path — fetch current list, append, save back */
        fetchReviews()
          .then(function (existing) {
            var review = { name: name, child: child, comment: comment, rating: rating, gradIndex: existing.length };
            var updated = existing.concat([review]);
            return putReviews(updated).then(function () { return review; });
          })
          .then(function (review) {
            onSaveSuccess(review, grid, formWrap, successEl, submitBtn);
          })
          .catch(function () {
            submitBtn.disabled = false;
            submitBtn.textContent = '⭐ Submit My Review';
            showError('Could not save — please check your connection and try again.');
          });
      } else {
        /* localStorage fallback */
        var local = [];
        try { local = JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) {}
        var review = { name: name, child: child, comment: comment, rating: rating, gradIndex: local.length };
        local.push(review);
        try { localStorage.setItem(LS_KEY, JSON.stringify(local)); } catch (e) {}
        onSaveSuccess(review, grid, formWrap, successEl, submitBtn);
      }
    });

    /* Write another */
    if (anotherBtn) {
      anotherBtn.addEventListener('click', function () {
        successEl.hidden = true;
        formWrap.hidden  = false;
        if (nameInput)  nameInput.value  = '';
        if (childInput) childInput.value = '';
        if (textInput)  textInput.value  = '';
        if (charCount)  charCount.textContent = '0 / 500';
        if (hintEl)     hintEl.textContent    = 'Tap to rate';
        document.querySelectorAll('input[name="review_rating"]').forEach(function (r) { r.checked = false; });
        formWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    function onSaveSuccess(review, grid, formWrap, successEl, submitBtn) {
      var card = buildReviewCard(review);
      grid.appendChild(card);
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(card, { opacity: 0, y: 50, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'back.out(1.4)' });
      }
      submitBtn.disabled    = false;
      submitBtn.textContent = '⭐ Submit My Review';
      formWrap.hidden  = true;
      successEl.hidden = false;
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function showError(msg) {
      if (!errorEl) return;
      errorEl.textContent = msg;
      errorEl.hidden = false;
      errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /* ============================================================
     10. GALLERY LIGHTBOX (homepage featured section)
  ============================================================ */
  function initGalleryLightbox() {
    var items = document.querySelectorAll('.gallery-item');
    if (!items.length) return;

    var lb         = document.getElementById('galleryLightbox');
    var lbClose    = document.getElementById('lightboxClose');
    var lbBackdrop = document.getElementById('lightboxBackdrop');
    var lbDisplay  = document.getElementById('lightboxDisplay');
    var lbCap      = document.getElementById('lightboxCap');
    var lbPrev     = document.getElementById('lightboxPrev');
    var lbNext     = document.getElementById('lightboxNext');
    var current    = 0;

    var colorClasses = ['gp-blue', 'gp-peach', 'gp-lavender', 'gp-mint', 'gp-pink', 'gp-gold'];

    var data = Array.from(items).map(function (item) {
      var ph  = item.querySelector('.gallery-placeholder');
      var cap = item.querySelector('.gallery-caption');
      var colorClass = 'gp-blue';
      if (ph) {
        colorClasses.forEach(function (c) { if (ph.classList.contains(c)) colorClass = c; });
      }
      return {
        colorClass: colorClass,
        emoji:      ph && ph.querySelector('.gp-emoji') ? ph.querySelector('.gp-emoji').textContent : '🎨',
        caption:    cap ? cap.textContent : ''
      };
    });

    function render() {
      var d = data[current];
      lbDisplay.innerHTML = '<div class="gallery-placeholder ' + d.colorClass + '"><span class="gp-emoji">' + d.emoji + '</span></div>';
      lbCap.textContent = d.caption;
    }

    function openLightbox(index) {
      current = ((index % data.length) + data.length) % data.length;
      render();
      lb.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }

    function closeLightbox() {
      lb.setAttribute('hidden', '');
      document.body.style.overflow = '';
      if (items[current]) items[current].focus();
    }

    items.forEach(function (item, i) {
      item.addEventListener('click', function () { openLightbox(i); });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbBackdrop.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { openLightbox(current - 1); });
    lbNext.addEventListener('click', function () { openLightbox(current + 1); });

    document.addEventListener('keydown', function (e) {
      if (lb.hasAttribute('hidden')) return;
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowLeft')   openLightbox(current - 1);
      if (e.key === 'ArrowRight')  openLightbox(current + 1);
    });
  }

})();
