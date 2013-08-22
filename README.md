bem-info-source
=====

Инструмент для сборки документации для сайта bem-info.

### Установка

* Клонируем репозиторий `git@github.com:tormozz48/bem-info-source.git`
* Переходим в него `cd bem-info-source`
* Устанавливаем зависимости `npm install`
* Запускаем сборку `bem make`

### Настройка

Список ресурсов которые попадут в сборку находится в файле `.bem/sources.js`

Элмента спска ресурсов имеет вид:

%%
'content/articles/bem-articles': {
    type: 'git',
    url: 'git://github.com/bem/bem-articles.git',
    treeish: 'bem-info-data',
    npmPackages: false
},
%%

где:

* `type` - тип репозитория
* `url` - путь до репозитория
* `treeish` - ветка
* `npmPackages` - флаг сбора зависимостей

### Примечание

Документация и статьи вместе с соответствующей мета-информацией помещаются
в единый json файл в корне проекта ` data.json`. При этом документация wiki и md формата
преобразуется в html.

Формат вывода `data.json`:

%%
{
    "en": {
        ...
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

        ...
    },
    "ja": {
        ...
    }
}
%%
