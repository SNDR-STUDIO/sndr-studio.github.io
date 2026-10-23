# Форма → Telegram (Cloudflare Worker)

Сайт на GitHub Pages статический, поэтому токен бота в него класть нельзя: любой увидит его в коде и сможет писать от имени бота. Сообщения принимает маленький Worker на бесплатном тарифе Cloudflare (100 000 запросов в день). Он ещё раз проверяет защиту от ботов и пересылает сообщение в Telegram.

## Настройка (один раз, ~10 минут)

1. **Бот.** В Telegram напишите [@BotFather](https://t.me/BotFather) → `/newbot` → сохраните токен.
2. **Chat ID.** Напишите своему боту любое сообщение, затем откройте
   `https://api.telegram.org/bot<ТОКЕН>/getUpdates` и возьмите `message.chat.id`.
3. **Worker.** Нужен бесплатный аккаунт Cloudflare и Node.js:

   ```bash
   cd tools/contact-worker
   npx wrangler login
   npx wrangler secret put TG_BOT_TOKEN
   npx wrangler secret put TG_CHAT_ID
   npx wrangler deploy
   ```

   Wrangler выведет адрес вида `https://sndr-contact.<имя>.workers.dev`.
4. **Сайт.** В `assets/js/contact.js` впишите этот адрес в `CONTACT.endpoint`.
   Если домен сайта другой, поправьте `ALLOWED_ORIGIN` в `wrangler.toml` и снова выполните `npx wrangler deploy`.

## Ссылки на Telegram и Instagram

Ссылки не лежат в HTML открытым текстом и открываются только после проверки. Чтобы задать их, выполните в консоли браузера:

```js
btoa('https://t.me/yourname'.split('').reverse().join(''))
```

Получившуюся строку вставьте в `CONTACT.links.telegram`, то же самое сделайте для `instagram`.

## Что проверяется

| Где | Проверка |
|---|---|
| Браузер | скрытое поле-ловушка, время заполнения ≥ 4 с, пазл «перетащи каплю в кольцо» с анализом траектории, proof-of-work SHA-256 (15 бит) |
| Worker | разрешённый Origin, ловушка и время, повторная проверка proof-of-work, повторное использование доказательства, не больше 5 сообщений за 10 минут с одного IP, длина полей, формат email |

Если спама всё равно станет много, можно добавить [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/): он бесплатный, а ключи берутся в том же аккаунте Cloudflare.
