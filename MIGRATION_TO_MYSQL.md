# Что меняется при переходе с Supabase на MySQL

## config.js

Было:

```js
window.APP_CONFIG = Object.freeze({
    supabaseUrl: '...',
    supabaseAnonKey: '...',
    statsRpc: 'get_survey_stats',
    adminCheckRpc: 'is_survey_admin',
    clearRpc: 'clear_survey_results'
});
```

Стало:

```js
window.APP_CONFIG = Object.freeze({
    apiBaseUrl: './api'
});
```

`config.js` больше не содержит ключей базы данных.

## Новый api/config.php

Это серверный файл. Здесь задаются параметры MySQL:

```php
'db_host' => 'localhost',
'db_port' => 3306,
'db_name' => '...',
'db_user' => '...',
'db_password' => '...',
```

А также параметры CORS и одноразовый ключ создания администратора.

## index.html

Визуальная часть не изменена. Вместо POST в Supabase выполняется:

`POST api/save-result.php`

## stats.html

Визуальная часть и исходная Three.js-пирамида не изменены. Статистика теперь загружается из:

`GET api/stats.php`

## admin.html / admin.js

Supabase Auth заменён на обычную серверную PHP-сессию. Пароль проверяется на сервере по таблице `survey_admins`.

## MySQL

Вместо Supabase SQL/RPC используется `mysql-setup.sql` и PHP API.
