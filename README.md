bem-info-source
=====

Инструмент для сборки документации для сайта [bem-info](http://bem.info/).

### Установка

* Клонируем репозиторий `git@github.com:tormozz48/bem-info-source.git`
* Переходим в него `cd bem-info-source`
* Устанавливаем зависимости `npm install`
* Запускаем сборку `bem make`

### Настройка

Список ресурсов, которые попадут в сборку, находится в файле `.bem/sources.js`

Элемент списка ресурсов имеет вид:

```javascript
'content/articles/bem-articles': {
    type: 'git',
    url: 'git://github.com/bem/bem-articles.git',
    treeish: 'bem-info-data',
    npmPackages: false
},
```

где:

* `type` — тип репозитория
* `url` — путь до репозитория
* `treeish` — ветка
* `npmPackages` — флаг про необходимость установки npm-зависимостей внутри данной библиотеки

### Примечание

Документация и статьи вместе с соответствующей мета-информацией помещаются
в единый json файл в корне проекта ` data.json`. При этом документация в форматах `wiki` и `md`
преобразуется в html.

Формат вывода `data.json`:

```javascript
{
    "en": {
        /* ... */
    },
    "ru": {
        "bem-method-filesystem": {
            "content": "<div class=...."
        },
        "articles-bem-js-main-terms": {
            "author": "Андрей Кузнецов",
            "data": "2013-08-19",
            "content": "<h1>JavaScript по БЭМ: основные понятия ...."
        },
        { /* ... */ }
    },
    "ja": {
        /* ... */
    }
}
```
