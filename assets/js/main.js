
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
   * Portfolio slider filters: All / Animations / Websites swap the slides
   * in the swiper (the original slides are kept and re-appended).
   */
  function initPortfolioSlider() {
    const slider = document.querySelector('.portfolio-swiper');
    const filters = document.querySelectorAll('#portfolio .portfolio-filters li');
    if (!slider || !filters.length) return;
    const all = Array.from(slider.querySelectorAll('.swiper-slide'));

    const apply = (li) => {
      const swiper = slider.swiper;
      if (!swiper) return;
      filters.forEach(f => {
        f.classList.toggle('filter-active', f === li);
        f.setAttribute('aria-pressed', String(f === li));
      });
      const sel = li.getAttribute('data-filter');
      const keep = sel === '*' ? all : all.filter(sl => sl.matches(sel));
      swiper.removeAllSlides();
      swiper.appendSlide(keep);
      swiper.update();
      swiper.slideTo(0, 0);
    };

    // clicked card melts into a blur while the video window opens (neon.css → .is-opening)
    slider.addEventListener('click', (e) => {
      const card = e.target.closest('.portfolio-content');
      if (!card) return;
      card.classList.add('is-opening');
      setTimeout(() => card.classList.remove('is-opening'), 900);
    });

    filters.forEach(li => {
      li.addEventListener('click', () => apply(li));
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          apply(li);
        }
      });
    });
  }

  window.addEventListener('load', initPortfolioSlider);

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

        // centred on the title itself and always covering it (+12% for the
        // letters' scatter) on any screen size; otherwise "cover" zoomed out by VIDEO_ZOOM
        const titleRect = title.getBoundingClientRect();
        const coverScale = Math.max(rect.width / video.videoWidth, rect.height / video.videoHeight);
        const titleScale = Math.max(titleRect.width / video.videoWidth, titleRect.height / video.videoHeight) * 1.12;
        const scale = Math.max(coverScale * VIDEO_ZOOM, titleScale);
        const drawWidth = video.videoWidth * scale;
        const drawHeight = video.videoHeight * scale;
        const centerX = titleRect.width ? titleRect.left - rect.left + titleRect.width / 2 : rect.width / 2;
        const centerY = titleRect.height ? titleRect.top - rect.top + titleRect.height / 2 : rect.height / 2;
        const offsetX = centerX - drawWidth / 2;
        const offsetY = centerY - drawHeight / 2;

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
   * CONTENT STREAM — every phone screen is a gradient lava lamp (CSS blobs,
   * own color scheme per slide in neon.css) with a play button: the first
   * click loads the slide's 5s spot (data-video) and plays it with sound.
   * Only one spot plays at a time; it stops when the phone leaves the screen.
   */
  function initStreamScreens() {
    const devices = document.querySelectorAll('.stream-device');
    if (!devices.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = null; // device whose spot is playing

    const stop = (device) => {
      const video = device.querySelector('.stream-video');
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      device.classList.remove('is-playing');
      device.querySelector('.stream-play')?.setAttribute('aria-pressed', 'false');
      if (current === device) {
        current = null;
        // lofi.js brings the background music back up
        window.dispatchEvent(new CustomEvent('sndr:spot', { detail: { playing: false } }));
      }
    };

    devices.forEach(device => {
      const screen = device.querySelector('.stream-screen');
      const button = device.querySelector('.stream-play');

      // lava blobs: own column, size, speed and phase
      if (screen) {
        for (let i = 0; i < 6; i++) {
          const blob = document.createElement('i');
          blob.className = 'lava-blob';
          blob.style.setProperty('--x', `${8 + ((i * 37) % 70)}%`);
          blob.style.setProperty('--s', `${34 + ((i * 23) % 28)}%`);
          blob.style.setProperty('--d', `${9 + (i % 3) * 3.5}s`);
          blob.style.setProperty('--delay', `${-i * 2.3}s`);
          screen.appendChild(blob);
        }
        if (reduceMotion) screen.classList.add('is-paused');
      }

      if (!button || !screen || !device.dataset.video) return;
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        if (device.classList.contains('is-playing')) {
          stop(device);
          return;
        }
        if (current) stop(current);

        let video = device.querySelector('.stream-video');
        if (!video) {
          video = document.createElement('video');
          video.className = 'stream-video';
          video.src = device.dataset.video;
          video.playsInline = true;
          video.preload = 'auto';
          video.addEventListener('ended', () => stop(device));
          screen.appendChild(video);
        }
        current = device;
        window.dispatchEvent(new CustomEvent('sndr:spot', { detail: { playing: true } }));
        device.classList.add('is-playing');
        button.setAttribute('aria-pressed', 'true');
        video.play().catch(() => stop(device));
      });
    });

    // pause lava off screen, stop a spot when its phone scrolls/slides away
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => entries.forEach(e => {
        const screen = e.target.querySelector('.stream-screen');
        if (screen && !reduceMotion) screen.classList.toggle('is-paused', !e.isIntersecting);
        if (!e.isIntersecting && e.target.classList.contains('is-playing')) stop(e.target);
      }), { threshold: 0.05 });
      devices.forEach(device => io.observe(device));
    }
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

  /**
   * FOUNDER CARD — on hover the frame takes an oily rainbow film and a
   * soap-bubble lens sticks to the cursor: inside it the card is magnified
   * with a fish-eye distortion (SVG displacement map built at runtime).
   * The card's clip-path keeps the lens inside the card.
   * Styles: neon.css → FOUNDER CARD LENS.
   */
  function initFounderLens() {
    const card = document.querySelector('#about .founder-card');
    if (!card) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const LENS = 150; // px
    const ZOOM = 1.6;

    // fish-eye displacement map: R/G = where each lens pixel samples from
    // (pulled towards the centre, so the middle bulges like a drop of water)
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = mapCanvas.height = 128;
    const mctx = mapCanvas.getContext('2d');
    const img = mctx.createImageData(128, 128);
    for (let y = 0; y < 128; y++) {
      for (let x = 0; x < 128; x++) {
        const u = (x / 127) * 2 - 1;
        const v = (y / 127) * 2 - 1;
        const r = Math.hypot(u, v);
        const k = r < 1 && r > 0 ? Math.pow(r, 1.55) / r : 1; // sample radius r^1.55
        const i = (y * 128 + x) * 4;
        img.data[i] = Math.round((0.5 + (u * k - u) / 4) * 255);
        img.data[i + 1] = Math.round((0.5 + (v * k - v) / 4) * 255);
        img.data[i + 2] = 128;
        img.data[i + 3] = 255;
      }
    }
    mctx.putImageData(img, 0, 0);
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';
    svg.innerHTML = `
      <filter id="founder-fisheye" x="0" y="0" width="${LENS}" height="${LENS}"
              filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feImage href="${mapCanvas.toDataURL()}" x="0" y="0" width="${LENS}" height="${LENS}" preserveAspectRatio="none" result="map"/>
        <feDisplacementMap in="SourceGraphic" in2="map" scale="${LENS}" xChannelSelector="R" yChannelSelector="G"/>
      </filter>`;
    document.body.appendChild(svg);

    const film = document.createElement('div');
    film.className = 'founder-film';
    film.setAttribute('aria-hidden', 'true');

    // the lens shows a magnified copy of the card's own layers
    const lens = document.createElement('div');
    lens.className = 'founder-lens';
    lens.setAttribute('aria-hidden', 'true');
    lens.style.setProperty('--lens', `${LENS}px`);
    const view = document.createElement('div');
    view.className = 'founder-lens__view';
    const content = document.createElement('div');
    content.className = 'founder-lens__content';
    // only the photo is magnified; the card's text stays on top, readable through the lens
    card.querySelectorAll(':scope > img').forEach(el => content.appendChild(el.cloneNode(true)));
    content.querySelectorAll('img').forEach(i => { i.alt = ''; i.loading = 'eager'; });
    const shade = document.createElement('div');
    shade.className = 'founder-lens__shade';
    content.appendChild(shade);
    view.appendChild(content);
    lens.appendChild(view);
    card.append(film, lens);

    let target = null;
    let pos = null;
    let rafId = 0;

    const loop = () => {
      if (target) {
        if (!pos) pos = { ...target };
        // sticks to the cursor with a little jelly lag
        const vx = (target.x - pos.x) * 0.35;
        const vy = (target.y - pos.y) * 0.35;
        pos.x += vx;
        pos.y += vy;
        const speed = Math.min(Math.hypot(vx, vy) / 40, 0.18);
        const angle = Math.atan2(vy, vx);
        content.style.width = `${card.clientWidth}px`;
        content.style.height = `${card.clientHeight}px`;
        content.style.transform =
          `translate(${LENS / 2 - pos.x * ZOOM}px, ${LENS / 2 - pos.y * ZOOM}px) scale(${ZOOM})`;
        lens.style.transform =
          `translate(${pos.x - LENS / 2}px, ${pos.y - LENS / 2}px) rotate(${angle}rad) scale(${1 + speed}, ${1 - speed * 0.6}) rotate(${-angle}rad)`;
      }
      rafId = requestAnimationFrame(loop);
    };

    card.addEventListener('pointerenter', () => {
      card.classList.add('has-lens');
      if (!rafId) rafId = requestAnimationFrame(loop);
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('has-lens');
      cancelAnimationFrame(rafId);
      rafId = 0;
      target = null;
      pos = null;
    });
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      target = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    });
  }

  initFounderLens();

  /**
   * STATS — a liquid gradient blob follows the cursor inside each card
   * (same palette and wobble as the 3D blobs). Styles: neon.css → STATS BLOB.
   */
  function initStatsBlobs() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('.stats .stats-item').forEach((item, i) => {
      const blob = document.createElement('span');
      blob.className = 'stat-blob';
      blob.setAttribute('aria-hidden', 'true');
      blob.style.setProperty('--hue', `${i * 70}deg`);
      item.prepend(blob);
      let target = null;
      let pos = null;
      let raf = 0;
      const loop = () => {
        if (target) {
          if (!pos) pos = { ...target };
          pos.x += (target.x - pos.x) * 0.12;
          pos.y += (target.y - pos.y) * 0.12;
          blob.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
        }
        raf = requestAnimationFrame(loop);
      };
      item.addEventListener('pointerenter', (e) => {
        const r = item.getBoundingClientRect();
        target = { x: e.clientX - r.left, y: e.clientY - r.top };
        if (!raf) raf = requestAnimationFrame(loop);
      });
      item.addEventListener('pointermove', (e) => {
        const r = item.getBoundingClientRect();
        target = { x: e.clientX - r.left, y: e.clientY - r.top };
      });
      item.addEventListener('pointerleave', () => {
        cancelAnimationFrame(raf);
        raf = 0;
        // keep the last position: the blob fades out where it was
        target = null;
        pos = null;
      });
    });
  }

  initStatsBlobs();

  /**
   * CURSOR — a bright wobbling blot with a pulsing colored core and ripples
   * spreading out of it; grows over links/buttons, bursts on click.
   * Desktop mouse only; the system cursor is hidden while it is active.
   * Styles: neon.css → SITE CURSOR.
   */
  function initBlobCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cursor = document.createElement('div');
    cursor.className = 'blob-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = '<span class="blob-cursor__blot"></span><span class="blob-cursor__core"></span>';
    document.body.appendChild(cursor);
    document.documentElement.classList.add('has-blob-cursor');

    let x = -100;
    let y = -100;
    let cx = -100;
    let cy = -100;
    let shown = false;
    let lastRipple = 0;

    const ripple = (big) => {
      const ring = document.createElement('span');
      ring.className = big ? 'blob-cursor__ring is-burst' : 'blob-cursor__ring';
      ring.style.left = `${cx}px`;
      ring.style.top = `${cy}px`;
      ring.addEventListener('animationend', () => ring.remove());
      document.body.appendChild(ring);
    };

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        cx = x;
        cy = y;
        cursor.classList.add('is-visible');
      }
      const hot = e.target.closest && e.target.closest('a, button, [role="button"], .service-row, .stream-play, label, select');
      cursor.classList.toggle('is-hot', !!hot);
    }, { passive: true });
    document.addEventListener('pointerleave', () => { shown = false; cursor.classList.remove('is-visible'); });
    window.addEventListener('pointerdown', () => { cursor.classList.add('is-down'); if (!reduce) ripple(true); });
    window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));

    const loop = (now) => {
      cx += (x - cx) * 0.28;
      cy += (y - cy) * 0.28;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      // a ripple spreads out every ~2s
      if (shown && !reduce && now - lastRipple > 2000) {
        lastRipple = now;
        ripple(false);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  initBlobCursor();


})();








