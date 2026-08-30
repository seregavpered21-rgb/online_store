# Warenladen

Рабочий прототип немецкого интернет-магазина одежды, аксессуаров и подарков. Интерфейс магазина сделан на немецком языке. В первой версии доступны самовывоз или доставка в Essen, почтовая отправка по Германии и оплата при получении.

Проект развёрнут на Vercel, использует Neon/Vercel Postgres для данных, Vercel Blob для фотографий и Better Auth для регистрации по email и паролю.

## Что уже сделано

### Витрина и каталог

- Главная страница, каталог, поиск, фильтр категорий и сортировка по цене.
- Страницы категорий и отдельных товаров с вариантами, остатками и доступностью.
- Корзина в `localStorage`, изменение количества и удаление позиций.
- Страница checkout с Essen/почтовой доставкой и оплатой при получении.
- Фотографии из Vercel Blob выводятся через `next/image`.
- SEO-основа: metadata, Product JSON-LD, `sitemap.xml` и `robots.txt`.

### Аккаунт и заказы

- Регистрация, вход, выход и защищённая страница `Konto`.
- Better Auth с ролями `customer` и `admin`.
- Заказ атомарно создаётся вместе со списанием остатка. Если хотя бы одного варианта недостаточно, ни заказ, ни частичное списание не сохраняются.
- Заказы, сделанные в авторизованном аккаунте, появляются в `Konto`.
- Подготовлены Resend-письма: подтверждение заказа и уведомление о смене статуса. Они начинают отправляться только после настройки ключа и sender address.

### Админ-панель

- `/admin` создаёт товары и показывает каталог.
- `/admin/products/[id]` редактирует название, цену, категорию, варианты, остаток и фотографии.
- `/admin/orders` показывает заказы и отдаёт CSV-выгрузку; детальная страница показывает состав, позволяет менять статус и сохранять внутреннюю заметку продавца:

```text
new -> confirmed -> fulfilled
new / confirmed -> cancelled
```

- Админ-маршруты и API защищены ролью `admin` на сервере.

### Legal-шаблоны

В footer добавлены шаблонные страницы:

- `/impressum`
- `/datenschutz`
- `/widerruf`
- `/versand-und-zahlung`

Это не готовая юридическая консультация. До реального запуска нужно заполнить данные в квадратных скобках и проверить тексты у специалиста.

## Технологии

- Next.js 16, React 19, TypeScript и Tailwind CSS 4.
- Drizzle ORM + Neon/Vercel Postgres.
- Better Auth для email/password и сессий.
- Vercel Blob для фотографий товаров.
- Resend для транзакционных писем.

## Структура проекта

```text
src/
	app/
		(store)/              # публичные страницы магазина
		admin/                # защищённые страницы продавца
		api/                  # auth, checkout и admin API
	components/
		admin/ cart/ layout/ product/ seo/
	db/
		schema/               # Drizzle-схемы
		migrations/           # SQL-миграции
		seed.ts               # демонстрационные товары
	lib/
		auth.ts               # Better Auth
		catalog/queries.ts    # запросы витрины
		db/client.ts          # клиент Neon/Drizzle
		email/orders.ts       # Resend-уведомления
TODO.md                   # план следующих этапов
```

## Запуск локально

### 1. Установить зависимости

```powershell
npm install
```

### 2. Создать `.env.local`

Скопируйте значения из `.env.example`, но не добавляйте реальные секреты в Git. Минимально нужны:

```dotenv
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-local-random-secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Для локальной загрузки фото добавьте выданный Vercel Blob токен:

```dotenv
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

Почта локально необязательна. Если нужны реальные письма, добавьте:

```dotenv
RESEND_API_KEY=re_...
EMAIL_FROM=Warenladen <verified-sender@your-domain.de>
```

### 3. Подготовить базу

```powershell
npm run db:migrate
npm run db:seed
```

`db:migrate` применяет SQL из `src/db/migrations`. `db:seed` добавляет демонстрационные категории и товары; он нужен для пустой базы.

### 4. Запустить сайт

```powershell
npm run dev
```

Откройте `http://localhost:3000`.

## Полезные команды

```powershell
npm run dev          # локальный сервер
npm run build        # production-сборка
npm run lint         # ESLint
npm run db:generate  # создать миграцию после изменения schema
npm run db:migrate   # применить миграции к DATABASE_URL
npm run db:seed      # заполнить пустую базу демо-данными
```

Перед push желательно выполнять:

```powershell
npm run lint
npm run build
git status
```

## Как стать администратором

1. Зарегистрируйте пользователя через `/sign-up`.
2. Откройте SQL Editor подключённой Neon-базы.
3. Выполните запрос с email зарегистрированного пользователя:

```sql
UPDATE "user"
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

4. Выйдите и войдите снова, затем откройте `/admin`.

## Vercel: развертывание и переменные

Push в ветку `main` запускает Vercel deployment. Для private GitHub-репозитория на Hobby плане автор commit должен иметь доступ к Vercel project; публичный репозиторий устраняет это ограничение.

В `Vercel -> Project -> Settings -> Environment Variables` добавьте для `Production` и желательно `Preview`:

```text
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL=https://your-project.vercel.app
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
BLOB_READ_WRITE_TOKEN
RESEND_API_KEY                 # когда будет подключён Resend
EMAIL_FROM                     # когда будет подтверждён sender/domain
```

После изменения переменных сделайте `Redeploy` последнего deployment. Локальный `.env.local` не попадает в Vercel и не заменяет production-переменные.

### Vercel Blob

В `Storage` создайте Public Blob Store в подходящем регионе и отметьте добавление read-write token в проект. Это создаст `BLOB_READ_WRITE_TOKEN`. После подключения сделайте redeploy. В админке откройте товар через `Bearbeiten`, нажмите `Bild hochladen`, задайте alt-текст и сохраните товар.

### Resend

1. Создайте проект в Resend.
2. Подтвердите домен или sender address.
3. Добавьте `RESEND_API_KEY` и `EMAIL_FROM` в Vercel.
4. Redeploy последний commit.

Если ключей Resend нет, checkout и статусы заказов работают, но письма не отправляются.

## Работа с данными и миграциями

Изменение файлов в `src/db/schema` требует новой миграции:

```powershell
npm run db:generate
npm run db:migrate
```

Перед применением на production убедитесь, что `DATABASE_URL` указывает именно на production Neon-базу. Не выполняйте `db:seed` на реальном каталоге: seed предназначен для пустой демонстрационной базы.

В истории проекта миграции `0002` и `0003` исправили Better Auth: его идентификаторы должны быть строками, а таблица `account` должна содержать поле `issuer`. Если новая среда создаётся с нуля, достаточно применить все миграции по порядку.

## Что нужно уточнить перед запуском продаж

- Финальное название, логотип, контакты, адрес и реквизиты для legal-страниц.
- Собственный домен. После подключения обновить `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `EMAIL_FROM` и metadata.
- Платёжные способы: Stripe, PayPal, Klarna или другой сервис. Сейчас используется cash on delivery.
- Реальные стоимость и сроки доставки.
- Cookie consent, аналитика и мониторинг ошибок.
- Правовая проверка Impressum, Datenschutz, Widerruf и условий продажи.

Подробный приоритетный backlog находится в [TODO.md](TODO.md).
