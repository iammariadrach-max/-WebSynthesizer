# Biological Signal Station

Простой веб-синтезатор на HTML, CSS, JavaScript и Tone.js. Сборка — Bun.

## Первая публикация на GitHub Pages

1. Открыть [Settings → Pages](https://github.com/iammariadrach-max/-WebSynthesizer/settings/pages).
2. В разделе **Build and deployment → Source** выбрать **GitHub Actions**. Предлагаемые шаблоны добавлять не нужно: workflow уже есть в проекте.
3. Закоммитить и запушить в `main` все подготовленные изменения, включая `.github/workflows/deploy.yml`, `package.json` и `bun.lock`.
4. Открыть [Actions](https://github.com/iammariadrach-max/-WebSynthesizer/actions) и дождаться успешного завершения **Build and deploy GitHub Pages**. Внутри будут этапы **Build** и **Deploy**.
5. После успешной публикации сайт будет доступен по адресу: **https://iammariadrach-max.github.io/-WebSynthesizer/**. Ссылка также появится в окружении `github-pages` в Deployments.

Сборка и публикация выполняются на серверах GitHub после каждого push в `main`. На компьютере запускать проект для публикации не требуется. В workflow также предусмотрен ручной запуск: **Actions → Build and deploy GitHub Pages → Run workflow**, ветка `main`.

Если первый запуск произошёл до включения Pages и завершился ошибкой, сначала выбрать Source → GitHub Actions, затем в неудачном запуске нажать **Re-run failed jobs**.

## Как устроена сборка

- `.github/workflows/deploy.yml` устанавливает Bun, выполняет `bun install --frozen-lockfile --ignore-scripts` и `bun run build`, затем публикует только папку `dist`.
- В `package.json` зафиксирован Bun 1.4.2 — эта версия используется и в GitHub Actions.
- `bun.lock` фиксирует версии зависимостей. Его нужно хранить в Git. После изменения зависимостей обновлять через `bun install` и коммитить вместе с `package.json`.
- `bun.config.prod.js` использует относительные пути `./`, чтобы JavaScript и CSS загружались внутри адреса `/-WebSynthesizer/`.
- `dist` и `node_modules` остаются в `.gitignore`: GitHub сам создаёт их при сборке.
- Отдельная ветка `gh-pages` и личные токены не нужны: workflow использует стандартный токен GitHub Actions.

## Локальная работа — по желанию

```sh
bun install --frozen-lockfile
bun run dev
```

Открыть `http://localhost:3000`. Для включения звука нажать PLAY. Завершение сервера — Ctrl+C.

```sh
bun run build
```

Эта команда создаёт статические файлы в `dist` и не публикует их самостоятельно.

## Проверка настройки

При добавлении workflow приложение и сервер локально не запускались. Проверены структура workflow, конфигурация и файл зависимостей. Фактическая сборка и публикация будут проверены первым запуском Actions после push.

Основа workflow — [официальная инструкция GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) и [setup-bun](https://github.com/oven-sh/setup-bun).
