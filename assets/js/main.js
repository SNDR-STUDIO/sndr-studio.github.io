
(function() {
  "use strict";

  /**
   * Smooth scroll (Lenis) synced with GSAP ScrollTrigger.
   * Lenis drives the real window scroll, so every existing scroll listener
   * (hero spread, marquee, scrollspy) keeps working unchanged.
   */
  const prefersReducedMotionGlobal = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenis = null;

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  if (typeof window.Lenis === 'function' && !prefersReducedMotionGlobal) {
    lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1
    });

    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const lenisLoop = (time) => {
        lenis.raf(time);
        requestAnimationFrame(lenisLoop);
      };
      requestAnimationFrame(lenisLoop);
    }
  }
  window.sndrLenis = lenis;

  const smoothScrollTo = (target) => {
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.4 });
      return;
    }
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /**
   * Header toggle
   */
  const headerToggleBtn = document.querySelector('.header-toggle');

  function headerToggle() {
    const open = document.querySelector('#header').classList.toggle('header-show');
    headerToggleBtn.classList.toggle('bi-list');
    headerToggleBtn.classList.toggle('bi-x');
    headerToggleBtn.setAttribute('aria-expanded', open);
    headerToggleBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  headerToggleBtn.addEventListener('click', headerToggle);

  /**
   * Close the side menu with Escape or a click outside it
   */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.querySelector('.header-show')) {
      headerToggle();
      headerToggleBtn.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (document.querySelector('.header-show') && !e.target.closest('#header')) {
      headerToggle();
    }
  });

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.header-show')) {
        headerToggle();
      }
    });

  });

  /**
   * Smooth scroll for navmenu and footer anchor links
   */
  document.querySelectorAll('#navmenu a[href^="#"], #footer a[href^="#"]').forEach((navmenuLink) => {
    navmenuLink.addEventListener('click', (e) => {
      const targetId = navmenuLink.getAttribute('href');
      if (!targetId) return;

      const targetSection = document.querySelector(targetId);
      if (!targetSection) return;

      e.preventDefault();
      smoothScrollTo(targetSection);
    });
  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    smoothScrollTo(0);
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);


  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init typed.js
   */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped) {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 50,
      backSpeed: 10,
      backDelay: 800
    });
  }

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Stats section Three.js background: starfield
   * Small round particles that slowly drift and now and then twinkle.
   */
  function initStatsParticles() {
    const statsSection = document.querySelector('#stats');
    const mount = document.querySelector('#stats .stats-three-bg');
    const canUseThree = typeof THREE !== 'undefined' && statsSection && mount;
    if (!canUseThree) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let renderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (error) {
      return;
    }

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.8);
    renderer.setPixelRatio(pixelRatio);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 1, 1200);
    camera.position.z = 240;

    const particleCount = window.innerWidth < 768 ? 520 : 950;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const color = new THREE.Color();

    for (let i = 0; i < particleCount; i += 1) {
      const index = i * 3;
      positions[index] = (Math.random() - 0.5) * 620;
      positions[index + 1] = (Math.random() - 0.5) * 260;
      positions[index + 2] = (Math.random() - 0.5) * 520;

      color.setHSL(0.53 + Math.random() * 0.08, 0.7, 0.7 + Math.random() * 0.25);
      colors[index] = color.r;
      colors[index + 1] = color.g;
      colors[index + 2] = color.b;

      // mostly tiny dust, a few slightly bigger "stars"
      sizes[i] = Math.random() < 0.9 ? 0.8 + Math.random() * 0.9 : 1.8 + Math.random() * 1.2;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.3 + Math.random() * 1.1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

    // Round soft points; twinkle = slow base shimmer + rare bright flash
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: pixelRatio },
        uTwinkle: { value: prefersReducedMotion ? 0 : 1 }
      },
      vertexShader: `
        attribute float aSize;
        attribute float aPhase;
        attribute float aSpeed;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uTwinkle;
        void main() {
          vColor = color;
          float t = uTime * aSpeed + aPhase;
          float shimmer = 0.55 + 0.25 * sin(t);
          // sharp peak that only reaches 1 for a short moment each cycle
          float flash = pow(max(sin(t * 0.37 + aPhase * 1.7), 0.0), 24.0);
          vAlpha = mix(0.75, shimmer + flash * 0.6, uTwinkle);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (1.0 + flash * 0.8 * uTwinkle) * uPixelRatio * (240.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          if (a < 0.01) discard;
          gl_FragColor = vec4(vColor, a * vAlpha);
        }
      `,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let rafId = 0;
    let visible = true;
    let pointerX = 0;
    let pointerY = 0;
    const clock = new THREE.Clock();

    const resize = () => {
      const width = Math.max(statsSection.clientWidth, 1);
      const height = Math.max(statsSection.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const render = () => {
      if (!visible) {
        rafId = 0;
        return;
      }

      material.uniforms.uTime.value = clock.getElapsedTime();
      points.rotation.y += prefersReducedMotion ? 0.0002 : 0.0006;
      points.rotation.x += prefersReducedMotion ? 0.00005 : 0.00015;
      camera.position.x += (pointerX * 18 - camera.position.x) * 0.025;
      camera.position.y += (pointerY * 10 - camera.position.y) * 0.025;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(render);
    };

    const start = () => {
      if (!rafId) rafId = window.requestAnimationFrame(render);
    };

    const stop = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const onPointerMove = (event) => {
      const rect = statsSection.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) || 0;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) || 0;
      pointerX = x;
      pointerY = -y;
      statsSection.style.setProperty('--stats-rot-y', `${x * 10}deg`);
      statsSection.style.setProperty('--stats-rot-x', `${y * 8}deg`);
      statsSection.style.setProperty('--stats-bx', `${x * 70}px`);
      statsSection.style.setProperty('--stats-by', `${y * 50}px`);
    };

    const resetPointer = () => {
      pointerX = 0;
      pointerY = 0;
      statsSection.style.setProperty('--stats-rot-y', '0deg');
      statsSection.style.setProperty('--stats-rot-x', '0deg');
      statsSection.style.setProperty('--stats-bx', '0px');
      statsSection.style.setProperty('--stats-by', '0px');
    };

    resize();
    start();
    window.addEventListener('resize', resize);
    statsSection.addEventListener('pointermove', onPointerMove, { passive: true });
    statsSection.addEventListener('pointerleave', resetPointer, { passive: true });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        visible ? start() : stop();
      }, { threshold: 0.05 });
      observer.observe(statsSection);
    }
  }

  initStatsParticles();

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox',
    onOpen: () => lenis && lenis.stop(),
    onClose: () => lenis && lenis.start()
  });

  /**
   * Init isotope layout and filters
   */


  window.addEventListener("load", () => {
  const grid = document.querySelector(".isotope-container");
  if (!grid) return;

  // 1) дождаться картинок
  imagesLoaded(grid, () => {
    // 2) дождаться того, что видео получили размеры (metadata/poster)
    const videos = grid.querySelectorAll("video");
    const waits = Array.from(videos).map(v => {
      if (v.readyState >= 1) return Promise.resolve(); // metadata уже есть
      return new Promise(res => v.addEventListener("loadedmetadata", res, { once:true }));
    });

    Promise.all(waits).then(() => {
      // init isotope после того как размеры стабильны
      const iso = new Isotope(grid, { itemSelector: ".isotope-item", layoutMode: "masonry" });
      iso.layout();
    });
  });
});

  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });

      // Keep the grid as tall as the full "All" layout, so the section (and its
      // background photo) doesn't shrink/stretch when a filter shows fewer items
      const container = initIsotope.element;
      const lockHeight = () => {
        if (initIsotope.options.filter !== '*') return;
        container.style.minHeight = '';
        container.style.minHeight = `${container.offsetHeight}px`;
      };
      initIsotope.on('layoutComplete', lockHeight);
      lockHeight();
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        const current = isotopeItem.querySelector('.isotope-filters .filter-active');
        current.classList.remove('filter-active');
        current.setAttribute('aria-pressed', 'false');
        this.classList.add('filter-active');
        this.setAttribute('aria-pressed', 'true');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
      filters.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });

  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = parseInt(getComputedStyle(section).scrollMarginTop) || 0;
          smoothScrollTo(section.getBoundingClientRect().top + window.scrollY - scrollMarginTop);
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      // page coordinates: offsetTop is relative to a positioned parent
      // (sections 04–06 sit inside .neon-flow), so it can't be used here
      const rect = section.getBoundingClientRect();
      if (rect.top <= 200 && rect.bottom >= 200) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

  /**
   * Hero subtitle \u2014 "Motion with intention. Code with connection."
   * Words come into focus one by one (rise + blur \u2192 sharp) after the title,
   * then the key words (intention / connection) get a looping light sweep.
   * Styles: neon.css \u2192 HERO SUBTITLE.
   */
  function initHeroSubtitleReveal() {
    const subtitle = document.querySelector('.hero-content__p p');
    if (!subtitle || subtitle.dataset.wordsInit === 'true') return;

    const keyWords = ['intention', 'connection'];
    const words = subtitle.textContent.trim().split(/\s+/);
    subtitle.setAttribute('aria-label', words.join(' '));
    subtitle.textContent = '';

    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'hero-word';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--w', index);
      span.textContent = word;
      if (keyWords.includes(word.replace(/[^a-z]/gi, '').toLowerCase())) {
        span.classList.add('hero-word--key');
      }
      subtitle.appendChild(span);
      if (index < words.length - 1) subtitle.appendChild(document.createTextNode(' '));
    });

    subtitle.dataset.wordsInit = 'true';

    // start together with the title reveal (after the preloader is gone)
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      requestAnimationFrame(() => requestAnimationFrame(() => subtitle.classList.add('is-revealed')));
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    setTimeout(start, 3500);
  }

  initHeroSubtitleReveal();

  /**
   * HERO TITLE — "SNDR STUDIO"
   * 1) On page load the letters rise from below and fade in one by one.
   * 2) On scroll the letters scatter: each one drifts and tilts its own way.
   * The video is drawn inside the glyphs by initHeroVideoText(), which reads
   * the live position and opacity of each .hero-title-glyph every frame.
   */
  function initHeroTitle() {
    const hero = document.querySelector('#hero');
    const title = document.querySelector('#hero .hero-video-text__title');
    if (!hero || !title || title.dataset.splitInit === 'true') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const chars = Array.from((title.dataset.videoText || title.textContent || '').trim());
    const centre = (chars.length - 1) / 2;
    // stable pseudo-random 0..1 per letter (same scatter on every visit)
    const rand = (n) => {
      const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
      return v - Math.floor(v);
    };

    title.textContent = '';
    chars.forEach((char, index) => {
      const letter = document.createElement('span');
      const glyph = document.createElement('span');
      letter.className = 'hero-title-letter';
      letter.setAttribute('aria-hidden', 'true');
      letter.style.setProperty('--i', index);
      // drift (em) + tilt (deg) at full scroll progress
      const c = index - centre;
      const sx = c * 0.16 + (rand(index + 1) - 0.5) * 0.35;
      const sy = (rand(index + 11) - 0.5) * 0.9;
      const sr = (index % 2 === 0 ? -1 : 1) * (12 + rand(index + 21) * 26);
      letter.style.setProperty('--sx', sx.toFixed(3));
      letter.style.setProperty('--sy', sy.toFixed(3));
      letter.style.setProperty('--sr', sr.toFixed(2));
      glyph.className = 'hero-title-glyph';
      glyph.style.setProperty('--i', index);

      if (char === ' ') {
        letter.classList.add('hero-title-space');
        glyph.textContent = '\u00A0';
      } else {
        glyph.textContent = char;
      }

      letter.appendChild(glyph);
      title.appendChild(letter);
    });

    title.dataset.splitInit = 'true';
    title.classList.add('is-split');

    // 1) Reveal: start once the preloader is gone (window load), with a safety timeout.
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      // two frames so the initial (hidden) state is painted before the transition starts
      requestAnimationFrame(() => requestAnimationFrame(() => title.classList.add('is-revealed')));
    };
    if (document.readyState === 'complete') reveal();
    else window.addEventListener('load', reveal, { once: true });
    setTimeout(reveal, 3500);

    // 2) Scatter on scroll: progress 0..1 over the first half of the hero height
    if (reduceMotion) return;
    let ticking = false;
    const update = () => {
      const progress = Math.min(Math.max(window.scrollY / (hero.offsetHeight * 0.5), 0), 1);
      title.style.setProperty('--hero-p', progress.toFixed(4));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  initHeroTitle();

  /**
   * Hero video rendered inside the title glyphs via canvas mask.
   */
  function initHeroVideoText() {
    const section = document.querySelector('.hero-video-text');
    const video = document.querySelector('#motionVideo');
    const title = document.querySelector('.hero-video-text__title');
    const videoLayer = section?.querySelector('.hero-video-text__video');

    if (!section || !video || !title || !videoLayer) return;
    if (section.dataset.videoTextInit === 'true') return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: true });
    const maskCanvas = document.createElement('canvas');
    const maskCtx = maskCanvas.getContext('2d', { alpha: true });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!ctx || !maskCtx) return;

    canvas.className = 'hero-video-canvas';
    videoLayer.appendChild(canvas);
    section.dataset.videoTextInit = 'true';

    let dpr = 1;
    let frameId = 0;
    const VIDEO_ZOOM = 0.8; // video inside the letters: 20% smaller than "cover"

    const getRect = () => videoLayer.getBoundingClientRect();
    const titleText = (title.dataset.videoText || title.textContent || 'SNDR studio').trim();

    const drawMask = () => {
      const rect = getRect();
      const titleRect = title.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      maskCtx.save();
      maskCtx.scale(dpr, dpr);

      const computed = getComputedStyle(title);
      const fontSize = parseFloat(computed.fontSize);
      const fontWeight = computed.fontWeight && computed.fontWeight !== 'normal'
        ? computed.fontWeight
        : '950';
      const fontFamily = computed.fontFamily || 'sans-serif';

      maskCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      maskCtx.textAlign = 'center';
      maskCtx.textBaseline = 'middle';
      maskCtx.fillStyle = '#fff';
      maskCtx.lineJoin = 'round';
      maskCtx.lineCap = 'round';
      maskCtx.imageSmoothingEnabled = true;
      maskCtx.imageSmoothingQuality = 'high';

      const thickenGlyph = (text, x, y) => {
        const spread = Math.max(fontSize * 0.014, 1.4);
        const offsets = [
          [0, 0],
          [-spread, 0],
          [spread, 0],
          [0, -spread],
          [0, spread],
          [-spread * 0.65, -spread * 0.65],
          [spread * 0.65, -spread * 0.65],
          [-spread * 0.65, spread * 0.65],
          [spread * 0.65, spread * 0.65]
        ];

        offsets.forEach(([offsetX, offsetY]) => {
          maskCtx.fillText(text, x + offsetX, y + offsetY);
        });
      };

      const glyphs = title.querySelectorAll('.hero-title-glyph');

      if (glyphs.length) {
        glyphs.forEach(glyph => {
          const char = glyph.textContent || '';
          if (!char.trim()) return;

          const letter = glyph.parentElement;
          const alpha = (Number.parseFloat(getComputedStyle(glyph).opacity) || 0) *
            (Number.parseFloat(getComputedStyle(letter).opacity) || 0);
          if (alpha <= 0.001) return;

          // centre of the (rotated) glyph box = centre of the glyph
          const glyphRect = glyph.getBoundingClientRect();
          const x = glyphRect.left - rect.left + glyphRect.width / 2;
          const y = glyphRect.top - rect.top + glyphRect.height / 2;

          // tilt of the letter, read from its live CSS transform matrix
          const m = new DOMMatrixReadOnly(getComputedStyle(letter).transform);
          const angle = Math.atan2(m.b, m.a);

          maskCtx.save();
          maskCtx.globalAlpha = Math.min(alpha, 1);
          maskCtx.translate(x, y);
          maskCtx.rotate(angle);
          thickenGlyph(char, 0, 0);
          maskCtx.restore();
        });
      } else {
        thickenGlyph(
          titleText,
          titleRect.left - rect.left + titleRect.width / 2,
          titleRect.top - rect.top + titleRect.height / 2
        );
      }

      maskCtx.restore();
    };

    const resize = () => {
      const rect = getRect();
      if (!rect.width || !rect.height) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      drawMask();
    };

    const render = () => {
      const rect = getRect();

      if (video.readyState >= 2 && rect.width && rect.height && video.videoWidth && video.videoHeight) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMask();

        // "cover" scale, zoomed out by VIDEO_ZOOM — but never smaller than
        // the title itself, so the letters are always fully filled
        const titleRect = title.getBoundingClientRect();
        const coverScale = Math.max(rect.width / video.videoWidth, rect.height / video.videoHeight);
        const titleScale = Math.max(titleRect.width / video.videoWidth, titleRect.height / video.videoHeight);
        const scale = Math.max(coverScale * VIDEO_ZOOM, titleScale);
        const drawWidth = video.videoWidth * scale;
        const drawHeight = video.videoHeight * scale;
        const offsetX = (rect.width - drawWidth) / 2;
        const offsetY = (rect.height - drawHeight) / 2;

        ctx.drawImage(
          video,
          offsetX * dpr,
          offsetY * dpr,
          drawWidth * dpr,
          drawHeight * dpr
        );

        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(maskCanvas, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        section.classList.add('is-canvas-ready');
      }

      if (!reduceMotion.matches) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const applyMotionPreference = () => {
      if (reduceMotion.matches) {
        window.cancelAnimationFrame(frameId);
        video.pause();
        render();
      } else {
        video.play().catch(() => {});
        window.cancelAnimationFrame(frameId);
        frameId = window.requestAnimationFrame(render);
      }
    };

    video.muted = true;
    video.playsInline = true;

    const handleVideoReady = () => {
      resize();
      applyMotionPreference();
    };

    video.addEventListener('loadedmetadata', handleVideoReady);
    video.addEventListener('loadeddata', handleVideoReady);
    window.addEventListener('resize', resize, { passive: true });
    if (typeof reduceMotion.addEventListener === 'function') {
      reduceMotion.addEventListener('change', applyMotionPreference);
    } else if (typeof reduceMotion.addListener === 'function') {
      reduceMotion.addListener(applyMotionPreference);
    }

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(section);
      resizeObserver.observe(title);
    }

    resize();
    applyMotionPreference();
  }

  window.addEventListener('DOMContentLoaded', initHeroVideoText);

  // MouseMove 3D View section (hero layers tilt)
  const rootStyle = document.documentElement.style;
  document.addEventListener('mousemove', e => {
    rootStyle.setProperty('--move-x', `${(e.clientX - window.innerWidth / 2) * -.005}deg`);
    rootStyle.setProperty('--move-y', `${(e.clientY - window.innerHeight / 2) * .01}deg`);
  }, { passive: true });

  /**
   * SECTION 2 — ABOUT scroll animations (GSAP ScrollTrigger)
   */
  function initAbout() {
    const section = document.querySelector('#about');
    if (!section) return;
    const lead = section.querySelector('.about-lead');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!window.gsap || !window.ScrollTrigger || reduce) return; // static, fully visible fallback

    // 1) Lead paragraph lights up word by word, tied to scroll position
    if (lead && !lead.dataset.wordsInit) {
      const words = lead.textContent.trim().split(/\s+/);
      lead.setAttribute('aria-label', lead.textContent.trim());
      lead.textContent = '';
      words.forEach((w, i) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = w;
        lead.appendChild(span);
        if (i < words.length - 1) lead.appendChild(document.createTextNode(' '));
      });
      lead.dataset.wordsInit = 'true';

      const wordEls = lead.querySelectorAll('.word');
      const dim = 0.16;
      wordEls.forEach(el => el.style.setProperty('--word-o', dim));
      ScrollTrigger.create({
        trigger: lead,
        start: 'top 85%',
        end: 'bottom 45%',
        scrub: true,
        onUpdate: (self) => {
          const lit = self.progress * (wordEls.length + 2);
          wordEls.forEach((el, i) => {
            const o = Math.min(Math.max(lit - i, 0), 1);
            el.style.setProperty('--word-o', (dim + (1 - dim) * o).toFixed(3));
          });
        }
      });
    }

    // 2) Kicker line draws in, labels and secondary text slide up
    gsap.fromTo(section.querySelector('.about-kicker'), { '--kicker-line': 0 }, {
      '--kicker-line': 1, duration: 1.4, ease: 'power3.out',
      scrollTrigger: { trigger: section, start: 'top 75%' }
    });
    gsap.from(section.querySelectorAll('.about-kicker span'), {
      yPercent: 120, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: section, start: 'top 75%' }
    });
    gsap.from(section.querySelectorAll('.about-story p + p, .about-location'), {
      y: 32, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: section.querySelector('.about-story'), start: 'top 65%' }
    });

    // 3) Founder card: curtain opens from the bottom, photo settles from extra zoom
    const card = section.querySelector('.founder-card');
    if (card) {
      gsap.fromTo(card, { '--curtain': '100%', '--intro': 1 }, {
        '--curtain': '0%', '--intro': 0, duration: 1.6, ease: 'expo.out',
        scrollTrigger: { trigger: card, start: 'top 80%' }
      });
      gsap.from(card.querySelectorAll('.founder-copy, .founder-capabilities span'), {
        y: 24, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06, delay: 0.5,
        scrollTrigger: { trigger: card, start: 'top 80%' }
      });
    }

    // 4) Parallax: background video drifts slower than the page
    const video = section.querySelector('.about-video');
    if (video) {
      gsap.fromTo(video, { yPercent: -5 }, {
        yPercent: 5, ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }

    // sizes change once fonts/videos arrive
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  }

  initAbout();

  /**
   * CONTENT STREAM — animated "screens" under each phone frame
   *   lava    → gradient lava lamp (CSS blobs, see neon.css)
   *   fractal → colorful recursive polygons that keep changing shape (canvas)
   *   tunnel  → acid-colored warp jump through a star tunnel (canvas)
   * Only screens on screen are animated (IntersectionObserver).
   */
  function initStreamScreens() {
    const screens = document.querySelectorAll('.stream-screen');
    if (!screens.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvases = [];

    const drawFractal = (s) => {
      const { ctx, w, h, t } = s;
      const cx = w / 2;
      const cy = h / 2;
      // a new number of sides every 4s: triangle → square → pentagon → hexagon
      const sides = 3 + Math.floor(t / 4) % 4;
      const ratio = 0.46 + Math.sin(t * 0.7) * 0.08;
      const twist = Math.sin(t * 0.35) * 1.4;

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgb(6 4 18 / 0.22)'; // short trails
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      const poly = (x, y, r, depth, rot) => {
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
          const a = rot + (i / sides) * Math.PI * 2;
          const px = x + Math.cos(a) * r;
          const py = y + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        const hue = (t * 40 + depth * 70 + r * 0.6) % 360;
        ctx.strokeStyle = `hsl(${hue} 95% 62% / ${0.35 + depth * 0.15})`;
        ctx.lineWidth = 0.6 + depth * 0.5;
        ctx.stroke();
        if (depth === 0) return;
        for (let i = 0; i < sides; i++) {
          const a = rot + (i / sides) * Math.PI * 2;
          poly(x + Math.cos(a) * r, y + Math.sin(a) * r, r * ratio, depth - 1, -rot * 1.3 + twist);
        }
      };

      poly(cx, cy, Math.min(w, h) * 0.33, 3, t * 0.3);
    };

    const drawTunnel = (s, dt) => {
      const { ctx, w, h, t } = s;
      const cx = w / 2 + Math.sin(t * 0.6) * w * 0.08; // the tunnel gently snakes
      const cy = h / 2 + Math.cos(t * 0.45) * h * 0.05;
      const focal = Math.min(w, h) * 0.9;

      if (!s.stars) {
        s.stars = Array.from({ length: 260 }, () => ({
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: Math.random() * 3 + 0.1,
          hue: Math.random() * 360
        }));
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgb(4 2 14 / 0.3)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      // tunnel rings rushing towards the viewer
      for (let i = 0; i < 7; i++) {
        const z = 3 - ((t * 0.9 + i * 0.43) % 3);
        const r = focal * 0.55 / Math.max(z, 0.05);
        const hue = (t * 60 + i * 50) % 360;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 1.15, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `hsl(${hue} 100% 60% / ${Math.min(0.35, 0.6 / (z + 0.5))})`;
        ctx.lineWidth = Math.max(1, 6 / (z + 0.4));
        ctx.stroke();
      }

      // star streaks
      const speed = 1.6 * dt;
      s.stars.forEach(star => {
        const prevZ = star.z;
        star.z -= speed;
        if (star.z <= 0.05) {
          star.x = (Math.random() - 0.5) * 2;
          star.y = (Math.random() - 0.5) * 2;
          star.z = 3;
          star.hue = Math.random() * 360;
          return;
        }
        const x1 = cx + (star.x / prevZ) * focal * 0.3;
        const y1 = cy + (star.y / prevZ) * focal * 0.3;
        const x2 = cx + (star.x / star.z) * focal * 0.3;
        const y2 = cy + (star.y / star.z) * focal * 0.3;
        const hue = (star.hue + t * 90) % 360;
        ctx.strokeStyle = `hsl(${hue} 100% 65% / ${Math.min(1, 1.4 / star.z)})`;
        ctx.lineWidth = Math.max(0.6, 2.2 / star.z);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
    };

    const painters = { fractal: drawFractal, tunnel: drawTunnel };

    screens.forEach(screen => {
      const kind = screen.dataset.screen;
      if (kind === 'lava') {
        // blobs: own column, size, speed and phase
        for (let i = 0; i < 6; i++) {
          const blob = document.createElement('i');
          blob.className = 'lava-blob';
          blob.style.setProperty('--x', `${8 + ((i * 37) % 70)}%`);
          blob.style.setProperty('--s', `${34 + ((i * 23) % 28)}%`);
          blob.style.setProperty('--d', `${9 + (i % 3) * 3.5}s`);
          blob.style.setProperty('--delay', `${-i * 2.3}s`);
          screen.appendChild(blob);
        }
        return;
      }
      if (!painters[kind]) return;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      screen.appendChild(canvas);
      canvases.push({ screen, canvas, ctx, kind, w: 0, h: 0, t: Math.random() * 16, visible: false });
    });

    const resize = (s) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      s.w = s.screen.clientWidth;
      s.h = s.screen.clientHeight;
      s.canvas.width = Math.max(1, Math.round(s.w * dpr));
      s.canvas.height = Math.max(1, Math.round(s.h * dpr));
      s.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      painters[s.kind](s, 0.016);
    };
    canvases.forEach(resize);
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(entries => entries.forEach(e => {
        const s = canvases.find(c => c.screen === e.target);
        if (s) resize(s);
      }));
      canvases.forEach(s => ro.observe(s.screen));
    }

    if (reduceMotion) {
      screens.forEach(screen => screen.classList.add('is-paused'));
      return;
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => entries.forEach(e => {
        e.target.classList.toggle('is-paused', !e.isIntersecting);
        const s = canvases.find(c => c.screen === e.target);
        if (s) s.visible = e.isIntersecting;
      }), { threshold: 0.05 });
      screens.forEach(screen => io.observe(screen));
    } else {
      canvases.forEach(s => { s.visible = true; });
    }

    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!document.hidden) {
        canvases.forEach(s => {
          if (!s.visible || !s.w) return;
          s.t += dt;
          painters[s.kind](s, dt);
        });
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  initStreamScreens();

  /**
   * Contact form — placeholder: validates and thanks, sends nothing yet
   */
  function initContactForm() {
    const form = document.querySelector('#contactForm');
    if (!form) return;
    const status = form.querySelector('.contact-form__status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        status.textContent = 'Please fill in your name, a valid email and a message.';
        return;
      }
      status.textContent = 'Thanks! The form is a demo for now — please email us directly.';
      form.reset();
      form.classList.remove('was-validated');
    });
  }

  initContactForm();


})();








