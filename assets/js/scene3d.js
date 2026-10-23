/* =====================================================================
   SNDR STUDIO — Three.js scenes (global THREE r160 from the CDN)
   1) initOfferScene()    — "Dreaming of Jupiter"-style backdrop for
                            #what-we-offer (after isladjan's CodePen): gas giant,
                            moon, star dome, breathing wireframe terrain, star
                            streaks. Procedural textures in the site palette,
                            slower motion, camera follows the section scroll.
   2) initFloatingBlobs() — from Portfolio down: gradient "bulbs" along
                            the page edges, mostly far back (depth haze, glow
                            halo + soft shadow, long scroll parallax, surface
                            smears under the cursor) and softly glowing jellyfish
                            rising from the bottom; plus a small scene deep
                            behind the Content Stream phones. (Line-art sea
                            creatures live in sea.js.)
   ===================================================================== */
(function () {
  'use strict';

  if (!window.THREE) return;
  const THREE = window.THREE;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = () => window.innerWidth < 768;
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------------- procedural textures ---------------- */

  const canvasTexture = (w, h, paint) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    paint(c.getContext('2d'), w, h);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  };

  // gas giant: turbulent bands in aqua / violet / magenta
  const planetTexture = () => canvasTexture(1024, 512, (ctx, w, h) => {
    const bands = ['#1b1340', '#3b2a8f', '#5ccfe6', '#2a1d6b', '#9d8cff', '#14315c', '#c45ab3', '#22205a', '#7fe3f0', '#1b1340'];
    for (let y = 0; y < h; y++) {
      const v = y / h;
      const t = v * (bands.length - 1);
      const i = Math.floor(t);
      const c1 = new THREE.Color(bands[i]);
      const c2 = new THREE.Color(bands[Math.min(i + 1, bands.length - 1)]);
      ctx.fillStyle = `#${c1.lerp(c2, t - i).getHexString()}`;
      // each row slightly shifted -> turbulent, streaky bands
      for (let x = 0; x < w; x += 8) {
        const wob = Math.sin(x * 0.012 + y * 0.09) * 6 + Math.sin(x * 0.031 - y * 0.05) * 3;
        ctx.fillRect(x, y + wob * 0.15, 8, 1.5);
      }
    }
    // storm eye
    const g = ctx.createRadialGradient(w * 0.68, h * 0.62, 4, w * 0.68, h * 0.62, 60);
    g.addColorStop(0, 'rgba(255,190,240,0.9)');
    g.addColorStop(1, 'rgba(255,190,240,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(w * 0.68, h * 0.62, 70, 30, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // moon: lilac rock with craters
  const moonTexture = () => canvasTexture(512, 256, (ctx, w, h) => {
    ctx.fillStyle = '#8a86a8';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 14 + 1;
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '40,36,70' : '210,206,240'},${Math.random() * 0.35})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // star dome: deep navy, nebula clouds, stars
  const skyTexture = () => canvasTexture(2048, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#05060f';
    ctx.fillRect(0, 0, w, h);
    const clouds = [['#3b2a8f', 0.25], ['#0f5c6e', 0.2], ['#6b1f6e', 0.18]];
    for (let i = 0; i < 9; i++) {
      const [col, a] = clouds[i % clouds.length];
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = rand(180, 420);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = a;
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 2600; i++) {
      const s = Math.random() < 0.94 ? 1 : 2;
      ctx.fillStyle = `rgba(255,255,255,${rand(0.3, 1)})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
    }
  });

  // terrain: dark violet floor fading into aqua near the horizon
  const terrainTexture = () => canvasTexture(256, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0b2a40');
    g.addColorStop(0.5, '#1a1240');
    g.addColorStop(1, '#070818');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  /* =====================================================================
     1) WHAT WE OFFER backdrop
     ===================================================================== */
  function initOfferScene() {
    const section = document.querySelector('#what-we-offer');
    if (!section) return;

    const holder = document.createElement('div');
    holder.className = 'offer-3d';
    holder.setAttribute('aria-hidden', 'true');
    section.prepend(holder);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    holder.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#1a0f3a', 0.5, 55);
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
    camera.position.set(0, 1, 32);

    const light = new THREE.PointLight('#ffffff', 2.2, 0, 0);
    light.position.set(0, 30, 30);
    scene.add(light, new THREE.AmbientLight('#5a4f9e', 0.35));

    // planet
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(10, 64, 64),
      new THREE.MeshLambertMaterial({ map: planetTexture(), fog: false })
    );
    planet.position.set(0, 8, -30);
    planet.rotation.z = 0.25;
    scene.add(planet);

    // thin ring around the planet
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(13, 17.5, 128),
      new THREE.MeshBasicMaterial({ color: '#9d8cff', transparent: true, opacity: 0.18, side: THREE.DoubleSide, fog: false })
    );
    ring.position.copy(planet.position);
    ring.rotation.set(-1.25, 0.2, 0.25);
    scene.add(ring);

    // moon
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(2, 32, 32),
      new THREE.MeshPhongMaterial({ map: moonTexture(), fog: false, shininess: 4 })
    );
    scene.add(moon);

    // star dome
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(150, 32, 32),
      new THREE.MeshBasicMaterial({ map: skyTexture(), side: THREE.BackSide, fog: false })
    );
    sky.position.set(0, 50, 0);
    scene.add(sky);

    // terrain + its wireframe
    const terrainGeo = new THREE.PlaneGeometry(70, 70, 28, 28);
    const base = terrainGeo.attributes.position.array.slice();
    const seeds = new Float32Array(terrainGeo.attributes.position.count).map(() => Math.random() * 5);
    const terrain = new THREE.Mesh(terrainGeo, new THREE.MeshBasicMaterial({ map: terrainTexture() }));
    // same geometry drawn as wireframe, so it follows the displacement for free
    const lines = new THREE.Mesh(
      terrainGeo,
      new THREE.MeshBasicMaterial({ color: '#5ccfe6', wireframe: true, transparent: true, opacity: 0.55 })
    );
    [terrain, lines].forEach(m => {
      m.rotation.x = -0.47 * Math.PI;
      m.rotation.z = THREE.MathUtils.degToRad(90);
      scene.add(m);
    });

    // star streaks
    const STARS = isSmall() ? 350 : 800;
    const starPos = new Float32Array(STARS * 6);
    const starVel = new Float32Array(STARS);
    const resetStar = (i, zMin, zMax) => {
      let x = rand(-100, 100);
      const y = rand(10, 40);
      if (x < 7 && x > -7 && y < 20) x += 14;
      const z = rand(zMin, zMax);
      starPos.set([x, y, z, x, y, z], i * 6);
      starVel[i] = 0;
    };
    for (let i = 0; i < STARS; i++) resetStar(i, -300, 0);
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3).setUsage(THREE.DynamicDrawUsage));
    scene.add(new THREE.LineSegments(starGeo, new THREE.LineBasicMaterial({ color: '#cfefff', transparent: true, opacity: 0.45, fog: false })));

    const tp = terrainGeo.attributes.position;

    // The canvas is one viewport tall and sticky (neon.css), so opening a row
    // (the section grows) never resizes it: resizing clears the WebGL buffer,
    // which showed as a dark flash. Only a real width/viewport change resizes,
    // and the frame is redrawn right away.
    let sizeW = 0;
    let sizeH = 0;
    let baseH = section.offsetHeight;
    window.addEventListener('load', () => { baseH = section.offsetHeight; }, { once: true });
    const resize = () => {
      const w = holder.clientWidth;
      const h = window.innerHeight;
      if (!w || !h || (w === sizeW && h === sizeH)) return;
      sizeW = w;
      sizeH = h;
      if (!section.querySelector('.service-row.open')) baseH = section.offsetHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    let visible = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '200px' }).observe(section);
    } else {
      visible = true;
    }

    const clock = new THREE.Clock();
    let t = 0;
    let camY = 0;
    let camZ = 32;

    const frame = () => {
      requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible || document.hidden) return;
      t += dt;

      // slow, smooth motion (about a third of the original speed)
      planet.rotation.y += dt * 0.04;
      sky.rotation.y += dt * 0.012;
      sky.rotation.x += dt * 0.006;
      moon.rotation.y -= dt * 0.15;
      moon.position.set(15 * Math.cos(t * 0.18), 8, 20 * Math.sin(t * 0.18) - 35);

      // terrain breathes
      for (let i = 0; i < tp.count; i++) {
        const x = base[i * 3];
        const y = base[i * 3 + 1];
        const centre = Math.abs(y) < 4; // keep a calm valley in the middle
        tp.setZ(i, centre ? 0 : Math.sin(x * 0.18 + t * 0.35 + seeds[i]) * Math.cos(y * 0.15 + t * 0.25) * (seeds[i] * 0.5 + 0.6));
      }
      tp.needsUpdate = true;

      // star streaks rushing past
      for (let i = 0; i < STARS; i++) {
        starVel[i] += dt * 0.12;
        starPos[i * 6 + 2] += starVel[i];
        starPos[i * 6 + 5] += starVel[i] * 1.03;
        if (starPos[i * 6 + 2] > 50) resetStar(i, -200, 10);
      }
      starGeo.attributes.position.needsUpdate = true;

      // camera: gentle sway + follows the section scroll (dives towards the planet)
      // progress uses the section height measured on load/resize, so opening a
      // row (the section grows) does not move the camera
      const r = section.getBoundingClientRect();
      const p = THREE.MathUtils.clamp((window.innerHeight - r.top) / (baseH + window.innerHeight), 0, 1);
      camY += ((-1.2 + p * 6) - camY) * 0.05;
      camZ += ((34 - p * 10) - camZ) * 0.05;
      camera.position.set(Math.sin(t * 0.08) * 14, camY, camZ);
      camera.lookAt(0, 2 + p * 3, 0);

      renderer.render(scene, camera);
    };
    if (reduceMotion) {
      renderer.render(scene, camera);
    } else {
      requestAnimationFrame(frame);
    }
  }

  /* =====================================================================
     2) Floating gradient blobs over the whole landing
     ===================================================================== */
  const NOISE = /* glsl */ `
    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C=vec2(1.0/6.0,1.0/3.0);
      const vec4 D=vec4(0.0,0.5,1.0,2.0);
      vec3 i=floor(v+dot(v,C.yyy));
      vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz);
      vec3 l=1.0-g;
      vec3 i1=min(g.xyz,l.zxy);
      vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx;
      vec3 x2=x0-i2+C.yyy;
      vec3 x3=x0-D.yyy;
      i=mod289(i);
      vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
      float n_=0.142857142857;
      vec3 ns=n_*D.wyz-D.xzx;
      vec4 j=p-49.0*floor(p*ns.z*ns.z);
      vec4 x_=floor(j*ns.z);
      vec4 y_=floor(j-7.0*x_);
      vec4 x=x_*ns.x+ns.yyyy;
      vec4 y=y_*ns.x+ns.yyyy;
      vec4 h=1.0-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy);
      vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.0+1.0;
      vec4 s1=floor(b1)*2.0+1.0;
      vec4 sh=-step(h,vec4(0.0));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
      vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x);
      vec3 p1=vec3(a0.zw,h.y);
      vec3 p2=vec3(a1.xy,h.z);
      vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
      vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
      m=m*m;
      return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }
  `;

  function initFloatingBlobs() {
    if (reduceMotion) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'blob-layer';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    const small = isSmall();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5));
    renderer.setClearColor(0x000000, 0); // transparent: the page shows through

    const scene = new THREE.Scene();
    const CAM_Z = 12;
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, CAM_Z);

    // key light that slowly orbits: its direction feeds the blob shader
    const lightDir = new THREE.Vector3(0.6, 0.8, 0.7).normalize();

    /* ---------- page metrics ---------- */
    let vw = 1;
    let vh = 1;
    let docH = 1;
    let startY = 0;   // page Y where the edge blobs begin (middle of the Portfolio title)
    let edge = 0;     // px between the viewport edge and the main .container
    const measure = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      docH = document.documentElement.scrollHeight;
      const title = document.querySelector('#portfolio .section-title h2');
      startY = title ? title.getBoundingClientRect().top + window.scrollY + title.offsetHeight / 2 : vh;
      const box = document.querySelector('#about .container') || document.querySelector('.container');
      edge = box ? Math.max((vw - box.clientWidth) / 2, 0) : 0;
      renderer.setSize(vw, vh, false);
      camera.aspect = vw / vh;
      camera.updateProjectionMatrix();
    };
    measure();

    const halfH = (z) => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (CAM_Z - z);
    // screen px -> world units at depth z
    const toWorld = (xPx, yPx, z, out) => {
      const hh = halfH(z);
      return out.set(((xPx / vw) * 2 - 1) * hh * camera.aspect, (1 - (yPx / vh) * 2) * hh, z);
    };
    const pxPerUnit = (z) => vh / (2 * halfH(z));

    /* ---------- blobs ---------- */
    const geometry = new THREE.IcosahedronGeometry(1, small ? 20 : 36);
    const palettes = [
      ['#5ccfe6', '#9d8cff'], ['#ff8ac6', '#ffd36b'], ['#39ff9c', '#5ccfe6'],
      ['#9d8cff', '#ff5a8a'], ['#7fe3f0', '#3b5bff'], ['#ffb347', '#ff6f91'],
    ];

    const makeBlobMaterial = (a, b, seed) => new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uSeed: { value: seed },
        uColorA: { value: new THREE.Color(a) },
        uColorB: { value: new THREE.Color(b) },
        uLight: { value: lightDir },
        uOpacity: { value: 0.9 },
        uPointer: { value: new THREE.Vector3(999, 999, 0) },
        uPointerAmt: { value: 0 },
        uRadius: { value: 1 },
        uHaze: { value: 0 },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uSeed;
        uniform vec3 uPointer;
        uniform float uPointerAmt;
        uniform float uRadius;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying float vNoise;
        varying float vInfl;
        ${NOISE}
        void main() {
          float n = snoise(normal * 0.85 + vec3(uTime * 0.12 + uSeed));
          vNoise = n;
          vec3 pos = position + normal * n * 0.16; // soft wobble

          // cursor smear: the surface under the pointer ripples and melts
          vec3 wPos = (modelMatrix * vec4(pos, 1.0)).xyz;
          vec3 wNormal = normalize(mat3(modelMatrix) * normal);
          float infl = uPointerAmt
            * smoothstep(uRadius, 0.0, distance(wPos.xy, uPointer.xy))
            * smoothstep(-0.2, 0.5, wNormal.z);             // front side only
          pos += normal * infl * (0.22 * snoise(position * 3.2 + vec3(uTime * 1.6)) + 0.1);
          vInfl = infl;

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          vViewDir = -mv.xyz;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uSeed;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uLight;
        uniform float uOpacity;
        uniform float uHaze;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying float vNoise;
        varying float vInfl;
        void main() {
          vec3 n = normalize(vNormal);
          vec3 v = normalize(vViewDir);
          vec3 l = normalize((viewMatrix * vec4(uLight, 0.0)).xyz);
          // gradient fill that keeps sliding across the surface
          float k = 0.5 + 0.5 * sin(n.y * 2.2 + n.x * 1.4 + vNoise * 2.0 + uTime * 0.35 + uSeed);
          vec3 base = mix(uColorA, uColorB, k);
          float diff = max(dot(n, l), 0.0);
          float spec = pow(max(dot(reflect(-l, n), v), 0.0), 28.0);
          float rim = pow(1.0 - max(dot(n, v), 0.0), 2.5);
          vec3 col = base * (0.35 + 0.75 * diff) + spec * 0.6 + rim * mix(uColorB, vec3(1.0), 0.4) * 0.6;
          // smeared area: colors run together and turn milky / see-through
          col = mix(col, mix(uColorA, uColorB, 0.5) + 0.18, vInfl * 0.55);
          // far blobs sink into the deep-blue haze of the page
          col = mix(col, vec3(0.06, 0.09, 0.2), uHaze);
          float alpha = uOpacity * (0.75 + rim * 0.25) * (1.0 - vInfl * 0.45);
          gl_FragColor = vec4(col, alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    });

    // depth: z from -16 (far) to 3 (near)
    const Z_FAR = -16;
    const Z_NEAR = 3;
    const depthK = (z) => (z - Z_FAR) / (Z_NEAR - Z_FAR); // 0 far .. 1 near

    // glow halo + soft drop shadow drawn as sprites around each blob
    const spriteTexture = (inner, outer) => {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const g = c.getContext('2d');
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, inner);
      grad.addColorStop(1, outer);
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    };
    const haloTex = spriteTexture('rgba(255,255,255,0.9)', 'rgba(255,255,255,0)');
    const ovalTex = spriteTexture('rgba(235,248,255,0.9)', 'rgba(235,248,255,0)');
    const lightSprites = (color, order) => {
      const make = (map, blending, opacity) => {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map, color, transparent: true, opacity, blending, depthWrite: false }));
        sp.renderOrder = order;
        scene.add(sp);
        return sp;
      };
      return {
        oval: make(ovalTex, THREE.NormalBlending, 0.16),
      };
    };
    // places a pale oval shadow below an object (world units)
    const placeLights = (lights, x, top, bottom, z, w, opacity) => {
      lights.oval.position.set(x, bottom - w * 0.35, z - 0.3);
      lights.oval.scale.set(w * 2.6, w * 0.7, 1);
      lights.oval.material.opacity = 0.17 * opacity;
    };

    // three layers: near edges (bigger), mid (smaller, nearer the centre),
    // centre (smallest, far back). Different speeds and phases so nothing
    // travels in a queue; k = how much each layer follows the scroll.
    const SLOT_SCALE = small ? 0.6 : 1;
    // one blob (left edge) and one jelly (right edge): every section shows
    // exactly one of each; they hover in place instead of leaving the screen
    const SLOTS = {
      blobs: [
        { x: 'left', y: 0.42, z: 1, size: 175, period: 26, phase: 0.05, k: 0.55, dim: 0.7 },
      ],
      jellies: [
        { x: 'right', y: 0.36, z: -1, size: 85, period: 34, phase: 0.55, k: 0.5, dim: 0.7 },
      ],
    };
    const slotX = (slot, sizePx, extent) => {
      if (slot.x === 'left' || slot.x === 'right') {
        // edge: the inner rim may reach ~16px into the content column
        const inset = Math.min(edge + 16 - sizePx * extent, edge / 2);
        return slot.x === 'left' ? inset : vw - inset;
      }
      return slot.x * vw;
    };
    // vertical: slow drift around its own height in the viewport; a scroll
    // flick nudges it (k) and it eases back
    const slotY = (slot) =>
      vh * slot.y + Math.sin((t / slot.period + slot.phase) * Math.PI * 2) * vh * 0.12 - tilt * 160 * slot.k;

    const blobs = SLOTS.blobs.map((slot, i) => {
      const [a, b] = palettes[(i * 2) % palettes.length];
      const mesh = new THREE.Mesh(geometry, makeBlobMaterial(a, b, i * 3.7));
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: haloTex, color: a, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      halo.renderOrder = Math.round(slot.z * 10) - 1;
      scene.add(halo);
      mesh.userData = {
        slot,
        z: slot.z,
        radiusPx: slot.size * SLOT_SCALE,
        halo,
        lights: lightSprites(a, Math.round(slot.z * 10) - 2),
        spin: new THREE.Vector3(rand(-0.2, 0.2), rand(-0.3, 0.3), rand(-0.1, 0.1)),
        bob: rand(0, Math.PI * 2),
        pointer: 0,
        appear: 0, // fades in on its first appearance
      };
      mesh.material.uniforms.uHaze.value = (1 - depthK(slot.z)) * 0.55;
      mesh.renderOrder = Math.round(slot.z * 10); // far first
      scene.add(mesh);
      return mesh;
    });

    /* ---------- jellyfish ---------- */
    const glowTexture = (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const g = c.getContext('2d');
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.35, 'rgba(255,255,255,0.35)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();
    const makeGlow = (color, size, opacity) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture, color, transparent: true, opacity,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      s.scale.setScalar(size);
      s.userData.baseOpacity = opacity;
      return s;
    };

    const JELLY_TENTACLES = 10;
    const TENT_POINTS = 28;
    const ARM_POINTS = 22;
    const jellies = [];

    const makeJelly = (i, target = scene) => {
      const group = new THREE.Group();
      const hue = ['#5ccfe6', '#9d8cff', '#39ff9c', '#ff8ac6', '#7fe3f0'][i % 5];
      const hue2 = ['#9d8cff', '#ff8ac6', '#5ccfe6', '#ffd36b', '#b69cff'][i % 5];
      const bellMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(hue) },
          uColor2: { value: new THREE.Color(hue2) },
          uFlash: { value: 0 },
          uFade: { value: 1 },
        },
        vertexShader: /* glsl */ `
          uniform float uTime;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          varying float vY;
          varying float vAngle;
          void main() {
            vec3 pos = position;
            float angle = atan(position.z, position.x);
            float pulse = sin(uTime * 2.2);
            // swimming pulse: the bell squeezes and the wave runs down its skirt
            pos.xz *= 1.0 + 0.14 * sin(uTime * 2.2 - (1.0 - pos.y) * 2.5);
            // scalloped, slightly ruffled skirt edge
            float skirt = 1.0 - smoothstep(0.0, 0.35, position.y);
            pos.xz *= 1.0 + skirt * (0.05 * sin(angle * 16.0) + 0.03 * sin(angle * 5.0 + uTime * 1.5));
            pos.y -= skirt * 0.06 * sin(angle * 8.0 + uTime * 2.0);
            pos.y *= 1.0 - 0.12 * pulse;
            vY = position.y;
            vAngle = angle;
            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            vViewDir = -mv.xyz;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform vec3 uColor2;
          uniform float uFlash;
          uniform float uFade;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          varying float vY;
          varying float vAngle;
          void main() {
            float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), 2.0);
            float core = smoothstep(0.0, 1.0, vY) * 0.22;
            float ribs = pow(abs(sin(vAngle * 4.0)), 14.0) * smoothstep(0.05, 0.6, vY);     // 8 radial canals
            float gonads = smoothstep(0.5, 0.8, vY) * pow(abs(cos(vAngle * 2.0)), 6.0);       // 4-leaf glow on top
            float edge = 1.0 - smoothstep(0.0, 0.12, vY);                                     // bright rim line
            vec3 col = uColor * (rim * 0.85 + core + edge * 0.6)
                     + uColor2 * ribs * 0.55
                     + vec3(1.0, 0.85, 0.95) * gonads * 0.45
                     + vec3(0.8, 0.95, 1.0) * uFlash * (0.35 + rim);
            float a = rim * 0.7 + core + ribs * 0.4 + gonads * 0.4 + edge * 0.4 + uFlash * 0.4;
            col *= 0.7; // jellies sit 30% darker than the blobs
            gl_FragColor = vec4(col, a * uFade);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      });
      const bell = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 24, 0, Math.PI * 2, 0, Math.PI * 0.55), bellMat);
      group.add(bell);
      const glow = makeGlow(new THREE.Color(hue).multiplyScalar(0.7), 3.4, 0.28);
      glow.position.y = 0.35;
      group.add(glow);

      // long thin tentacles from the rim
      const tentMat = new THREE.LineBasicMaterial({ color: new THREE.Color(hue).multiplyScalar(0.7), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
      const tentacles = [];
      for (let k = 0; k < JELLY_TENTACLES; k++) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TENT_POINTS * 3), 3));
        const line = new THREE.Line(geo, tentMat);
        line.frustumCulled = false;
        group.add(line);
        tentacles.push({ line, angle: (k / JELLY_TENTACLES) * Math.PI * 2 + rand(-0.15, 0.15), len: rand(2.4, 4.4), phase: rand(0, 6), r: 0.86 });
      }
      // four frilly oral arms from the centre: three close lines each read as a ribbon
      const armMat = new THREE.LineBasicMaterial({ color: new THREE.Color(hue2).multiplyScalar(0.7), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
      const arms = [];
      for (let k = 0; k < 4; k++) {
        for (let s = 0; s < 3; s++) {
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ARM_POINTS * 3), 3));
          const line = new THREE.Line(geo, armMat);
          line.frustumCulled = false;
          group.add(line);
          arms.push({ line, angle: (k / 4) * Math.PI * 2 + 0.4, len: rand(1.5, 2.2), phase: k * 1.7, off: (s - 1) * 0.06, r: 0.22 });
        }
      }

      group.renderOrder = 100;
      target.add(group);
      return {
        group, bellMat, glow, tentMat, armMat, tentacles, arms,
        z: Z_FAR + (Z_NEAR - 2 - Z_FAR) * Math.pow(Math.random(), 1.4),
        side: i % 2 ? -1 : 1,
        sizePx: small ? rand(28, 46) : rand(40, 95),
        period: rand(30, 48),          // seconds to rise through the viewport
        offset: i / 5 + rand(0, 0.15), // stagger along the cycle
        swim: rand(0, 6),
      };
    };
    SLOTS.jellies.forEach((slot, i) => {
      const j = makeJelly(i * 2);
      Object.assign(j, {
        slot,
        z: slot.z,
        sizePx: slot.size * SLOT_SCALE,
        lights: lightSprites('#cfefff', Math.round(slot.z * 10) - 2),
        appear: 0,
      });
      jellies.push(j);
    });

    /* ---------- section guests: a few small, far-back blobs and jellies in
       the middle of Stats, Services and Portfolio; they ride with their section
       (x, y = share of the section box, size in px) ---------- */
    const GUESTS = [
      { sel: '#stats', kind: 'jelly', x: 0.29, y: 0.15, z: -4, size: 30 },
      { sel: '#stats', kind: 'jelly', x: 0.71, y: 0.17, z: -5, size: 24 },
      { sel: '#services', kind: 'blob', x: 0.42, y: 0.32, z: -13, size: 38, pal: 1 },
      { sel: '#services', kind: 'blob', x: 0.6, y: 0.66, z: -15, size: 28, pal: 4 },
      { sel: '#services', kind: 'jelly', x: 0.54, y: 0.18, z: -9, size: 26 },
      { sel: '#services', kind: 'jelly', x: 0.4, y: 0.58, z: -11, size: 20 },
      { sel: '#portfolio', kind: 'jelly', x: 0.36, y: 0.48, z: -9, size: 26 },
      { sel: '#portfolio', kind: 'jelly', x: 0.63, y: 0.89, z: -11, size: 20 },
    ].map((g, i) => {
      g.section = document.querySelector(g.sel);
      g.bob = rand(0, Math.PI * 2);
      g.appear = 0;
      if (g.kind === 'blob') {
        const [a, b] = palettes[g.pal];
        g.mesh = new THREE.Mesh(geometry, makeBlobMaterial(a, b, 40 + i * 2.3));
        g.mesh.material.uniforms.uHaze.value = (1 - depthK(g.z)) * 0.55;
        g.mesh.renderOrder = Math.round(g.z * 10);
        scene.add(g.mesh);
      } else {
        g.jelly = makeJelly(i + 1);
        g.mesh = g.jelly.group;
      }
      g.mesh.visible = false;
      return g;
    }).filter(g => g.section);



    /* ---------- under the phones: own small canvas inside #content-stream ---------- */
    const stream = document.querySelector('#content-stream');
    const under = stream ? (() => {
      const cvs = document.createElement('canvas');
      cvs.className = 'stream-depth';
      cvs.setAttribute('aria-hidden', 'true');
      stream.prepend(cvs);
      const r = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true, powerPreference: 'low-power' });
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
      r.setClearColor(0x000000, 0);
      const sc = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      cam.position.set(0, 0, CAM_Z);
      const jelly = makeJelly(1, sc);
      jelly.z = -6;
      const bl = [['#ff8ac6', '#ffd36b', 0.58, 0.2, -10]].map(([a, b, x, y, z], i) => {
        const m = new THREE.Mesh(geometry, makeBlobMaterial(a, b, 20 + i * 5));
        m.userData = { x, y, z };
        m.material.uniforms.uOpacity.value = 0.55;
        m.material.uniforms.uHaze.value = 0.35;
        sc.add(m);
        return m;
      });
      let visible = false;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(stream);
      }
      const size = () => {
        const w = stream.clientWidth;
        const h = stream.clientHeight;
        r.setSize(w, h, false);
        cam.aspect = w / h;
        cam.updateProjectionMatrix();
      };
      size();
      window.addEventListener('resize', size, { passive: true });
      return {
        render(t, dt) {
          if (!visible) return;
          const hh = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
          // jelly drifts slowly up behind the phones
          const jz = jelly.z;
          const jh = hh * (CAM_Z - jz);
          const cyc = (t / 40) % 1;
          jelly.group.position.set(-0.15 * jh * cam.aspect + Math.sin(t * 0.3) * 0.4, -jh * 1.3 + cyc * jh * 2.8, jz);
          jelly.group.scale.setScalar(jh * 0.16);
          jelly.bellMat.uniforms.uTime.value = t;
          jelly.bellMat.uniforms.uFade.value = 0.8;
          jelly.tentMat.opacity = 0.4;
          jelly.armMat.opacity = 0.45;
          jelly.glow.material.opacity = 0.25;
          const pulse = Math.sin(t * 2.2);
          [...jelly.tentacles, ...jelly.arms].forEach((strand) => {
            const arr = strand.line.geometry.attributes.position.array;
            const n = arr.length / 3;
            const r0 = strand.r * (1 + 0.12 * pulse);
            for (let p = 0; p < n; p++) {
              const f = p / (n - 1);
              const wave = Math.sin(f * 7 - t * 2.6 + strand.phase) * 0.28 * f;
              const rr = r0 * (1 - f * 0.55) + (strand.off || 0);
              arr[p * 3] = Math.cos(strand.angle) * rr + wave * Math.cos(strand.angle + 1.57);
              arr[p * 3 + 1] = -f * strand.len;
              arr[p * 3 + 2] = Math.sin(strand.angle) * rr + wave * Math.sin(strand.angle + 1.57);
            }
            strand.line.geometry.attributes.position.needsUpdate = true;
          });
          for (const m of bl) {
            const h = hh * (CAM_Z - m.userData.z);
            m.position.set(m.userData.x * h * cam.aspect + Math.sin(t * 0.2 + m.userData.z) * 0.6,
              m.userData.y * h + Math.cos(t * 0.25 + m.userData.z) * 0.5, m.userData.z);
            m.scale.setScalar(h * 0.32);
            m.rotation.y += dt * 0.15;
            m.material.uniforms.uTime.value = t;
          }
          r.render(sc, cam);
        },
      };
    })() : null;

    const offerSection = document.querySelector('#what-we-offer');

    /* ---------- input ---------- */
    let pointerPx = null; // null = no mouse over the page
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse') pointerPx = { x: e.clientX, y: e.clientY };
    }, { passive: true });
    document.addEventListener('pointerleave', () => { pointerPx = null; });
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('load', measure, { once: true });
    if ('ResizeObserver' in window) new ResizeObserver(() => { docH = document.documentElement.scrollHeight; }).observe(document.body);

    const clock = new THREE.Clock();
    let t = 0;
    let smoothScroll = window.scrollY;
    let lastScroll = window.scrollY;
    let tilt = 0;
    let gate = 0;
    let guestGate = 0;

    // pulse, tentacle swim and a soft glow pulse of one jelly (fade = 0..1)
    const animateJelly = (j, fade) => {
      // no flicker: the inner light swells and fades slowly (~7s), never flashes
      const flash = 0.35 * Math.pow(0.5 + 0.5 * Math.sin(t * 0.9 + j.swim * 2.1), 2);
      j.bellMat.uniforms.uTime.value = t + j.swim;
      j.bellMat.uniforms.uFlash.value = flash;
      j.bellMat.uniforms.uFade.value = fade;
      j.tentMat.opacity = (0.42 + flash * 0.58) * fade;
      j.armMat.opacity = (0.5 + flash * 0.4) * fade;
      j.glow.material.opacity = (j.glow.userData.baseOpacity + flash * 0.5) * fade;

      // tentacles and oral arms trail below the bell, waving with the swim pulse
      const pulse = Math.sin((t + j.swim) * 2.2);
      const wavy = (strand, amp, freq) => {
        const arr = strand.line.geometry.attributes.position.array;
        const n = arr.length / 3;
        const r0 = strand.r * (1 + 0.12 * pulse);
        for (let p = 0; p < n; p++) {
          const f = p / (n - 1);
          const wave = Math.sin(f * freq - (t + j.swim) * 2.6 + strand.phase) * amp * f;
          const rr = r0 * (1 - f * 0.55) + (strand.off || 0);
          arr[p * 3] = Math.cos(strand.angle) * rr + wave * Math.cos(strand.angle + 1.57);
          arr[p * 3 + 1] = -f * strand.len * (1 + 0.08 * pulse);
          arr[p * 3 + 2] = Math.sin(strand.angle) * rr + wave * Math.sin(strand.angle + 1.57);
        }
        strand.line.geometry.attributes.position.needsUpdate = true;
      };
      j.tentacles.forEach(tn => wavy(tn, 0.25, 7));
      j.arms.forEach(arm => wavy(arm, 0.38, 11)); // frillier
    };

    const frame = () => {
      requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (document.hidden) return;
      t += dt;

      // Lenis already smooths the page; a little extra easing keeps trackpad flicks silky
      smoothScroll += (window.scrollY - smoothScroll) * 0.06; // long, drawn-out follow
      const velocity = smoothScroll - lastScroll;
      lastScroll = smoothScroll;
      tilt += (THREE.MathUtils.clamp(velocity * 0.012, -0.6, 0.6) - tilt) * 0.03;

      if (under) under.render(t, dt);

      // edge blob + jelly: nothing above Portfolio, they fade in once its title
      // passes the middle of the screen; everything fades out again while
      // What we offer (with its own planet scene) fills the screen
      let offerFade = 1;
      if (offerSection) {
        const r = offerSection.getBoundingClientRect();
        const cover = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / vh;
        offerFade = 1 - THREE.MathUtils.clamp(cover * 1.6, 0, 1);
      }
      const target = THREE.MathUtils.clamp((smoothScroll + vh * 0.5 - startY) / (vh * 0.4), 0, 1) * offerFade;
      gate += (target - gate) * 0.03;
      guestGate += (offerFade - guestGate) * 0.03;
      // the section guests (Stats, Portfolio, Services) have their own gate
      const guestsNear = GUESTS.some((g) => {
        const r = g.section.getBoundingClientRect();
        return r.bottom > -vh * 0.2 && r.top < vh * 1.2;
      });
      // nothing to draw -> the layer is simply hidden
      const hidden = gate < 0.003 && !guestsNear;
      if (canvas.hidden !== hidden) canvas.hidden = hidden;
      if (hidden) return;

      lightDir.set(Math.sin(t * 0.15) * 0.8, 0.8, 0.7).normalize();

      for (const m of blobs) {
        const d = m.userData;
        const rPx = d.radiusPx;
        const yPx = slotY(d.slot);
        const xPx = slotX(d.slot, rPx, 1) + Math.sin(t * 0.3 + d.bob) * 12;
        const onScreen = yPx > -rPx * 1.3 && yPx < vh + rPx * 1.6;
        // smooth first appearance (about 3s), then it stays
        if (onScreen) d.appear = Math.min(d.appear + dt / 3, 1);
        const fade = gate * d.appear * d.appear * (3 - 2 * d.appear);
        m.visible = d.halo.visible = d.lights.oval.visible = onScreen;
        if (!onScreen) continue;
        toWorld(xPx, yPx + Math.cos(t * 0.25 + d.bob) * 14, d.z, m.position);
        const rWorld = rPx / pxPerUnit(d.z);
        m.scale.setScalar(rWorld * (1 + Math.sin(t * 0.5 + d.bob) * 0.05));
        d.halo.position.copy(m.position);
        d.halo.scale.setScalar(rWorld * 3.2);
        d.halo.material.opacity = (0.12 + depthK(d.z) * 0.22) * fade * d.slot.dim;
        placeLights(d.lights, m.position.x, m.position.y + rWorld, m.position.y - rWorld, d.z, rWorld, fade);
        m.rotation.x += d.spin.x * dt + tilt * 0.03;
        m.rotation.y += d.spin.y * dt;
        m.rotation.z = tilt * d.slot.k;

        // cursor smear (no fleeing): strength eases in when the mouse is over the blob
        const u = m.material.uniforms;
        let over = 0;
        if (pointerPx) {
          const dist = Math.hypot(pointerPx.x - xPx, pointerPx.y - yPx);
          // (the far, small centre blobs react too)
          over = dist < rPx * 1.15 ? 1 : 0;
          toWorld(pointerPx.x, pointerPx.y, d.z, u.uPointer.value);
        }
        d.pointer += (over - d.pointer) * 0.08;
        u.uPointerAmt.value = d.pointer;
        u.uRadius.value = rWorld * 0.75;
        u.uTime.value = t;
        u.uOpacity.value = (0.35 + depthK(d.z) * 0.57) * fade * d.slot.dim;
      }

      for (const j of jellies) {
        const sizePx = j.sizePx;
        const sizeWorld = sizePx / pxPerUnit(j.z);
        // bell on top, tentacles hang ~4.5 sizes below
        const yPx = slotY(j.slot);
        const xPx = slotX(j.slot, sizePx, 1.1) + Math.sin(t * 0.4 + j.swim) * 10;
        const onScreen = yPx > -sizePx * 5 && yPx < vh + sizePx * 1.2;
        if (onScreen) j.appear = Math.min(j.appear + dt / 3, 1);
        const fade = gate * j.appear * j.appear * (3 - 2 * j.appear) * j.slot.dim;
        j.group.visible = j.lights.oval.visible = onScreen;
        if (!onScreen) continue;
        toWorld(xPx, yPx, j.z, j.group.position);
        j.group.scale.setScalar(sizeWorld);
        j.group.rotation.z = Math.sin(t * 0.5 + j.swim) * 0.15 - tilt * 0.4;
        placeLights(j.lights, j.group.position.x, j.group.position.y + sizeWorld, j.group.position.y - sizeWorld * 4.6, j.z, sizeWorld * 1.1, fade);

        animateJelly(j, fade);
      }

      for (const g of GUESTS) {
        const r = g.section.getBoundingClientRect();
        const sizePx = small ? g.size * 0.7 : g.size;
        const xPx = r.left + r.width * g.x + Math.sin(t * 0.25 + g.bob) * 18;
        const yPx = r.top + r.height * g.y + Math.cos(t * 0.2 + g.bob) * 14;
        const onScreen = yPx > -sizePx * 5 && yPx < vh + sizePx * 2;
        if (onScreen) g.appear = Math.min(g.appear + dt / 3, 1);
        const fade = guestGate * g.appear * g.appear * (3 - 2 * g.appear);
        g.mesh.visible = onScreen;
        if (!onScreen) continue;
        toWorld(xPx, yPx, g.z, g.mesh.position);
        const sizeWorld = sizePx / pxPerUnit(g.z);
        g.mesh.scale.setScalar(sizeWorld);
        if (g.jelly) {
          g.mesh.rotation.z = Math.sin(t * 0.5 + g.bob) * 0.15;
          animateJelly(g.jelly, fade * 0.55); // small background jellies: dimmer
        } else {
          g.mesh.rotation.y += dt * 0.15;
          const u = g.mesh.material.uniforms;
          u.uTime.value = t;
          u.uOpacity.value = (0.35 + depthK(g.z) * 0.57) * fade;
        }
      }

      renderer.render(scene, camera);
    };
    requestAnimationFrame(frame);
  }

  const start = () => {
    initOfferScene();
    initFloatingBlobs();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
