var BEM = require('bem'),
    Q = BEM.require('q'),
    PATH = require('path'),
    FS = require('fs'),
    shmakowiki = require('shmakowiki'),
    MD = require('marked'),
    HL = require('highlight.js'),
    mkdirp = require('mkdirp');

process.env.YENV = 'production';
process.env.BEM_I18N_LANGS = 'en ru';
process.env.SHMAKOWIKI_HL = 'server';


MAKE.decl('Arch', {
    getLibraries: function() {
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
                url: 'git://github.com/css/csso.git',
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
    },
    createCustomNodes: function(common, libs, blocks, bundles) {
        console.log('-- create custom nodes --');

        var node = new (MAKE.getNodeClass('DataNode'))({
            id: 'pages-generator',
            root: this.root,
            sources: ['bem-method',
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
            ]
        });

        this.arch.setNode(node, bundles, libs);

        return node.getId();
    }

});

MAKE.decl('DataNode', 'Node', {

    __constructor: function(o) {
        console.log('-- data node constructor --');

        this.root = o.root;
        this.sources = o.sources;
        this.__base(o);
    },

    make: function() {
        console.log('-- data node make start --');
    }

}, {
    createId: function(o) {
        return o.id;
    }
});