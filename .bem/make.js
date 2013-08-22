var BEM = require('bem'),
    Q = BEM.require('q'),
    PATH = require('path'),
    FS = require('fs'),
    shmakowiki = require('shmakowiki'),
    MD = require('marked'),
    HL = require('highlight.js'),
    mkdirp = require('mkdirp');

var OUTPUT_DATA = 'data.json';

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
    },

    createCustomNodes: function(common, libs, blocks, bundles) {

        var node = new (MAKE.getNodeClass('DataNode'))({
            id: 'data-generator',
            root: this.root,
            sources: [
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
            ]
        });

        this.arch.setNode(node, libs);

        return node.getId();
    }

});

MAKE.decl('DataNode', 'Node', {

    __constructor: function(o) {
        this.root = o.root;
        this.sources = o.sources;
        this.__base(o);
    },

    /**
     * Make node task
     * @returns {promise}
     */
    make: function() {
        var _this = this;

        _this.outData = {};

        return Q.all(this.sources.reduce(_this._processSource.bind(_this), []))
            .then(function() {
                FS.writeFile(
                    PATH.join(_this.root, OUTPUT_DATA),
                    JSON.stringify(_this.outData, null, 4)
                );
            });
    },

    /**
     * [ description]
     * @param  {[type]} res    [description]
     * @param  {[type]} source [description]
     * @return {[type]}        [description]
     * @private
     */
    _processSource: function(res, source) {
        //console.log('root ' + JSON.stringify(this.root) + ' source ' + source);

        var _this = this,
            level = BEM.createLevel(PATH.resolve(_this.root, 'content', source));

        return res.concat(level.getItemsByIntrospection()
            .filter(function(item) {
                //console.log('item' + JSON.stringify(item));
                //return BEM.util.bemType(item) === 'block' && ~['md', 'wiki', 'meta.json'].indexOf(item.tech);

                return BEM.util.bemType(item) === 'block';
            })
            .map(function(item){
                return _this._processItem(item, level, source);
            }, _this));
    },

    /**
     * [ description]
     * @param  {[type]} item   [description]
     * @param  {[type]} level  [description]
     * @param  {[type]} source [description]
     * @return {[type]}        [description]
     * @private
     */
    _processItem: function(item, level, source) {
        var _this = this,
            suffix = item.suffix.substr(1),
            lang = suffix.split('.').shift(),
            name = source.split('/').shift() + '-' + item.block,
            extention = suffix.split('.').pop();

        this.outData[lang] = this.outData[lang] || {};
        this.outData[lang][name] = this.outData[lang][name] || {};

        return BEM.util.readFile(PATH.join(level.getPathByObj(item, suffix)))
            .then(function(src) {
                var article = _this.outData[lang][name];

                switch (extention) {
                    case 'wiki':
                        article['content'] = shmakowiki.shmakowikiToHtml(src);
                        break;

                    case 'md':
                        article['content'] = _this._parseMarkdown(src);
                        break;

                    case 'json':
                        if(article['content']) {
                            var content = article['content'];
                            article = JSON.parse(src);
                            article['content'] = content;
                        }else{
                            article = JSON.parse(src);
                        }
                        break;
                }

                _this.outData[lang][name] = article;
            });
    },

    /**
     * Method for parsing markdown files with articles and documentation
     * and converting it into html
     * @param src - markdown content of file
     * @returns {String} - output string with file content in html format
     * @private
     */
    _parseMarkdown: function(src) {
        var _this = this,
            langs = {};

        return MD(src, {
            gfm: true,
            pedantic: false,
            sanitize: false,
            highlight: function(code, lang) {
                if (!lang) return code;
                var res = HL.highlight(_this._translateAlias(lang), code);
                langs[lang] = res.language;
                return res.value;
            }
        })
        .replace(/<pre><code class="lang-(.+?)">([\s\S]+?)<\/code><\/pre>/gm,
                function(m, lang, code) {
                    return '<pre class="highlight"><code class="highlight__code ' + langs[lang] + '">' + code + '</code></pre>';
                });
    },

    /**
     * Translate aliases
     * @param {String} alias
     * @returns {String} translated alias
     * @private
     */
    _translateAlias: function(alias) {
        return {
            'js' : 'javascript',
            'patch': 'diff',
            'md': 'markdown',
            'html': 'xml',
            'sh': 'bash'
        }[alias] || alias;
    },

    /**
     * Returns params for markdown parsing
     * @param  {Object} langs
     * @return {Object} - object with params for markdown parsing
     * @private
     */
    _getMarkdownParseParams: function(langs){
        var _this = this;

        return {
            gfm: true,
            pedantic: false,
            sanitize: false,
            highlight: function(code, lang) {
                if (!lang) return code;
                var res = HL.highlight(_this._translateAlias(lang), code);
                langs[lang] = res.language;
                return res.value;
            }
        }
    }

}, {
    createId: function(o) {
        return o.id;
    }
});
