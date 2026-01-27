// sw.js (GitHub Pages / static HTML)
const CACHE_VERSION = "v1";          // ПІДНІМАЙ при релізі
const STATIC_CACHE = `static-${CACHE_VERSION}`;

// що кешуємо (картинки/стилі/скрипти/шрифти)
const CACHEABLE_PATHS = [
  /^\/assets\/img\//,
  /^\/assets\/css\//,
  /^\/assets\/js\//,
  /^\/assets\/fonts\//,
  /^\/assets\/icons\//,
];

// що НЕ кешуємо (відео + все що може бути важким/streaming)
const NEVER_CACHE_PATHS = [
  /^\/assets\/video\//,
  /\.mp4$/i,
  /\.webm$/i,
  /\.mov$/i,
  /\.m3u8$/i,
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith("static-") && k !== STATIC_CACHE)
        .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // тільки свій домен (не чіпаємо сторонні скрипти типу GTM/Clarity)
  if (url.origin !== self.location.origin) return;

  // не чіпаємо навігацію HTML (щоб не залипали сторінки)
  if (req.mode === "navigate") return;

  const path = url.pathname;

  // виключення: відео/стрімінг/важкі формати
  if (NEVER_CACHE_PATHS.some((re) => re.test(path))) return;

  // кешуємо лише потрібні каталоги
  if (!CACHEABLE_PATHS.some((re) => re.test(path))) return;

  event.respondWith(staleWhileRevalidate(req));
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((resp) => {
      if (resp && resp.ok) cache.put(request, resp.clone());
      return resp;
    })
    .catch(() => null);

  return cached || (await fetchPromise) || new Response("", { status: 504 });
}
