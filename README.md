# Опросник 5F — версия для PHP + MySQL

В этой сборке внешний вид `index.html` и `stats.html` сохранён, а Supabase полностью заменён на серверный PHP API и MySQL/MariaDB.

## Требования к хостингу

- PHP 8.0+ (рекомендуется 8.1+)
- PDO MySQL (`pdo_mysql`)
- MySQL 5.7+/8.x или MariaDB 10.4+
- HTTPS
- возможность создать MySQL-базу и пользователя

## 1. Создайте MySQL-базу

В панели хостинга создайте базу и пользователя базы. Сохраните:

- хост MySQL (часто `localhost`)
- порт (обычно `3306`)
- имя базы
- имя пользователя
- пароль

Выдайте пользователю права на созданную базу.

## 2. Импортируйте структуру

Откройте phpMyAdmin -> нужная база -> Import / SQL и выполните файл `mysql-setup.sql`.

Будут созданы таблицы:

- `survey_results` — результаты опросов
- `survey_admins` — администраторы страницы очистки

## 3. Настройте сервер: api/config.php

Заполните:

```php
'db_host' => 'localhost',
'db_port' => 3306,
'db_name' => 'имя_базы',
'db_user' => 'пользователь_базы',
'db_password' => 'пароль_базы',
```

Для первоначального создания администратора задайте длинный случайный `setup_key`:

```php
'setup_key' => 'очень-длинная-случайная-строка',
```

После создания администратора ОБЯЗАТЕЛЬНО замените его на:

```php
'setup_key' => '',
```

### Если весь сайт перенесён на тот же хостинг

Оставьте:

```php
'allowed_origin' => '',
'cross_site_cookies' => false,
```

Это рекомендуемый вариант.

### Если фронтенд остаётся на GitHub Pages, а API/MySQL — на платном хостинге

Укажите origin GitHub Pages без пути репозитория:

```php
'allowed_origin' => 'https://USERNAME.github.io',
'cross_site_cookies' => true,
```

Административная авторизация в таком режиме зависит от разрешения сторонних cookie браузером. Поэтому надёжнее перенести HTML/JS/CSS и API на один домен.

## 4. Настройте публичный config.js

Если сайт и папка `api` лежат рядом на одном хостинге:

```js
window.APP_CONFIG = Object.freeze({
    apiBaseUrl: './api'
});
```

Если API размещено, например, по адресу `https://example.ru/5f/api`:

```js
window.APP_CONFIG = Object.freeze({
    apiBaseUrl: 'https://example.ru/5f/api'
});
```

В `config.js` НИКОГДА не указывайте логин или пароль MySQL.

## 5. Загрузите проект на хостинг

Пример структуры в `public_html/5f/`:

```text
5f/
├── index.html
├── stats.html
├── admin.html
├── setup-admin.html
├── config.js
├── admin.js
├── setup-admin.js
├── storage.js
├── data.js
├── styles.css
├── mysql-setup.sql
└── api/
    ├── .htaccess
    ├── config.php
    ├── _bootstrap.php
    ├── save-result.php
    ├── stats.php
    ├── health.php
    ├── admin-login.php
    ├── admin-status.php
    ├── admin-logout.php
    ├── clear-results.php
    └── setup-admin.php
```

## 6. Проверьте соединение MySQL

Откройте:

`https://ВАШ-ДОМЕН/5f/api/health.php`

Успешный ответ:

```json
{"ok":true,"database":"connected"}
```

Если приходит ошибка подключения — проверьте `api/config.php`.

## 7. Создайте администратора

1. Убедитесь, что в `api/config.php` установлен непустой `setup_key`.
2. Откройте `setup-admin.html`.
3. Введите setup key, email и пароль не короче 10 символов.
4. После успешного создания администратора откройте `api/config.php` и установите:

```php
'setup_key' => '',
```

5. Теперь используйте `admin.html` для входа и полной очистки `survey_results`.

## 8. Проверка проекта

1. Пройдите опрос на `index.html`.
2. Убедитесь, что результат сохранился.
3. Откройте `stats.html` — количество опросов должно увеличиться.
4. Проверьте исходную 3D-пирамиду.
5. Войдите в `admin.html`.
6. Для очистки введите `УДАЛИТЬ` и подтвердите удаление.

## Перенос существующих записей из Supabase

Структура `survey_results` оставлена совместимой по смыслу с предыдущей версией:

- `id`
- `created_at`
- `external_score`
- `goal_score`
- `composition_score`
- `leader_score`
- `interaction_score`

Экспортируйте `survey_results` из Supabase в CSV. Затем импортируйте данные в одноимённую таблицу MySQL через phpMyAdmin. Если формат `created_at` из Supabase не принимается вашим MySQL, импортируйте только пять полей `*_score`; MySQL автоматически проставит новый `id` и `created_at`.

## Безопасность

- MySQL-реквизиты находятся только в `api/config.php`.
- SQL выполняется через PDO prepared statements.
- Очистка базы требует серверной PHP-сессии администратора и CSRF-токена.
- Пароли администраторов хранятся в MySQL только в виде `password_hash()`.
- Публичный интерфейс не имеет SQL-доступа и не знает пароль базы.
