
(function() {
  "use strict";

  /**
   * Header toggle
   */
  const headerToggleBtn = document.querySelector('.header-toggle');

  function headerToggle() {
    document.querySelector('#header').classList.toggle('header-show');
    headerToggleBtn.classList.toggle('bi-list');
    headerToggleBtn.classList.toggle('bi-x');
  }
  headerToggleBtn.addEventListener('click', headerToggle);

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
   * Smooth scroll for navmenu anchor links
   */
  document.querySelectorAll('#navmenu a[href^="#"]').forEach((navmenuLink) => {
    navmenuLink.addEventListener('click', (e) => {
      const targetId = navmenuLink.getAttribute('href');
      if (!targetId) return;

      const targetSection = document.querySelector(targetId);
      if (!targetSection) return;

      e.preventDefault();
      targetSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
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
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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
    selector: '.glightbox'
  });

  /**
   * Init isotope layout and filters
   */


  window.addEventListener("load", () => {
  const grid = document.querySelector(".isotope-container");
  if (!grid) return;

  // 1) РґРѕР¶РґР°С‚СЊСЃСЏ РєР°СЂС‚РёРЅРѕРє
  imagesLoaded(grid, () => {
    // 2) РґРѕР¶РґР°С‚СЊСЃСЏ С‚РѕРіРѕ, С‡С‚Рѕ РІРёРґРµРѕ РїРѕР»СѓС‡РёР»Рё СЂР°Р·РјРµСЂС‹ (metadata/poster)
    const videos = grid.querySelectorAll("video");
    const waits = Array.from(videos).map(v => {
      if (v.readyState >= 1) return Promise.resolve(); // metadata СѓР¶Рµ РµСЃС‚СЊ
      return new Promise(res => v.addEventListener("loadedmetadata", res, { once:true }));
    });

    Promise.all(waits).then(() => {
      // init isotope РїРѕСЃР»Рµ С‚РѕРіРѕ РєР°Рє СЂР°Р·РјРµСЂС‹ СЃС‚Р°Р±РёР»СЊРЅС‹
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
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
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
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
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
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
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
   * Hero subtitle letter-by-letter reveal
   */
  function initHeroSubtitleReveal() {
    const subtitle = document.querySelector('.hero-content__p p');
    if (!subtitle || subtitle.dataset.lettersInit === 'true') return;

    const text = subtitle.textContent;
    subtitle.textContent = '';

    Array.from(text).forEach((char, index) => {
      const letter = document.createElement('span');
      letter.className = 'hero-letter';
      letter.textContent = char === ' ' ? '\u00A0' : char;
      letter.style.animationDelay = `${index * 0.04}s`;
      subtitle.appendChild(letter);
    });

    subtitle.dataset.lettersInit = 'true';
  }

    /**
   * Hero title scatter on scroll to the next section
   */
  function initHeroTitleScatterOnScroll() {
    const hero = document.querySelector('#hero');
    const title = document.querySelector('#hero .hero-content h1');
    if (!hero || !title || title.dataset.scatterInit === 'true') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const text = title.textContent || '';
    title.textContent = '';

    const chars = Array.from(text);
    const count = Math.max(chars.length - 1, 1);

    chars.forEach((char, index) => {
      const span = document.createElement('span');
      const angle = (index / count) * Math.PI * 2;
      const radius = 95 + (index % 5) * 24;
      const x = Math.cos(angle) * radius + (index % 2 === 0 ? 20 : -20);
      const y = Math.sin(angle) * radius - 40 - (index % 3) * 12;
      const rotate = (index % 2 === 0 ? 1 : -1) * (14 + (index % 4) * 6);

      span.className = 'hero-title-letter';
      if (char === ' ') {
        span.classList.add('hero-title-space');
        span.textContent = '\u00A0';
      } else {
        span.textContent = char;
      }

      span.style.setProperty('--scatter-x', `${x.toFixed(1)}px`);
      span.style.setProperty('--scatter-y', `${y.toFixed(1)}px`);
      span.style.setProperty('--scatter-r', `${rotate.toFixed(1)}deg`);
      title.appendChild(span);
    });

    title.dataset.scatterInit = 'true';

    let ticking = false;
    const updateScatter = () => {
      const progress = Math.min(Math.max(window.scrollY / (hero.offsetHeight * 0.7), 0), 1);
      title.style.setProperty('--scatter-progress', progress.toFixed(4));
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScatter);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  window.addEventListener('load', initHeroTitleScatterOnScroll);

  // MouseMove 3D View section
  document.addEventListener('mousemove', e => {
	Object.assign(document.documentElement, {
		style: `
		--move-x: ${(e.clientX - window.innerWidth / 2) * -.005}deg;
		--move-y: ${(e.clientY - window.innerHeight / 2) * .01}deg;
		`
	})
})





})();








