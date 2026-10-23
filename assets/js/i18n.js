/* =====================================================================
   SNDR STUDIO — localization: English (source), 中文, Українська,
   Deutsch, Español.

   The page is written in English; PHRASES maps each English text to its
   translations. Every text node and placeholder that matches is swapped,
   including the slider clones Swiper makes, so the language switches on
   the fly. Texts that main.js splits into words (hero subtitle, About
   lead) are re-split on the "sndr:lang" event. The marquee is rebuilt via
   window.sndrMarquee. Other scripts translate their own strings with
   window.sndrT('English text').

   Switcher: a round button next to the menu toggle (and in the tablet
   dock, main.js) opens the language list. The choice is remembered; the
   first visit follows the browser language.
   Styles: neon.css → LANGUAGE SWITCHER.
   ===================================================================== */
(function () {
  'use strict';

  const LANGS = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'zh', label: '中文', name: '中文' },
    { code: 'uk', label: 'UA', name: 'Українська' },
    { code: 'de', label: 'DE', name: 'Deutsch' },
    { code: 'es', label: 'ES', name: 'Español' },
  ];

  // English → [zh, uk, de, es]
  const PHRASES = {
    // menu + footer
    'Home': ['首页', 'Головна', 'Start', 'Inicio'],
    'About': ['关于', 'Про нас', 'Über uns', 'Nosotros'],
    'Our Works': ['作品', 'Наші роботи', 'Unsere Arbeiten', 'Nuestros trabajos'],
    'Content Stream': ['内容流', 'Контент-потік', 'Content Stream', 'Flujo de contenido'],
    'What we offer': ['我们提供', 'Що ми пропонуємо', 'Was wir bieten', 'Qué ofrecemos'],
    'Services': ['服务', 'Послуги', 'Leistungen', 'Servicios'],
    'Testimonials': ['客户评价', 'Відгуки', 'Referenzen', 'Testimonios'],
    'Contact': ['联系', 'Контакти', 'Kontakt', 'Contacto'],
    'Copyright': ['版权所有', 'Усі права захищено', 'Alle Rechte vorbehalten', 'Todos los derechos reservados'],

    // hero
    'Motion with intention. Code with connection.': [
      '有意图的动态，有连接的代码。',
      'Рух із наміром. Код зі зв’язком.',
      'Bewegung mit Absicht. Code mit Verbindung.',
      'Movimiento con intención. Código con conexión.',
    ],

    // about
    '01 — About the studio': ['01 — 关于工作室', '01 — Про студію', '01 — Über das Studio', '01 — Sobre el estudio'],
    'SNDR / Independent creative practice': ['SNDR / 独立创意工作室', 'SNDR / Незалежна креативна практика', 'SNDR / Unabhängige Kreativpraxis', 'SNDR / Práctica creativa independiente'],
    'SNDR is an independent creative studio for motion, digital design, AI-generated content and interactive experiences.': [
      'SNDR 是一家独立创意工作室，专注于动态设计、数字设计、AI 生成内容和互动体验。',
      'SNDR — незалежна креативна студія моушну, цифрового дизайну, AI-контенту та інтерактивних досвідів.',
      'SNDR ist ein unabhängiges Kreativstudio für Motion, digitales Design, KI-generierte Inhalte und interaktive Erlebnisse.',
      'SNDR es un estudio creativo independiente de motion, diseño digital, contenido generado con IA y experiencias interactivas.',
    ],
    'Founded by Alex Savo, SNDR began as a freelance practice in web development and evolved into a multidisciplinary studio. We create visual content for YouTube, TikTok and social platforms, develop characters and visual identities, and build web experiences that feel alive.': [
      'SNDR 由 Alex Savo 创立，最初是一名自由职业的网页开发者，后来发展成为一家多学科工作室。我们为 YouTube、TikTok 和社交平台创作视觉内容，设计角色与视觉识别，并打造充满生命力的网页体验。',
      'SNDR заснував Алекс Саво: студія почалася як фриланс у веброзробці й виросла в мультидисциплінарну команду. Ми створюємо візуальний контент для YouTube, TikTok і соцмереж, розробляємо персонажів і візуальну айдентику та будуємо живі вебдосвіди.',
      'Gegründet von Alex Savo, begann SNDR als freiberufliche Webentwicklung und wuchs zu einem multidisziplinären Studio. Wir gestalten visuelle Inhalte für YouTube, TikTok und soziale Plattformen, entwickeln Figuren und visuelle Identitäten und bauen Web-Erlebnisse, die lebendig wirken.',
      'Fundado por Alex Savo, SNDR empezó como práctica freelance de desarrollo web y se convirtió en un estudio multidisciplinar. Creamos contenido visual para YouTube, TikTok y redes sociales, diseñamos personajes e identidades visuales y construimos experiencias web que se sienten vivas.',
    ],
    'Based in Europe. Working worldwide.': ['立足欧洲，服务全球。', 'Базуємося в Європі. Працюємо по всьому світу.', 'Mit Sitz in Europa. Weltweit tätig.', 'Con base en Europa. Trabajamos en todo el mundo.'],
    'Europe / Worldwide': ['欧洲 / 全球', 'Європа / Весь світ', 'Europa / Weltweit', 'Europa / Todo el mundo'],
    'Founder / 01': ['创始人 / 01', 'Засновник / 01', 'Gründer / 01', 'Fundador / 01'],
    'Founder / Motion designer / Creative developer': ['创始人 / 动态设计师 / 创意开发者', 'Засновник / Моушн-дизайнер / Креативний розробник', 'Gründer / Motion Designer / Creative Developer', 'Fundador / Motion designer / Desarrollador creativo'],
    'Motion design': ['动态设计', 'Моушн-дизайн', 'Motion Design', 'Motion design'],
    'Web development': ['网页开发', 'Веброзробка', 'Webentwicklung', 'Desarrollo web'],
    'Generative AI': ['生成式 AI', 'Генеративний AI', 'Generative KI', 'IA generativa'],
    '3D / Comfy UI': ['3D / Comfy UI', '3D / Comfy UI', '3D / Comfy UI', '3D / Comfy UI'],
    'Visual content': ['视觉内容', 'Візуальний контент', 'Visuelle Inhalte', 'Contenido visual'],

    // stats
    'Happy Clients': ['满意客户', 'Задоволених клієнтів', 'Zufriedene Kunden', 'Clientes felices'],
    'Projects': ['项目', 'Проєктів', 'Projekte', 'Proyectos'],
    'Hours Of Support': ['小时支持', 'Годин підтримки', 'Stunden Support', 'Horas de soporte'],
    'Hard Workers': ['团队成员', 'Працьовитих людей', 'Fleißige Köpfe', 'Personas en el equipo'],

    // portfolio
    '02 — Selected work': ['02 — 精选作品', '02 — Вибрані роботи', '02 — Ausgewählte Arbeiten', '02 — Trabajos seleccionados'],
    'Portfolio': ['作品集', 'Портфоліо', 'Portfolio', 'Portafolio'],
    "This section features some of the projects I've worked on over the past few years. It includes examples of websites, animations, and design work created for different clients and purposes. I always try to make each project clear, well-structured, and focused on helping clients achieve their real goals. My aim is to create results that look modern while staying functional and easy to use. In my work, I combine design, development, and motion to build cohesive visuals that feel balanced and engaging.": [
      '这里展示了我近几年参与的部分项目，包括为不同客户和用途打造的网站、动画和设计作品。我始终力求让每个项目清晰、有条理，并真正帮助客户实现目标。我的目标是做出既现代又实用、易于使用的成果。在工作中，我将设计、开发与动态结合，打造协调而引人入胜的视觉效果。',
      'Тут зібрані проєкти, над якими я працював останні роки: сайти, анімації та дизайн для різних клієнтів і задач. Я завжди прагну, щоб кожен проєкт був зрозумілим, добре структурованим і допомагав клієнтам досягати реальних цілей. Моя мета — сучасний результат, який залишається функціональним і зручним. У роботі я поєдную дизайн, розробку та моушн, щоб створювати цілісні, збалансовані й захопливі візуали.',
      'Hier zeige ich einige Projekte der letzten Jahre: Websites, Animationen und Designarbeiten für unterschiedliche Kunden und Zwecke. Jedes Projekt soll klar, gut strukturiert und auf die echten Ziele der Kunden ausgerichtet sein. Mein Anspruch sind Ergebnisse, die modern aussehen und dabei funktional und einfach zu bedienen bleiben. Ich verbinde Design, Entwicklung und Motion zu stimmigen, ausgewogenen und packenden Visuals.',
      'Aquí reúno algunos de los proyectos de los últimos años: sitios web, animaciones y trabajos de diseño para distintos clientes y fines. Siempre busco que cada proyecto sea claro, bien estructurado y ayude a los clientes a lograr sus objetivos reales. Mi meta es crear resultados modernos que sigan siendo funcionales y fáciles de usar. Combino diseño, desarrollo y motion para construir visuales coherentes, equilibrados y atractivos.',
    ],
    'All': ['全部', 'Усі', 'Alle', 'Todo'],
    'Animations': ['动画', 'Анімації', 'Animationen', 'Animaciones'],
    'Websites': ['网站', 'Сайти', 'Websites', 'Sitios web'],
    'Tap. Swipe. Grow.': ['点一点，划一划，成长。', 'Тап. Свайп. Ріст.', 'Tippen. Wischen. Wachsen.', 'Toca. Desliza. Crece.'],
    'Mega Jackpot': ['超级大奖', 'Мега-джекпот', 'Mega-Jackpot', 'Megabote'],
    'Order. Track. Enjoy.': ['下单，追踪，享用。', 'Замов. Відстеж. Насолоджуйся.', 'Bestellen. Verfolgen. Genießen.', 'Pide. Sigue. Disfruta.'],
    'Glow Serum': ['焕亮精华', 'Сироватка Glow', 'Glow-Serum', 'Sérum Glow'],
    'Family Locator': ['家人定位', 'Сімейний локатор', 'Familien-Ortung', 'Localizador familiar'],
    'New Episode': ['新一集', 'Новий випуск', 'Neue Folge', 'Nuevo episodio'],
    'AI World News': ['AI 世界新闻', 'Новини світу AI', 'KI-Weltnachrichten', 'Noticias del mundo IA'],
    'Mobile app launch spot': ['移动应用上线广告', 'Ролик запуску застосунку', 'Spot zum App-Launch', 'Spot de lanzamiento de app'],
    'Casino bonus promo': ['娱乐场奖励推广', 'Промо бонусу казино', 'Casino-Bonus-Promo', 'Promo de bono de casino'],
    'Food delivery ad': ['外卖广告', 'Реклама доставки їжі', 'Werbung für Essenslieferung', 'Anuncio de comida a domicilio'],
    'Cosmetics product ad': ['化妆品广告', 'Реклама косметики', 'Kosmetik-Werbung', 'Anuncio de cosmética'],
    'Geo search service promo': ['定位服务推广', 'Промо геосервісу', 'Promo für Ortungsdienst', 'Promo de servicio de geolocalización'],
    'YouTube channel promo': ['YouTube 频道推广', 'Промо YouTube-каналу', 'YouTube-Kanal-Promo', 'Promo de canal de YouTube'],
    'News digest promo': ['新闻摘要推广', 'Промо дайджесту новин', 'Newsdigest-Promo', 'Promo de resumen de noticias'],

    // content stream
    '03 — Content stream': ['03 — 内容流', '03 — Контент-потік', '03 — Content Stream', '03 — Flujo de contenido'],
    'Seamless flow of vertical content across platforms': ['跨平台的竖屏内容无缝流', 'Безперервний потік вертикального контенту на всіх платформах', 'Ein nahtloser Strom vertikaler Inhalte über alle Plattformen', 'Un flujo continuo de contenido vertical en todas las plataformas'],

    // what we offer
    '04 — What we offer': ['04 — 我们提供', '04 — Що ми пропонуємо', '04 — Was wir bieten', '04 — Qué ofrecemos'],
    'Motion, 3D, code and AI under one roof — open any direction to see what it covers.': [
      '动态、3D、代码与 AI 一站式完成——展开任一方向查看详情。',
      'Моушн, 3D, код і AI під одним дахом — відкрийте будь-який напрям, щоб побачити, що він охоплює.',
      'Motion, 3D, Code und KI unter einem Dach — öffnen Sie eine Richtung, um zu sehen, was sie umfasst.',
      'Motion, 3D, código e IA bajo un mismo techo: abre cualquier área para ver lo que incluye.',
    ],
    'Motion Design': ['动态设计', 'Моушн-дизайн', 'Motion Design', 'Motion Design'],
    '3D & CGI': ['3D 与 CGI', '3D і CGI', '3D & CGI', '3D y CGI'],
    'Web Development': ['网页开发', 'Веброзробка', 'Webentwicklung', 'Desarrollo web'],
    'UI / UX Motion': ['UI / UX 动效', 'UI / UX моушн', 'UI / UX Motion', 'Motion UI / UX'],
    'Creative Coding': ['创意编程', 'Креативне програмування', 'Creative Coding', 'Programación creativa'],
    'Social Media': ['社交媒体', 'Соцмережі', 'Social Media', 'Redes sociales'],
    'AI Visuals': ['AI 视觉', 'AI-візуали', 'KI-Visuals', 'Visuales con IA'],
    'We bring ideas to life through dynamic visuals, fluid transitions, and expressive animation. Every frame is crafted to capture attention and communicate with impact.': [
      '我们用动感的画面、流畅的转场和富有表现力的动画让创意鲜活起来。每一帧都精心打磨，吸引目光，传递力量。',
      'Ми оживлюємо ідеї динамічними візуалами, плавними переходами й виразною анімацією. Кожен кадр зроблений так, щоб захопити увагу й сильно донести думку.',
      'Wir erwecken Ideen mit dynamischen Visuals, fließenden Übergängen und ausdrucksstarker Animation zum Leben. Jedes Bild ist darauf ausgelegt, Aufmerksamkeit zu fesseln und mit Wirkung zu kommunizieren.',
      'Damos vida a las ideas con visuales dinámicos, transiciones fluidas y animación expresiva. Cada fotograma está pensado para captar la atención y comunicar con fuerza.',
    ],
    'We create immersive 3D visuals, photorealistic renders, and cinematic simulations. From product visualization to abstract worlds, we turn concepts into striking imagery.': [
      '我们创作沉浸式 3D 视觉、照片级渲染和电影级模拟。从产品可视化到抽象世界，我们把概念变成震撼的画面。',
      'Ми створюємо занурювальні 3D-візуали, фотореалістичні рендери й кінематографічні симуляції. Від візуалізації продукту до абстрактних світів — перетворюємо концепції на яскраві образи.',
      'Wir schaffen immersive 3D-Visuals, fotorealistische Renderings und filmische Simulationen. Von der Produktvisualisierung bis zu abstrakten Welten verwandeln wir Konzepte in eindrucksvolle Bilder.',
      'Creamos visuales 3D inmersivos, renders fotorrealistas y simulaciones cinematográficas. De la visualización de producto a mundos abstractos, convertimos conceptos en imágenes impactantes.',
    ],
    'We build modern, responsive websites that combine clean code with bold visual design. Every detail is optimized for performance, usability, and a seamless user experience.': [
      '我们打造现代、响应式的网站，将简洁代码与大胆的视觉设计结合。每个细节都为性能、易用性和流畅体验而优化。',
      'Ми створюємо сучасні адаптивні сайти, що поєднують чистий код зі сміливим візуальним дизайном. Кожна деталь оптимізована для швидкості, зручності та безшовного досвіду.',
      'Wir bauen moderne, responsive Websites, die sauberen Code mit mutigem visuellem Design verbinden. Jedes Detail ist auf Performance, Bedienbarkeit und ein nahtloses Nutzererlebnis optimiert.',
      'Construimos sitios web modernos y adaptables que unen código limpio con un diseño visual audaz. Cada detalle está optimizado para el rendimiento, la usabilidad y una experiencia fluida.',
    ],
    'We design purposeful animations that make digital interfaces feel intuitive and alive. Smooth transitions and micro-interactions guide users and enhance every interaction.': [
      '我们设计有目的的动画，让数字界面直观又生动。顺滑的转场与微交互引导用户，提升每一次互动。',
      'Ми проєктуємо осмислені анімації, з якими цифрові інтерфейси стають інтуїтивними й живими. Плавні переходи та мікровзаємодії ведуть користувача й покращують кожну дію.',
      'Wir gestalten zielgerichtete Animationen, durch die digitale Oberflächen intuitiv und lebendig wirken. Weiche Übergänge und Mikrointeraktionen führen Nutzer und werten jede Interaktion auf.',
      'Diseñamos animaciones con propósito que hacen que las interfaces digitales se sientan intuitivas y vivas. Transiciones suaves y microinteracciones guían al usuario y mejoran cada interacción.',
    ],
    'We blend code, design, and experimentation to create interactive digital experiences. From generative visuals to custom web effects, we push creative boundaries through technology.': [
      '我们融合代码、设计与实验，创造互动数字体验。从生成式视觉到定制网页特效，我们用技术拓展创意边界。',
      'Ми поєднуємо код, дизайн і експерименти, щоб створювати інтерактивні цифрові досвіди. Від генеративних візуалів до кастомних вебефектів — розширюємо творчі межі технологіями.',
      'Wir verbinden Code, Design und Experiment zu interaktiven digitalen Erlebnissen. Von generativen Visuals bis zu individuellen Web-Effekten erweitern wir kreative Grenzen mit Technologie.',
      'Mezclamos código, diseño y experimentación para crear experiencias digitales interactivas. De visuales generativos a efectos web a medida, ampliamos los límites creativos con tecnología.',
    ],
    'We create scroll-stopping content designed for social platforms and digital campaigns. Bold visuals, engaging motion, and platform-ready formats help brands stand out.': [
      '我们为社交平台和数字营销打造让人停下滑动的内容。大胆的视觉、吸睛的动态和适配平台的格式，让品牌脱颖而出。',
      'Ми створюємо контент, на якому зупиняється скрол, для соцмереж і digital-кампаній. Сміливі візуали, захопливий моушн і готові до платформ формати допомагають брендам виділятися.',
      'Wir erstellen Inhalte für soziale Plattformen und digitale Kampagnen, bei denen man aufhört zu scrollen. Mutige Visuals, packende Motion und plattformgerechte Formate lassen Marken herausstechen.',
      'Creamos contenido que detiene el scroll para redes sociales y campañas digitales. Visuales audaces, motion atractivo y formatos listos para cada plataforma hacen que las marcas destaquen.',
    ],
    'We combine AI tools with creative direction to produce unique visuals, cinematic scenes, and next-generation content. From concept to final frame, we transform ideas into compelling imagery.': [
      '我们将 AI 工具与创意指导结合，产出独特的视觉、电影级场景和新一代内容。从概念到最后一帧，把创意变成动人的画面。',
      'Ми поєднуємо AI-інструменти з креативною режисурою, щоб створювати унікальні візуали, кінематографічні сцени й контент нового покоління. Від концепції до фінального кадру перетворюємо ідеї на переконливі образи.',
      'Wir kombinieren KI-Werkzeuge mit kreativer Regie zu einzigartigen Visuals, filmischen Szenen und Inhalten der nächsten Generation. Vom Konzept bis zum letzten Frame machen wir Ideen zu fesselnden Bildern.',
      'Combinamos herramientas de IA con dirección creativa para producir visuales únicos, escenas cinematográficas y contenido de nueva generación. Del concepto al fotograma final, transformamos ideas en imágenes cautivadoras.',
    ],

    // services
    '05 — Services': ['05 — 服务', '05 — Послуги', '05 — Leistungen', '05 — Servicios'],
    'At our studio, we merge creativity, technology, and motion to deliver complete digital solutions. From websites and branding to motion design and social media visuals — we help brands move, connect, and grow in the digital world.': [
      '在我们的工作室，创意、技术与动态融为一体，提供完整的数字解决方案。从网站、品牌到动态设计与社交媒体视觉——我们帮助品牌在数字世界中行动、连接与成长。',
      'У нашій студії креативність, технології та моушн об’єднуються в повні цифрові рішення. Від сайтів і брендингу до моушн-дизайну й візуалів для соцмереж — ми допомагаємо брендам рухатися, єднатися та зростати в цифровому світі.',
      'In unserem Studio verbinden wir Kreativität, Technologie und Motion zu kompletten digitalen Lösungen. Von Websites und Branding bis zu Motion Design und Social-Media-Visuals helfen wir Marken, sich in der digitalen Welt zu bewegen, zu verbinden und zu wachsen.',
      'En nuestro estudio unimos creatividad, tecnología y motion para ofrecer soluciones digitales completas. De sitios web y branding a motion design y visuales para redes: ayudamos a las marcas a moverse, conectar y crecer en el mundo digital.',
    ],
    'Brand Identity': ['品牌识别', 'Айдентика бренду', 'Markenidentität', 'Identidad de marca'],
    'Social Media Content': ['社交媒体内容', 'Контент для соцмереж', 'Social-Media-Content', 'Contenido para redes'],
    'UI / UX Design': ['UI / UX 设计', 'UI / UX дизайн', 'UI / UX Design', 'Diseño UI / UX'],
    'Video Production': ['视频制作', 'Відеопродакшн', 'Videoproduktion', 'Producción de video'],
    'Clean, responsive, and scalable websites built with performance and user experience in mind. From landing pages to full-scale platforms — we turn design into functional digital spaces.': [
      '简洁、响应式、可扩展的网站，兼顾性能与用户体验。从落地页到完整平台——我们把设计变成好用的数字空间。',
      'Чисті, адаптивні й масштабовані сайти з думкою про швидкість і зручність. Від лендингів до великих платформ — перетворюємо дизайн на функціональні цифрові простори.',
      'Saubere, responsive und skalierbare Websites mit Blick auf Performance und Nutzererlebnis. Von Landingpages bis zu kompletten Plattformen machen wir Design zu funktionalen digitalen Räumen.',
      'Sitios web limpios, adaptables y escalables, pensados para el rendimiento y la experiencia de usuario. De landing pages a plataformas completas: convertimos el diseño en espacios digitales funcionales.',
    ],
    'Dynamic motion graphics, logo reveals, and brand animations that tell stories through movement. We make visuals come alive across websites, videos, and social media.': [
      '动感的动态图形、Logo 演绎和品牌动画，用运动讲故事。让视觉在网站、视频和社交媒体上鲜活起来。',
      'Динамічна моушн-графіка, анімації логотипів і бренду, що розповідають історії рухом. Оживлюємо візуали на сайтах, у відео та соцмережах.',
      'Dynamische Motion Graphics, Logo-Reveals und Markenanimationen, die Geschichten durch Bewegung erzählen. Wir lassen Visuals auf Websites, in Videos und Social Media lebendig werden.',
      'Motion graphics dinámicos, revelaciones de logo y animaciones de marca que cuentan historias con movimiento. Damos vida a los visuales en webs, videos y redes sociales.',
    ],
    'We craft unique brand systems — from logo design to visual language — ensuring consistency and recognition across all platforms.': [
      '我们打造独特的品牌体系——从 Logo 设计到视觉语言——确保在所有平台上一致且易于识别。',
      'Створюємо унікальні бренд-системи — від логотипа до візуальної мови, — щоб бренд був цілісним і впізнаваним на всіх платформах.',
      'Wir entwickeln einzigartige Markensysteme — vom Logo bis zur visuellen Sprache — für Konsistenz und Wiedererkennung auf allen Plattformen.',
      'Creamos sistemas de marca únicos, del logo al lenguaje visual, para lograr coherencia y reconocimiento en todas las plataformas.',
    ],
    'Eye-catching animations, posts, and short videos tailored for social media engagement. Designed to make your brand stand out in every scroll.': [
      '为社交媒体互动量身定制的吸睛动画、帖子和短视频，让你的品牌在每一次滑动中脱颖而出。',
      'Помітні анімації, пости й короткі відео для залучення в соцмережах. Щоб ваш бренд виділявся в кожному скролі.',
      'Auffällige Animationen, Posts und Kurzvideos für mehr Engagement in sozialen Medien. Damit Ihre Marke bei jedem Scrollen auffällt.',
      'Animaciones, publicaciones y videos cortos llamativos para generar interacción en redes. Para que tu marca destaque en cada scroll.',
    ],
    'Modern, intuitive interfaces designed to feel smooth and responsive. Every detail is tested to enhance usability and aesthetic harmony.': [
      '现代、直观的界面，流畅而灵敏。每个细节都经过测试，提升可用性与美感。',
      'Сучасні інтуїтивні інтерфейси, що відчуваються плавними й чуйними. Кожна деталь перевірена заради зручності та естетичної гармонії.',
      'Moderne, intuitive Oberflächen, die sich flüssig und reaktionsschnell anfühlen. Jedes Detail ist getestet — für bessere Bedienbarkeit und ästhetische Harmonie.',
      'Interfaces modernas e intuitivas que se sienten fluidas y ágiles. Cada detalle se prueba para mejorar la usabilidad y la armonía estética.',
    ],
    'From idea to edit — we create engaging video content that connects emotionally with your audience and strengthens your brand story.': [
      '从创意到剪辑——我们制作打动人心的视频内容，与观众建立情感连接，强化品牌故事。',
      'Від ідеї до монтажу — створюємо захопливе відео, що емоційно зв’язує вас з аудиторією та підсилює історію бренду.',
      'Von der Idee bis zum Schnitt — wir produzieren packende Videos, die Ihr Publikum emotional erreichen und Ihre Markengeschichte stärken.',
      'De la idea a la edición: creamos videos atractivos que conectan emocionalmente con tu audiencia y refuerzan la historia de tu marca.',
    ],

    // testimonials
    '06 — Testimonials': ['06 — 客户评价', '06 — Відгуки', '06 — Referenzen', '06 — Testimonios'],
    'I’m thankful for the opportunity to work with different clients and teams. Their feedback inspires me to keep developing my skills and improving the quality of my work. Every project has been a valuable experience that helped me grow and better understand what makes great collaboration.': [
      '感谢有机会与不同的客户和团队合作。他们的反馈激励我不断提升技能和工作质量。每个项目都是宝贵的经历，帮助我成长，也让我更懂得什么是出色的合作。',
      'Я вдячний за можливість працювати з різними клієнтами та командами. Їхні відгуки надихають мене розвиватися й підвищувати якість роботи. Кожен проєкт став цінним досвідом, що допоміг мені вирости й краще зрозуміти, з чого складається чудова співпраця.',
      'Ich bin dankbar, mit so unterschiedlichen Kunden und Teams arbeiten zu dürfen. Ihr Feedback spornt mich an, meine Fähigkeiten weiterzuentwickeln und die Qualität meiner Arbeit zu steigern. Jedes Projekt war eine wertvolle Erfahrung, durch die ich gewachsen bin und besser verstehe, was gute Zusammenarbeit ausmacht.',
      'Agradezco la oportunidad de trabajar con distintos clientes y equipos. Sus opiniones me inspiran a seguir desarrollando mis habilidades y mejorar la calidad de mi trabajo. Cada proyecto ha sido una experiencia valiosa que me ha ayudado a crecer y a entender mejor qué hace una gran colaboración.',
    ],
    'One of the most engaged members of the team — always ready to support others and genuinely invested in the final outcome. It was a pleasure working with this person. They have a clear understanding of deadlines and consistently demonstrate excellent communication within the team.': [
      '团队中最投入的成员之一——总是乐于帮助他人，真正关心最终成果。与他合作非常愉快。他对截止时间有清晰的把握，在团队中始终保持出色的沟通。',
      'Один з найзалученіших членів команди — завжди готовий підтримати інших і щиро вболіває за результат. Працювати з ним було задоволенням. Чітко розуміє дедлайни й незмінно демонструє чудову комунікацію в команді.',
      'Eines der engagiertesten Teammitglieder — immer bereit, andere zu unterstützen, und wirklich am Ergebnis interessiert. Die Zusammenarbeit war eine Freude. Termine werden klar verstanden, und die Kommunikation im Team ist durchweg hervorragend.',
      'Uno de los miembros más comprometidos del equipo: siempre dispuesto a apoyar a los demás y realmente implicado en el resultado final. Fue un placer trabajar juntos. Entiende bien los plazos y mantiene una comunicación excelente con el equipo.',
    ],
    'We received more than we expected from this person, which had a positive impact on the overall quality of the company’s work. We were fully satisfied with their contribution.': [
      '他带给我们的远超预期，对公司整体工作质量产生了积极影响。我们对他的贡献非常满意。',
      'Ми отримали більше, ніж очікували, і це позитивно вплинуло на загальну якість роботи компанії. Ми повністю задоволені його внеском.',
      'Wir haben mehr bekommen, als wir erwartet hatten — mit positivem Einfluss auf die gesamte Arbeitsqualität des Unternehmens. Mit dem Beitrag waren wir rundum zufrieden.',
      'Recibimos más de lo que esperábamos, lo que tuvo un impacto positivo en la calidad general del trabajo de la empresa. Quedamos totalmente satisfechos con su aporte.',
    ],
    'Head of Content Department': ['内容部门负责人', 'Керівник відділу контенту', 'Leiter der Content-Abteilung', 'Jefe del departamento de contenido'],
    'Store Owner': ['店主', 'Власник магазину', 'Shop-Inhaber', 'Dueño de tienda'],
    'Entrepreneur': ['企业家', 'Підприємець', 'Unternehmer', 'Emprendedor'],
    'Client': ['客户', 'Клієнт', 'Kunde', 'Cliente'],

    // contact
    '07 — Contact': ['07 — 联系', '07 — Контакти', '07 — Kontakt', '07 — Contacto'],
    'Let’s build something that moves': ['一起打造会动的作品', 'Створімо щось, що рухається', 'Lassen Sie uns etwas bewegen', 'Creemos algo que se mueva'],
    'Tell us about your project — motion, web or content. We usually reply within one business day.': [
      '告诉我们你的项目——动态、网站还是内容。我们通常在一个工作日内回复。',
      'Розкажіть про свій проєкт — моушн, веб чи контент. Зазвичай ми відповідаємо протягом одного робочого дня.',
      'Erzählen Sie uns von Ihrem Projekt — Motion, Web oder Content. Wir antworten meist innerhalb eines Werktags.',
      'Cuéntanos tu proyecto: motion, web o contenido. Solemos responder en un día hábil.',
    ],
    'Email': ['邮箱', 'Пошта', 'E-Mail', 'Correo'],
    'Phone': ['电话', 'Телефон', 'Telefon', 'Teléfono'],
    'Location': ['所在地', 'Локація', 'Standort', 'Ubicación'],
    'Social': ['社交', 'Соцмережі', 'Social', 'Redes'],
    'Name': ['姓名', 'Ім’я', 'Name', 'Nombre'],
    'Service': ['服务', 'Послуга', 'Leistung', 'Servicio'],
    'Message': ['留言', 'Повідомлення', 'Nachricht', 'Mensaje'],
    '3D / CGI': ['3D / CGI', '3D / CGI', '3D / CGI', '3D / CGI'],
    'Social media content': ['社交媒体内容', 'Контент для соцмереж', 'Social-Media-Content', 'Contenido para redes'],
    'Other': ['其他', 'Інше', 'Sonstiges', 'Otro'],
    'Send message': ['发送消息', 'Надіслати', 'Nachricht senden', 'Enviar mensaje'],
    'Your name': ['你的名字', 'Ваше ім’я', 'Ihr Name', 'Tu nombre'],
    'A few words about the project, timing and budget': ['简单介绍项目、时间和预算', 'Кілька слів про проєкт, терміни й бюджет', 'Ein paar Worte zu Projekt, Zeitplan und Budget', 'Unas palabras sobre el proyecto, plazos y presupuesto'],
    'Please fill in your name, a valid email and a message.': ['请填写姓名、有效邮箱和留言。', 'Будь ласка, вкажіть ім’я, коректну пошту й повідомлення.', 'Bitte geben Sie Namen, eine gültige E-Mail und eine Nachricht ein.', 'Escribe tu nombre, un correo válido y un mensaje.'],
    'Thanks! Your message is on its way.': ['谢谢！你的消息正在发送。', 'Дякуємо! Ваше повідомлення вже в дорозі.', 'Danke! Ihre Nachricht ist unterwegs.', '¡Gracias! Tu mensaje está en camino.'],
    'The check was closed — the message was not sent.': ['验证已关闭，消息未发送。', 'Перевірку закрито — повідомлення не надіслано.', 'Die Prüfung wurde geschlossen — die Nachricht wurde nicht gesendet.', 'Se cerró la verificación: el mensaje no se envió.'],
    'Sending is not set up yet — please email us directly.': ['发送功能尚未设置，请直接发邮件给我们。', 'Надсилання ще не налаштоване — напишіть нам на пошту.', 'Der Versand ist noch nicht eingerichtet — bitte schreiben Sie uns direkt per E-Mail.', 'El envío aún no está configurado: escríbenos por correo.'],
    'Sending…': ['发送中…', 'Надсилаємо…', 'Wird gesendet…', 'Enviando…'],
    'Thanks! We will get back to you within one business day.': ['谢谢！我们会在一个工作日内回复你。', 'Дякуємо! Ми відповімо протягом одного робочого дня.', 'Danke! Wir melden uns innerhalb eines Werktags.', '¡Gracias! Te responderemos en un día hábil.'],
    'Could not send right now — please try again or email us.': ['暂时无法发送，请重试或给我们发邮件。', 'Зараз не вдалося надіслати — спробуйте ще раз або напишіть на пошту.', 'Senden ist gerade nicht möglich — bitte erneut versuchen oder per E-Mail schreiben.', 'No se pudo enviar ahora: inténtalo de nuevo o escríbenos por correo.'],

    // human check (contact.js)
    'Quick check': ['快速验证', 'Швидка перевірка', 'Kurze Prüfung', 'Verificación rápida'],
    'Drag the drop into the ring': ['把水滴拖进圆环', 'Перетягніть краплю в кільце', 'Ziehen Sie den Tropfen in den Ring', 'Arrastra la gota dentro del anillo'],
    'Use the mouse or finger — or the arrow keys.': ['用鼠标或手指拖动，也可以用方向键。', 'Мишкою чи пальцем — або стрілками на клавіатурі.', 'Mit Maus oder Finger — oder mit den Pfeiltasten.', 'Con el ratón o el dedo, o con las flechas del teclado.'],
    'Verifying…': ['验证中…', 'Перевіряємо…', 'Wird geprüft…', 'Verificando…'],
    'Thanks — you are human.': ['谢谢，验证通过。', 'Дякуємо — ви людина.', 'Danke — Sie sind ein Mensch.', 'Gracias: eres humano.'],
    'That looked a bit robotic — try again, slowly.': ['看起来有点像机器人，请慢一点再试。', 'Схоже на робота — спробуйте ще раз, повільніше.', 'Das wirkte etwas roboterhaft — bitte langsamer noch einmal.', 'Eso pareció un poco robótico: inténtalo otra vez, despacio.'],
    'Almost — drop it right inside the ring.': ['差一点——请正好放进圆环里。', 'Майже — покладіть точно всередину кільця.', 'Fast — bitte genau in den Ring ziehen.', 'Casi: suéltala justo dentro del anillo.'],
    'Close': ['关闭', 'Закрити', 'Schließen', 'Cerrar'],

    // sound gate (sfx.js)
    'The site has music and soft sound effects.': ['本网站带有音乐和柔和的音效。', 'На сайті є музика й м’які звукові ефекти.', 'Die Website hat Musik und sanfte Soundeffekte.', 'El sitio tiene música y efectos de sonido suaves.'],
    'Enter with sound': ['开启声音进入', 'Увійти зі звуком', 'Mit Ton eintreten', 'Entrar con sonido'],
    'Without sound': ['静音进入', 'Без звуку', 'Ohne Ton', 'Sin sonido'],

    // marquee (upper case)
    'MOTION DESIGN': ['动态设计', 'МОУШН-ДИЗАЙН', 'MOTION DESIGN', 'MOTION DESIGN'],
    '3D': ['3D', '3D', '3D', '3D'],
    'WEB DEVELOPMENT': ['网页开发', 'ВЕБРОЗРОБКА', 'WEBENTWICKLUNG', 'DESARROLLO WEB'],
    'CREATIVE CODING': ['创意编程', 'КРЕАТИВНИЙ КОД', 'CREATIVE CODING', 'PROGRAMACIÓN CREATIVA'],
    'INTERACTIVE EXPERIENCES': ['互动体验', 'ІНТЕРАКТИВНІ ДОСВІДИ', 'INTERAKTIVE ERLEBNISSE', 'EXPERIENCIAS INTERACTIVAS'],
    'UI / UX MOTION': ['UI / UX 动效', 'UI / UX МОУШН', 'UI / UX MOTION', 'MOTION UI / UX'],
  };
  const MARQUEE = ['MOTION DESIGN', '3D', 'WEB DEVELOPMENT', 'CREATIVE CODING', 'INTERACTIVE EXPERIENCES', 'UI / UX MOTION'];

  const IDX = { zh: 0, uk: 1, de: 2, es: 3 };
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  // any language's text → its English source (clones and re-translation)
  const SOURCE = new Map();
  Object.entries(PHRASES).forEach(([en, list]) => {
    SOURCE.set(en, en);
    list.forEach((tr) => { if (!SOURCE.has(tr)) SOURCE.set(tr, en); });
  });

  const store = {
    get() { try { return localStorage.getItem('sndr-lang'); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem('sndr-lang', v); } catch (e) { /* private mode */ } },
  };
  const browserLang = () => {
    const l = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return LANGS.some((x) => x.code === l) ? l : 'en';
  };
  let lang = store.get() || browserLang();

  const t = (en, to = lang) => {
    const key = SOURCE.get(norm(en)) || norm(en);
    if (to === 'en' || !PHRASES[key]) return to === 'en' ? key : en;
    return PHRASES[key][IDX[to]];
  };
  window.sndrT = (en) => t(en);

  // texts split into words by main.js: translated whole, then re-split there
  const SPLIT = ['.hero-content__p p', '#about .about-lead'];
  const SKIP = 'script, style, svg, noscript, .marquee-section, .hero-video-text__title, textarea';

  const apply = () => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.textContent.trim()) return NodeFilter.FILTER_REJECT;
        const p = n.parentElement;
        if (!p || p.closest(SKIP) || p.closest(SPLIT.join(','))) return NodeFilter.FILTER_REJECT;
        return SOURCE.has(norm(n.textContent)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      const raw = n.textContent;
      const lead = raw.match(/^\s*/)[0];
      const tail = raw.match(/\s*$/)[0];
      n.textContent = lead + t(raw) + tail;
    });
    document.querySelectorAll('[placeholder]').forEach((el) => {
      if (SOURCE.has(norm(el.placeholder))) el.placeholder = t(el.placeholder);
    });
    // split texts: their full text lives in aria-label once main.js split them
    SPLIT.forEach((sel) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const src = el.getAttribute('aria-label') || el.textContent;
      if (!SOURCE.has(norm(src))) return;
      if (el.getAttribute('aria-label')) el.setAttribute('aria-label', t(src));
      else el.textContent = t(src);
    });
    if (window.sndrMarquee) window.sndrMarquee(MARQUEE.map((m) => t(m)));
    document.querySelectorAll('.lang-switch__btn').forEach((b) => {
      b.textContent = LANGS.find((l) => l.code === lang).label;
      b.setAttribute('aria-label', `Language: ${LANGS.find((l) => l.code === lang).name}`);
    });
    document.querySelectorAll('.lang-menu [data-lang]').forEach((o) => o.setAttribute('aria-checked', String(o.dataset.lang === lang)));
  };

  const setLang = (code) => {
    if (code === lang) return;
    lang = code;
    store.set(code);
    apply();
    window.dispatchEvent(new CustomEvent('sndr:lang', { detail: { lang } }));
  };

  /* ---------------- switcher: button + one shared list ---------------- */
  const menu = document.createElement('div');
  menu.className = 'lang-menu';
  menu.hidden = true;
  menu.setAttribute('role', 'menu');
  menu.innerHTML = LANGS.map((l) =>
    `<button type="button" role="menuitemradio" data-lang="${l.code}" aria-checked="false"><b>${l.label}</b><span>${l.name}</span></button>`).join('');
  document.body.appendChild(menu);

  let opener = null;
  const closeMenu = () => {
    menu.hidden = true;
    if (opener) opener.setAttribute('aria-expanded', 'false');
  };
  const openMenu = (btn) => {
    opener = btn;
    btn.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    // next to the button that opened it: below it at the top, above it at the bottom
    const r = btn.getBoundingClientRect();
    const below = r.top < window.innerHeight / 2;
    menu.style.right = `${Math.max(window.innerWidth - r.right, 8)}px`;
    menu.style.top = below ? `${r.bottom + 8}px` : 'auto';
    menu.style.bottom = below ? 'auto' : `${window.innerHeight - r.top + 8}px`;
    const current = menu.querySelector(`[data-lang="${lang}"]`);
    if (current) current.focus();
  };
  // any element with .lang-switch__btn toggles the list (main.js adds one to the tablet dock)
  window.sndrLangButton = () => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lang-switch__btn';
    b.setAttribute('aria-haspopup', 'menu');
    b.setAttribute('aria-expanded', 'false');
    b.textContent = LANGS.find((l) => l.code === lang).label;
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!menu.hidden && opener === b) closeMenu();
      else openMenu(b);
    });
    return b;
  };
  const top = window.sndrLangButton();
  top.classList.add('lang-switch');
  document.body.appendChild(top);

  menu.addEventListener('click', (e) => {
    const item = e.target.closest('[data-lang]');
    if (!item) return;
    setLang(item.dataset.lang);
    closeMenu();
    if (opener) opener.focus();
  });
  document.addEventListener('click', (e) => { if (!menu.hidden && !menu.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); if (opener) opener.focus(); } });

  // first pass before main.js splits texts and Swiper clones slides
  apply();
  window.sndrI18n = { get lang() { return lang; }, set: setLang, apply };
})();
