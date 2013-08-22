exports.getLibraries = function() {
    return {
        'content/bem-core': {
            type: 'git',
            url: 'git://github.com/bem/bem-core.git',
            branch: 'v1',
            npmPackages: false
        },
        'content/bem-method': {
            type: 'git',
            url: 'git://github.com/bem/bem-method.git',
            npmPackages: false
        },
        'content/bem-tools': {
            type: 'git',
            url: 'git://github.com/bem/bem-tools.git',
            treeish: 'dev',
            npmPackages: false
        },
        'content/csso': {
            type: 'git',
            //url: 'git://github.com/css/csso.git',
            url: 'git@github.com:tormozz48/csso.git',
            npmPackages: false
        },
        'content/borschik': {
            type: 'git',
            url: 'git://github.com/bem/borschik.git',
            npmPackages: false
        },
        'content/borschik-server': {
            type: 'git',
            url: 'git://github.com/bem/borschik-server.git',
            treeish: 'bem.info'
        },
        'content/articles/bem-articles': {
            type: 'git',
            url: 'git://github.com/bem/bem-articles.git',
            treeish: 'bem-info-data',
            npmPackages: false
        },
        'content/articles/firm-card-story': {
            type: 'git',
            url: 'git://github.com/AndreyGeonya/firmCardStory.git',
            npmPackages: false
        },
        'content/blog/bem-news': {
            type: 'git',
            url: 'git://github.com/mursya/bem-news.git',
            npmPackages: false
        }
    };
};

exports.getSources = function() {
    return [
        'bem-method',
        'tools',
        'bem-tools/docs',
        'csso/docs',
        'borschik/docs',
        'borschik-server/docs',
        'articles/bem-articles',
        'articles/firm-card-story/docs',
        'blog',
        'blog/bem-news',
        'bem-core/common.docs',
        'pages'
    ];
};
