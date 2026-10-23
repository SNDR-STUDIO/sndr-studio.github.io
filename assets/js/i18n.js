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

    // services (merged) + how we work
    '04 — Services': ['04 — 服务', '04 — Послуги', '04 — Leistungen', '04 — Servicios'],
    'Motion Design & Video': ['动态设计与视频', 'Моушн-дизайн і відео', 'Motion Design & Video', 'Motion design y video'],
    'We bring ideas to life through dynamic visuals, fluid transitions, and expressive animation — from logo reveals to full video production, idea to final edit. Every frame is crafted to capture attention and communicate with impact.': [
      '我们用动感的画面、流畅的转场和富有表现力的动画让创意鲜活起来——从 Logo 演绎到完整的视频制作，从创意到最终剪辑。每一帧都精心打磨，吸引目光，传递力量。',
      'Ми оживлюємо ідеї динамічними візуалами, плавними переходами й виразною анімацією — від анімації логотипа до повного відеопродакшну, від ідеї до фінального монтажу. Кожен кадр зроблений так, щоб захопити увагу й сильно донести думку.',
      'Wir erwecken Ideen mit dynamischen Visuals, fließenden Übergängen und ausdrucksstarker Animation zum Leben — vom Logo-Reveal bis zur kompletten Videoproduktion, von der Idee bis zum finalen Schnitt. Jedes Bild ist darauf ausgelegt, Aufmerksamkeit zu fesseln und mit Wirkung zu kommunizieren.',
      'Damos vida a las ideas con visuales dinámicos, transiciones fluidas y animación expresiva: de la revelación de un logo a la producción completa de video, de la idea a la edición final. Cada fotograma está pensado para captar la atención y comunicar con fuerza.',
    ],
    '05 — How we work': ['05 — 工作方式', '05 — Як ми працюємо', '05 — So arbeiten wir', '05 — Cómo trabajamos'],
    'How we work': ['我们的工作方式', 'Як ми працюємо', 'So arbeiten wir', 'Cómo trabajamos'],
    'A clear path from the first message to the final file — no surprises on the way.': ['从第一条消息到最终文件，路径清晰，过程无意外。', 'Зрозумілий шлях від першого повідомлення до фінального файлу — без сюрпризів дорогою.', 'Ein klarer Weg von der ersten Nachricht bis zur fertigen Datei — ohne Überraschungen unterwegs.', 'Un camino claro del primer mensaje al archivo final, sin sorpresas por el camino.'],
    'Brief': ['需求', 'Бриф', 'Briefing', 'Brief'],
    'Concept': ['概念', 'Концепція', 'Konzept', 'Concepto'],
    'Production': ['制作', 'Продакшн', 'Produktion', 'Producción'],
    'Delivery': ['交付', 'Здача', 'Übergabe', 'Entrega'],
    'A short brief and a 15–20 minute call: goals, audience, references, timing.': ['一份简短需求加 15–20 分钟通话：目标、受众、参考和时间。', 'Короткий бриф і дзвінок на 15–20 хвилин: цілі, аудиторія, референси, терміни.', 'Ein kurzes Briefing und ein Gespräch von 15–20 Minuten: Ziele, Zielgruppe, Referenzen, Zeitplan.', 'Un brief corto y una llamada de 15–20 minutos: objetivos, público, referencias y plazos.'],
    'Two or three directions with moodboards, styleframes and AI sketches.': ['两到三个方向，附情绪板、风格帧和 AI 草图。', 'Два-три напрями з мудбордами, стайлфреймами та AI-скетчами.', 'Zwei bis drei Richtungen mit Moodboards, Styleframes und KI-Skizzen.', 'Dos o tres direcciones con moodboards, styleframes y bocetos con IA.'],
    'Animation, 3D, code — with interim previews and 2–3 rounds of edits.': ['动画、3D、代码——阶段性预览，2–3 轮修改。', 'Анімація, 3D, код — з проміжними показами та 2–3 раундами правок.', 'Animation, 3D, Code — mit Zwischenständen und 2–3 Korrekturrunden.', 'Animación, 3D, código, con avances intermedios y 2–3 rondas de cambios.'],
    'Final files in every format you need, sources and launch support.': ['交付所需全部格式的成片、源文件，并支持上线。', 'Фінальні файли в усіх потрібних форматах, вихідники й підтримка запуску.', 'Fertige Dateien in allen benötigten Formaten, Quelldateien und Unterstützung beim Launch.', 'Archivos finales en todos los formatos que necesites, fuentes y apoyo en el lanzamiento.'],

    // pricing
    '06 — Pricing': ['06 — 价格', '06 — Ціни', '06 — Preise', '06 — Precios'],
    'Pricing': ['价格', 'Ціни', 'Preise', 'Precios'],
    'Transparent pricing': ['透明的价格', 'Прозорі ціни', 'Transparente Preise', 'Precios transparentes'],
    'Pick a package — the brief below fills itself in.': ['选择一个套餐——下方的需求表会自动填写。', 'Оберіть пакет — бриф нижче заповниться сам.', 'Wählen Sie ein Paket — das Briefing unten füllt sich selbst aus.', 'Elige un paquete: el brief de abajo se rellena solo.'],
    'Start': ['入门', 'Старт', 'Start', 'Inicio'],
    'Standard': ['标准', 'Стандарт', 'Standard', 'Estándar'],
    'Premium': ['高级', 'Преміум', 'Premium', 'Premium'],
    'Popular': ['热门', 'Популярний', 'Beliebt', 'Popular'],
    'from': ['起', 'від', 'ab', 'desde'],
    'Choose': ['选择', 'Обрати', 'Wählen', 'Elegir'],
    'Logo animation for social media and the website': ['用于社交媒体和网站的 Logo 动画', 'Анімація логотипа для соцмереж і сайту', 'Logo-Animation für Social Media und die Website', 'Animación de logo para redes y la web'],
    'A motion video for a launch or an ad': ['用于发布或广告的动态视频', 'Моушн-ролик до запуску чи реклами', 'Ein Motion-Video für einen Launch oder eine Werbung', 'Un video motion para un lanzamiento o un anuncio'],
    'Identity + motion + AI production': ['品牌识别 + 动态 + AI 制作', 'Айдентика + моушн + AI-продакшн', 'Identität + Motion + KI-Produktion', 'Identidad + motion + producción con IA'],
    'Logo animation up to 10 s': ['Logo 动画，最长 10 秒', 'Анімація лого до 10 с', 'Logo-Animation bis 10 s', 'Animación de logo de hasta 10 s'],
    '2 rounds of edits': ['2 轮修改', '2 раунди правок', '2 Korrekturrunden', '2 rondas de cambios'],
    'MP4 + Lottie for the web': ['MP4 + 网页用 Lottie', 'MP4 + Lottie для сайту', 'MP4 + Lottie fürs Web', 'MP4 + Lottie para la web'],
    'From 3 days': ['3 天起', 'Від 3 днів', 'Ab 3 Tagen', 'Desde 3 días'],
    'Video of 15–30 s': ['15–30 秒视频', 'Ролик 15–30 с', 'Video von 15–30 s', 'Video de 15–30 s'],
    'Script and storyboard': ['脚本与分镜', 'Сценарій і розкадровка', 'Skript und Storyboard', 'Guion y storyboard'],
    'Music and sound design': ['音乐与音效设计', 'Музика та саунд-дизайн', 'Musik und Sounddesign', 'Música y diseño sonoro'],
    '9:16, 16:9 and 1:1 formats': ['9:16、16:9 和 1:1 格式', 'Формати 9:16, 16:9 і 1:1', 'Formate 9:16, 16:9 und 1:1', 'Formatos 9:16, 16:9 y 1:1'],
    'From 7 days': ['7 天起', 'Від 7 днів', 'Ab 7 Tagen', 'Desde 7 días'],
    'Logo and brand identity': ['Logo 与品牌识别', 'Логотип і фірмовий стиль', 'Logo und Markenidentität', 'Logo e identidad de marca'],
    'Logo animation': ['Logo 动画', 'Анімація логотипа', 'Logo-Animation', 'Animación de logo'],
    'Promo video up to 60 s': ['60 秒以内的宣传片', 'Проморолик до 60 с', 'Promo-Video bis 60 s', 'Video promocional de hasta 60 s'],
    'AI-generated key frames': ['AI 生成关键帧', 'AI-генерація ключових кадрів', 'KI-generierte Keyframes', 'Fotogramas clave generados con IA'],
    'From 3 weeks': ['3 周起', 'Від 3 тижнів', 'Ab 3 Wochen', 'Desde 3 semanas'],

    // order brief
    '07 — Testimonials': ['07 — 客户评价', '07 — Відгуки', '07 — Referenzen', '07 — Testimonios'],
    '08 — Order': ['08 — 下单', '08 — Замовлення', '08 — Bestellung', '08 — Pedido'],
    '09 — FAQ': ['09 — 常见问题', '09 — FAQ', '09 — FAQ', '09 — Preguntas'],
    '10 — Contact': ['10 — 联系', '10 — Контакти', '10 — Kontakt', '10 — Contacto'],
    'Order': ['下单', 'Замовити', 'Bestellen', 'Pedido'],
    'FAQ': ['常见问题', 'FAQ', 'FAQ', 'Preguntas'],
    'How to order an animation, a video or a logo': ['如何订购动画、视频或 Logo', 'Як замовити анімацію, відео чи логотип', 'So bestellen Sie eine Animation, ein Video oder ein Logo', 'Cómo pedir una animación, un video o un logo'],
    'How it works': ['流程', 'Як це працює', 'So funktioniert es', 'Cómo funciona'],
    '5 short questions, ~2 minutes. Scroll on →': ['5 个简短问题，约 2 分钟。继续向下滚动 →', '5 коротких питань, ~2 хвилини. Гортайте далі →', '5 kurze Fragen, ca. 2 Minuten. Weiterscrollen →', '5 preguntas cortas, ~2 minutos. Sigue bajando →'],
    'Call': ['通话', 'Дзвінок', 'Gespräch', 'Llamada'],
    '15–20 minutes to clarify the task': ['15–20 分钟，明确任务', '15–20 хвилин, уточнюємо задачу', '15–20 Minuten, um die Aufgabe zu klären', '15–20 minutos para concretar la tarea'],
    'Proposal': ['方案', 'Пропозиція', 'Angebot', 'Propuesta'],
    'Timing, stages and cost within a day': ['一天内给出时间、阶段和报价', 'Терміни, етапи й вартість протягом дня', 'Zeitplan, Etappen und Kosten innerhalb eines Tages', 'Plazos, etapas y coste en un día'],
    'Work': ['执行', 'Робота', 'Umsetzung', 'Trabajo'],
    '50% upfront, interim previews, edits': ['预付 50%，阶段性预览，修改', 'Передоплата 50%, проміжні покази, правки', '50 % Anzahlung, Zwischenstände, Korrekturen', '50 % por adelantado, avances, cambios'],
    'from 3 days': ['3 天起', 'від 3 днів', 'ab 3 Tagen', 'desde 3 días'],
    'Motion video': ['动态视频', 'Моушн-ролик', 'Motion-Video', 'Video motion'],
    'from 7 days': ['7 天起', 'від 7 днів', 'ab 7 Tagen', 'desde 7 días'],
    'Logo': ['Logo', 'Логотип', 'Logo', 'Logo'],
    'from 10 days': ['10 天起', 'від 10 днів', 'ab 10 Tagen', 'desde 10 días'],
    'Step 1 / 5': ['第 1 / 5 步', 'Крок 1 / 5', 'Schritt 1 / 5', 'Paso 1 / 5'],
    'Step 2 / 5': ['第 2 / 5 步', 'Крок 2 / 5', 'Schritt 2 / 5', 'Paso 2 / 5'],
    'Step 3 / 5': ['第 3 / 5 步', 'Крок 3 / 5', 'Schritt 3 / 5', 'Paso 3 / 5'],
    'Step 4 / 5': ['第 4 / 5 步', 'Крок 4 / 5', 'Schritt 4 / 5', 'Paso 4 / 5'],
    'Step 5 / 5': ['第 5 / 5 步', 'Крок 5 / 5', 'Schritt 5 / 5', 'Paso 5 / 5'],
    'What needs to be done?': ['需要做什么？', 'Що потрібно зробити?', 'Was soll entstehen?', '¿Qué hay que hacer?'],
    'Package chosen:': ['已选套餐：', 'Обрано пакет:', 'Gewähltes Paket:', 'Paquete elegido:'],
    'You can pick several': ['可多选', 'Можна обрати кілька', 'Mehrfachauswahl möglich', 'Puedes elegir varios'],
    'AI video': ['AI 视频', 'AI-відео', 'KI-Video', 'Video con IA'],
    'Video / editing': ['视频 / 剪辑', 'Відео / монтаж', 'Video / Schnitt', 'Video / edición'],
    'Brand identity': ['品牌识别', 'Айдентика', 'Markenidentität', 'Identidad de marca'],
    'Website': ['网站', 'Сайт', 'Website', 'Sitio web'],
    'Tell us about the project': ['介绍一下项目', 'Розкажіть про проєкт', 'Erzählen Sie vom Projekt', 'Cuéntanos el proyecto'],
    'What does the company do and what is the task?': ['公司做什么？任务是什么？', 'Чим займається компанія і яка задача?', 'Was macht das Unternehmen und was ist die Aufgabe?', '¿A qué se dedica la empresa y cuál es la tarea?'],
    'For example: a coffee shop, we need a video for the opening of a second place': ['例如：一家咖啡店，需要为第二家店开业制作视频', 'Наприклад: кав’ярня, потрібен ролик до відкриття другої точки', 'Zum Beispiel: ein Café, wir brauchen ein Video zur Eröffnung der zweiten Filiale', 'Por ejemplo: una cafetería, necesitamos un video para abrir el segundo local'],
    'Website or social media': ['网站或社交媒体', 'Сайт або соцмережі', 'Website oder Social Media', 'Sitio web o redes'],
    'Format and style': ['格式与风格', 'Формат і стиль', 'Format und Stil', 'Formato y estilo'],
    'Length (for video and animation)': ['时长（视频和动画）', 'Тривалість (для відео й анімації)', 'Länge (für Video und Animation)', 'Duración (para video y animación)'],
    'up to 15 s': ['15 秒以内', 'до 15 с', 'bis 15 s', 'hasta 15 s'],
    '15–30 s': ['15–30 秒', '15–30 с', '15–30 s', '15–30 s'],
    '30–60 s': ['30–60 秒', '30–60 с', '30–60 s', '30–60 s'],
    'over a minute': ['超过一分钟', 'понад хвилину', 'über eine Minute', 'más de un minuto'],
    'Where it will be shown': ['投放位置', 'Де показуватиметься', 'Wo es gezeigt wird', 'Dónde se mostrará'],
    'Presentation / TV': ['演示 / 电视', 'Презентація / ТБ', 'Präsentation / TV', 'Presentación / TV'],
    'References: what you like and what you don’t': ['参考：喜欢什么，不喜欢什么', 'Референси: що подобається, а що ні', 'Referenzen: was Ihnen gefällt und was nicht', 'Referencias: qué te gusta y qué no'],
    'Links to examples': ['示例链接', 'Посилання на приклади', 'Links zu Beispielen', 'Enlaces a ejemplos'],
    'Timing and budget': ['时间与预算', 'Терміни та бюджет', 'Zeitplan und Budget', 'Plazos y presupuesto'],
    'When do you need the result': ['什么时候需要成果', 'Коли потрібен результат', 'Wann brauchen Sie das Ergebnis', '¿Cuándo necesitas el resultado?'],
    'Urgent': ['加急', 'Терміново', 'Dringend', 'Urgente'],
    '2–3 weeks': ['2–3 周', '2–3 тижні', '2–3 Wochen', '2–3 semanas'],
    'Month+': ['一个月以上', 'Місяць+', 'Monat+', 'Un mes+'],
    'No hard deadline': ['没有硬性截止', 'Не горить', 'Keine feste Frist', 'Sin fecha límite'],
    'Budget estimate': ['预算范围', 'Орієнтир за бюджетом', 'Budgetrahmen', 'Presupuesto aproximado'],
    'up to $300': ['$300 以内', 'до $300', 'bis $300', 'hasta $300'],
    'Not sure': ['还不确定', 'Не знаю', 'Noch unklar', 'No lo sé'],
    'How can we reach you?': ['怎么联系你？', 'Як з вами зв’язатися?', 'Wie erreichen wir Sie?', '¿Cómo te contactamos?'],
    'Telegram (optional)': ['Telegram（选填）', 'Telegram (необов’язково)', 'Telegram (optional)', 'Telegram (opcional)'],
    'Send the brief': ['发送需求', 'Надіслати бриф', 'Briefing senden', 'Enviar el brief'],
    'Copy': ['复制', 'Скопіювати', 'Kopieren', 'Copiar'],
    'Please add:': ['请补充：', 'Будь ласка, додайте:', 'Bitte ergänzen:', 'Añade:'],
    'what needs to be done': ['需要做什么', 'що потрібно зробити', 'was entstehen soll', 'qué hay que hacer'],
    'your name': ['你的名字', 'ваше ім’я', 'Ihren Namen', 'tu nombre'],
    'a valid email': ['有效邮箱', 'коректну пошту', 'eine gültige E-Mail', 'un correo válido'],
    'The brief is empty for now.': ['需求表还是空的。', 'Бриф поки порожній.', 'Das Briefing ist noch leer.', 'El brief aún está vacío.'],
    'Copied — paste it into an email or a message.': ['已复制——粘贴到邮件或消息中即可。', 'Скопійовано — вставте в лист чи повідомлення.', 'Kopiert — in eine E-Mail oder Nachricht einfügen.', 'Copiado: pégalo en un correo o un mensaje.'],
    'Could not copy — please select the text by hand.': ['无法复制，请手动选择文本。', 'Не вдалося скопіювати — виділіть текст вручну.', 'Kopieren nicht möglich — bitte den Text von Hand markieren.', 'No se pudo copiar: selecciona el texto a mano.'],

    // faq
    'Frequently asked questions': ['常见问题', 'Часті питання', 'Häufige Fragen', 'Preguntas frecuentes'],
    'How much does a logo animation cost?': ['Logo 动画多少钱？', 'Скільки коштує анімація логотипа?', 'Was kostet eine Logo-Animation?', '¿Cuánto cuesta una animación de logo?'],
    'From $200 for an animation up to 10 seconds. The exact price depends on how complex the logo is and how many versions you need.': ['10 秒以内的动画 $200 起。具体价格取决于 Logo 的复杂度和所需版本数量。', 'Від $200 за анімацію до 10 секунд. Точна ціна залежить від складності логотипа й кількості версій.', 'Ab $200 für eine Animation bis 10 Sekunden. Der genaue Preis hängt davon ab, wie komplex das Logo ist und wie viele Versionen Sie brauchen.', 'Desde $200 por una animación de hasta 10 segundos. El precio exacto depende de la complejidad del logo y de cuántas versiones necesites.'],
    'How long does the work take?': ['需要多长时间？', 'Скільки триває робота?', 'Wie lange dauert die Arbeit?', '¿Cuánto tarda el trabajo?'],
    'A logo animation takes from 3 days, a video from 7, a brand identity from 3 weeks. We fix the timing in the contract.': ['Logo 动画 3 天起，视频 7 天起，品牌识别 3 周起。时间会写进合同。', 'Анімація лого — від 3 днів, ролик — від 7, айдентика — від 3 тижнів. Терміни фіксуємо в договорі.', 'Eine Logo-Animation ab 3 Tagen, ein Video ab 7, eine Markenidentität ab 3 Wochen. Den Zeitplan halten wir im Vertrag fest.', 'Una animación de logo desde 3 días, un video desde 7, una identidad de marca desde 3 semanas. Fijamos los plazos en el contrato.'],
    'How many rounds of edits are included?': ['包含几轮修改？', 'Скільки правок входить?', 'Wie viele Korrekturrunden sind enthalten?', '¿Cuántas rondas de cambios incluye?'],
    '2–3 rounds of edits at every stage. More can be agreed separately.': ['每个阶段 2–3 轮修改，更多可另行商定。', '2–3 раунди правок на кожному етапі. Додаткові — за домовленістю.', '2–3 Korrekturrunden pro Etappe. Mehr nach Absprache.', '2–3 rondas de cambios en cada etapa. Más, según acuerdo.'],
    'Which files will I get?': ['我会拿到哪些文件？', 'Які файли я отримаю?', 'Welche Dateien bekomme ich?', '¿Qué archivos recibiré?'],
    'MP4/MOV in the formats you need, Lottie for the web, and After Effects or Blender sources by agreement.': ['所需格式的 MP4/MOV、网页用 Lottie，以及按约定提供 After Effects 或 Blender 源文件。', 'MP4/MOV у потрібних форматах, Lottie для сайту, вихідники After Effects або Blender — за домовленістю.', 'MP4/MOV in den benötigten Formaten, Lottie fürs Web und nach Absprache After-Effects- oder Blender-Quelldateien.', 'MP4/MOV en los formatos que necesites, Lottie para la web y fuentes de After Effects o Blender según acuerdo.'],
    'Do you use AI?': ['你们用 AI 吗？', 'Чи використовуєте ви AI?', 'Nutzen Sie KI?', '¿Usáis IA?'],
    'Yes: to find ideas and to generate backgrounds and key frames. The final quality, the finishing and the rights to the result stay with us.': ['用：寻找创意、生成背景和关键帧。最终质量、精修和成果权利由我们负责。', 'Так: для пошуку ідей, генерації фонів і ключових кадрів. Фінальна якість, доопрацювання та права на результат — на нас.', 'Ja: für Ideen sowie für Hintergründe und Keyframes. Die finale Qualität, der Feinschliff und die Rechte am Ergebnis liegen bei uns.', 'Sí: para buscar ideas y generar fondos y fotogramas clave. La calidad final, el acabado y los derechos del resultado son cosa nuestra.'],
    'How does payment work?': ['如何付款？', 'Як відбувається оплата?', 'Wie läuft die Zahlung?', '¿Cómo es el pago?'],
    '50% upfront, 50% on delivery. We work under a contract and accept cards, PayPal and USDT.': ['预付 50%，交付时付 50%。我们签订合同，接受银行卡、PayPal 和 USDT。', '50% передоплата, 50% після здачі. Працюємо за договором, приймаємо картку, PayPal і USDT.', '50 % Anzahlung, 50 % bei Übergabe. Wir arbeiten mit Vertrag und akzeptieren Karte, PayPal und USDT.', '50 % por adelantado y 50 % a la entrega. Trabajamos con contrato y aceptamos tarjeta, PayPal y USDT.'],
    'View profile': ['查看简介', 'Профіль', 'Profil ansehen', 'Ver perfil'],

    // profile page (alex-profile.html)
    'Studio': ['工作室', 'Студія', 'Studio', 'Estudio'],
    'Showreel': ['作品集锦', 'Шоурил', 'Showreel', 'Showreel'],
    'How I can help': ['我能帮你做什么', 'Чим можу допомогти', 'Wobei ich helfe', 'En qué puedo ayudar'],
    'How I work': ['我的工作方式', 'Як я працюю', 'So arbeite ich', 'Cómo trabajo'],
    'Stack': ['工具栈', 'Стек', 'Stack', 'Stack'],
    'CV': ['简历', 'CV', 'Lebenslauf', 'CV'],
    'Founder · Motion designer · Creative developer': ['创始人 · 动态设计师 · 创意开发者', 'Засновник · Моушн-дизайнер · Креативний розробник', 'Gründer · Motion Designer · Creative Developer', 'Fundador · Motion designer · Desarrollador creativo'],
    'I’m Alex Savo — a motion designer and creative developer, founder of SNDR. I started in web development and grew into motion, 3D and AI content. I build visuals for YouTube, TikTok and brands, and websites that feel alive.': [
      '我是 Alex Savo——动态设计师、创意开发者，SNDR 的创始人。我从网页开发起步，后来深入动态、3D 和 AI 内容。我为 YouTube、TikTok 和品牌制作视觉内容，也打造充满生命力的网站。',
      'Я Алекс Саво — моушн-дизайнер і креативний розробник, засновник SNDR. Почав із веброзробки й виріс у моушн, 3D та AI-контент. Створюю візуали для YouTube, TikTok і брендів, а ще сайти, що відчуваються живими.',
      'Ich bin Alex Savo — Motion Designer und Creative Developer, Gründer von SNDR. Ich habe mit Webentwicklung angefangen und bin in Motion, 3D und KI-Inhalte hineingewachsen. Ich gestalte Visuals für YouTube, TikTok und Marken — und Websites, die lebendig wirken.',
      'Soy Alex Savo, motion designer y desarrollador creativo, fundador de SNDR. Empecé en el desarrollo web y crecí hacia el motion, el 3D y el contenido con IA. Creo visuales para YouTube, TikTok y marcas, y sitios web que se sienten vivos.',
    ],
    'Sound': ['声音', 'Звук', 'Ton', 'Sonido'],
    'Motion design & video': ['动态设计与视频', 'Моушн-дизайн і відео', 'Motion Design & Video', 'Motion design y video'],
    'Logo animation, promo videos, explainers and content for social media — from the idea to the final edit.': ['Logo 动画、宣传片、讲解视频和社交媒体内容——从创意到最终剪辑。', 'Анімація логотипа, проморолики, пояснювальні відео й контент для соцмереж — від ідеї до фінального монтажу.', 'Logo-Animation, Promo-Videos, Erklärvideos und Content für Social Media — von der Idee bis zum finalen Schnitt.', 'Animación de logo, videos promocionales, explicativos y contenido para redes, de la idea a la edición final.'],
    'Product renders, scenes and animation in Blender and Cinema 4D.': ['用 Blender 和 Cinema 4D 制作产品渲染、场景和动画。', 'Продуктові рендери, сцени й анімація в Blender і Cinema 4D.', 'Produkt-Renderings, Szenen und Animation in Blender und Cinema 4D.', 'Renders de producto, escenas y animación en Blender y Cinema 4D.'],
    'AI video & generation': ['AI 视频与生成', 'AI-відео та генерація', 'KI-Video & Generierung', 'Video e imagen con IA'],
    'Key frames in Midjourney, Flux and ComfyUI, animation in Runway, Kling and Veo.': ['用 Midjourney、Flux 和 ComfyUI 生成关键帧，用 Runway、Kling 和 Veo 制作动画。', 'Ключові кадри в Midjourney, Flux і ComfyUI, анімація в Runway, Kling і Veo.', 'Keyframes in Midjourney, Flux und ComfyUI, Animation in Runway, Kling und Veo.', 'Fotogramas clave en Midjourney, Flux y ComfyUI, animación en Runway, Kling y Veo.'],
    'Web & creative coding': ['网页与创意编程', 'Веб і креативний код', 'Web & Creative Coding', 'Web y programación creativa'],
    'Fast, animated websites with WebGL, GSAP and Three.js — interactive and alive.': ['用 WebGL、GSAP 和 Three.js 打造快速、灵动、可互动的网站。', 'Швидкі анімовані сайти з WebGL, GSAP і Three.js — інтерактивні й живі.', 'Schnelle, animierte Websites mit WebGL, GSAP und Three.js — interaktiv und lebendig.', 'Sitios rápidos y animados con WebGL, GSAP y Three.js, interactivos y vivos.'],
    'Process': ['流程', 'Процес', 'Prozess', 'Proceso'],
    'Immersion': ['深入了解', 'Занурення', 'Eintauchen', 'Inmersión'],
    'Design': ['设计', 'Дизайн', 'Gestaltung', 'Diseño'],
    'Launch': ['上线', 'Запуск', 'Launch', 'Lanzamiento'],
    'I study the business, the audience and the competitors.': ['研究业务、受众和竞争对手。', 'Вивчаю бізнес, аудиторію та конкурентів.', 'Ich analysiere das Geschäft, die Zielgruppe und den Wettbewerb.', 'Estudio el negocio, el público y la competencia.'],
    'Two or three directions with moodboards and AI sketches.': ['两到三个方向，附情绪板和 AI 草图。', 'Два-три напрями з мудбордами та AI-скетчами.', 'Zwei bis drei Richtungen mit Moodboards und KI-Skizzen.', 'Dos o tres direcciones con moodboards y bocetos con IA.'],
    'The chosen direction grows into the final piece.': ['把选定方向打磨成最终作品。', 'Обраний напрям доростає до фіналу.', 'Die gewählte Richtung wächst zum fertigen Stück.', 'La dirección elegida se convierte en la pieza final.'],
    'Sources, a guide and support for the start.': ['交付源文件、使用指南，并支持上线。', 'Вихідники, гайд і супровід старту.', 'Quelldateien, ein Leitfaden und Unterstützung zum Start.', 'Fuentes, una guía y apoyo para el arranque.'],
    'Tools for motion, 3D, AI and web': ['动态、3D、AI 与网页工具', 'Інструменти для моушну, 3D, AI і вебу', 'Werkzeuge für Motion, 3D, KI und Web', 'Herramientas de motion, 3D, IA y web'],
    'A classic motion pipeline plus generative models and a modern web stack: from a storyboard in Midjourney to the final render in Cinema 4D and a living website in Three.js.': ['经典的动态制作流程，加上生成式模型和现代网页技术：从 Midjourney 分镜，到 Cinema 4D 最终渲染，再到 Three.js 打造的灵动网站。', 'Класичний моушн-пайплайн плюс генеративні моделі й сучасний вебстек: від розкадровки в Midjourney до фінального рендеру в Cinema 4D і живого сайту на Three.js.', 'Eine klassische Motion-Pipeline plus generative Modelle und ein moderner Web-Stack: vom Storyboard in Midjourney über das finale Rendering in Cinema 4D bis zur lebendigen Website in Three.js.', 'Un pipeline clásico de motion más modelos generativos y un stack web moderno: del storyboard en Midjourney al render final en Cinema 4D y una web viva en Three.js.'],
    'Motion & 3D': ['动态与 3D', 'Моушн і 3D', 'Motion & 3D', 'Motion y 3D'],
    'AI models': ['AI 模型', 'AI-моделі', 'KI-Modelle', 'Modelos de IA'],
    'Web': ['网页', 'Веб', 'Web', 'Web'],
    'Move the cursor over the sphere or drag it': ['将光标移到球体上，或拖动它', 'Ведіть курсором по сфері або тягніть її', 'Den Cursor über die Kugel bewegen oder sie ziehen', 'Mueve el cursor sobre la esfera o arrástrala'],
    'Download my CV': ['下载我的简历', 'Завантажити моє CV', 'Meinen Lebenslauf herunterladen', 'Descarga mi CV'],
    'The CV goes out on request: leave your email and I will send the PDF personally, usually within a day.': ['简历按需发送：留下邮箱，我会亲自发送 PDF，通常一天之内。', 'CV надсилаю на запит: залиште пошту — я особисто надішлю PDF, зазвичай протягом дня.', 'Den Lebenslauf gibt es auf Anfrage: Hinterlassen Sie Ihre E-Mail, und ich schicke das PDF persönlich, meist innerhalb eines Tages.', 'El CV se envía bajo petición: deja tu correo y te mando el PDF personalmente, normalmente en un día.'],
    'Request the CV': ['索取简历', 'Отримати CV', 'Lebenslauf anfordern', 'Pedir el CV'],
    'Let’s make something that moves': ['一起做点会动的东西', 'Створімо щось, що рухається', 'Lassen Sie uns etwas bewegen', 'Hagamos algo que se mueva'],
    'Please fill in your name and a valid email.': ['请填写姓名和有效邮箱。', 'Будь ласка, вкажіть ім’я та коректну пошту.', 'Bitte geben Sie Namen und eine gültige E-Mail ein.', 'Escribe tu nombre y un correo válido.'],
    'Thanks! The CV is on its way to your inbox.': ['谢谢！简历正在发往你的邮箱。', 'Дякую! CV вже в дорозі до вашої пошти.', 'Danke! Der Lebenslauf ist unterwegs in Ihr Postfach.', '¡Gracias! El CV va camino de tu correo.'],
    'The check was closed — the request was not sent.': ['验证已关闭，请求未发送。', 'Перевірку закрито — запит не надіслано.', 'Die Prüfung wurde geschlossen — die Anfrage wurde nicht gesendet.', 'Se cerró la verificación: la solicitud no se envió.'],
    'Requests are not set up yet — please write to hello@example.com.': ['请求功能尚未设置，请发邮件至 hello@example.com。', 'Запити ще не налаштовані — напишіть на hello@example.com.', 'Anfragen sind noch nicht eingerichtet — bitte an hello@example.com schreiben.', 'Las solicitudes aún no están configuradas: escribe a hello@example.com.'],

    // brief attachments
    'Brand book, photos or PDF (optional)': ['品牌手册、照片或 PDF（选填）', 'Брендбук, фото або PDF (необов’язково)', 'Brandbook, Fotos oder PDF (optional)', 'Manual de marca, fotos o PDF (opcional)'],
    'Drop files here or click to choose': ['拖放文件到这里，或点击选择', 'Перетягніть файли сюди або натисніть, щоб обрати', 'Dateien hierher ziehen oder klicken zum Auswählen', 'Suelta los archivos aquí o haz clic para elegir'],
    'JPG, PNG, WebP or PDF · up to 5 files, 10 MB each': ['JPG、PNG、WebP 或 PDF · 最多 5 个文件，每个 10 MB', 'JPG, PNG, WebP або PDF · до 5 файлів, по 10 МБ', 'JPG, PNG, WebP oder PDF · bis zu 5 Dateien, je 10 MB', 'JPG, PNG, WebP o PDF · hasta 5 archivos de 10 MB'],
    'The check was closed — the files were not added.': ['验证已关闭，文件未添加。', 'Перевірку закрито — файли не додано.', 'Die Prüfung wurde geschlossen — die Dateien wurden nicht hinzugefügt.', 'Se cerró la verificación: los archivos no se añadieron.'],
    'Skipped (type, size or more than 5 files):': ['已跳过（类型、大小或超过 5 个文件）：', 'Пропущено (тип, розмір або понад 5 файлів):', 'Übersprungen (Typ, Größe oder mehr als 5 Dateien):', 'Omitidos (tipo, tamaño o más de 5 archivos):'],
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
