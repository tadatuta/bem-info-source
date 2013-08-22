var BEM = require('bem'),
    Q = BEM.require('q'),
    PATH = require('path'),
    FS = require('fs'),

    mkdirp = require('mkdirp'),
    marked = require('marked'),
    highlight = require('highlight.js'),
    shmakowiki = require('shmakowiki'),

    sources = require('./sources.js');

var OUTPUT_DATA = 'data.json';

process.env.YENV = 'production';
process.env.BEM_I18N_LANGS = 'en ru';
process.env.SHMAKOWIKI_HL = 'server';

MAKE.decl('Arch', {

    getLibraries: sources.getLibraries,

    createCustomNodes: function(common, libs, blocks, bundles) {

        var node = new (MAKE.getNodeClass('DataNode'))({
            id: 'data-generator',
            root: this.root,
            sources: sources.getSources()
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
     * Process single source (library)
     * @param  {Object} res    [description]
     * @param  {Object} source - library
     * @return {Object}
     * @private
     */
    _processSource: function(res, source) {
        var _this = this,
            level = BEM.createLevel(PATH.resolve(_this.root, 'content', source));

        return res.concat(level.getItemsByIntrospection()
            .filter(function(item) {
                //TODO make this working with tech
                //return BEM.util.bemType(item) === 'block' && ~['md', 'wiki', 'meta.json'].indexOf(item.tech);

                return BEM.util.bemType(item) === 'block';
            })
            .map(function(item){
                return _this._processItem(item, level, source);
            }, _this));
    },

    /**
     * Process single item on level
     * @param  {Object} item - file
     * @param  {Object} level - level
     * @param  {Object} source - library
     * @return {Object} promise object of Q library
     * @private
     */
    _processItem: function(item, level, source) {
        var _this = this,
            name = source.split('/').shift() + '-' + item.block,
            suffix = item.suffix.substr(1),
            lang = suffix.substring(0, suffix.indexOf('.')),
            extention = suffix.substring(suffix.indexOf('.') + 1);

        this.outData[lang] = this.outData[lang] || {};
        this.outData[lang][name] = this.outData[lang][name] || {};

        return BEM.util.readFile(PATH.join(level.getPathByObj(item, suffix)))
            .then(function(src) {
                _this.outData[lang][name] = _this._processData(src, extention, _this.outData[lang][name]);
            });
    },

    /**
     * Process file content depend on parsed file extention
     * @param src - file content
     * @param extention - file extention
     * @param existed - exited data for lang and article key
     * @returns {Object} constrained meta-data object with parsed content including
     * @private
     */
    _processData: function(src, extention, existed){
        var article = existed;

        switch (extention) {
            case 'wiki':
                article['content'] = shmakowiki.shmakowikiToHtml(src);
                break;

            case 'md':
                article['content'] = this._parseMarkdown(src);
                break;

            case 'meta.json':
                if(article['content']) {
                    var content = article['content'];
                    article = JSON.parse(src);
                    article['content'] = content;
                }else{
                    article = JSON.parse(src);
                }
                break;
        }

        return article;
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

        return marked(src, {
            gfm: true,
            pedantic: false,
            sanitize: false,
            highlight: function(code, lang) {
                if (!lang) return code;
                var res = highlight.highlight(_this._translateAlias(lang), code);
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
    }

}, {
    createId: function(o) {
        return o.id;
    }
});
