/*
 * common part for `nw` && `connectjs` front ends
 */

var app

(function gc_wrapper(con){
    app = {
        config: null,
        extjs_load: extjs_load_gc_wrapped
    }
    return

/* init stuff must be garbage collected */

function extjs_load_gc_wrapped(doc ,w){
    function css_load(url, backend){
        var el = doc.createElement('link')
        el.setAttribute('rel', 'stylesheet')
        el.setAttribute('href', (backend ? backend : '') + url)
        doc.head.appendChild(el)
    }
var path, extjs

    if(app.config.extjs.load.css.length){
        for(path in app.config.extjs.load.css){
            css_load(app.config.extjs.load.css[path], app.config.backend.url)
        }
    }
    path = app.config.extjs.path
    css_load(path + 'resources/css/ext-all.css')
    extjs = doc.createElement('script'),
    extjs.setAttribute('type' ,'application/javascript')
    extjs.setAttribute('charset' ,'utf-8')
    extjs.setAttribute('src' ,path + 'ext-all-nw.js')// fix of `loadScriptFile`
    doc.head.appendChild(extjs)

    extjs = setInterval(function waiting_extjs(){
        if(w.Ext){// xhr HEAD check is done, thus just wating
            clearInterval(extjs)
            app.extjs_load = null//mark for GC
            path = Ext.Loader.getPath('Ext')
            extjs = path + '/../locale/ext-lang-' + l10n.lang + '.js'
            Ext.Loader.loadScript({
                url: extjs,
                onError: function fail_load_locale(){
                    throw new Error('Error loading locale file:\n' + extjs)
                }
            })
            con.log(
                'ExtJS version: ' + Ext.getVersion('extjs') + '\n' +
                'ExtJS locale: ' + l10n.lang + '\n' +
                'ExtJS is at <' + path + '>'
            )
            Ext.Loader.setPath('Ext.ux', path + '/../examples/ux')
            Ext.Loader.setPath('Ext.uxo', app.config.extjs.appFolder + '/uxo')

            if(app.config.backend.url){// `nw` context`
                app.config.extjs.appFolder = app.config.backend.url
                /*
                 * patch ExtJS Loader to work from "file://" in `node-webkit`
                 * also `debugSourceURL` removed in `ext-all-debug.js#loadScriptFile()`
                 * it crushes `eval` there
                 * */
                Ext.Loader._getPath = Ext.Loader.getPath
                Ext.Loader.getPath = function getPath(className){
                    return '/' == className[0] ?
                        app.config.backend.url + className + '.js' :
                        Ext.Loader._getPath(className)
                }
            }

            app.config.extjs.launch = extjs_launch
            app.config.extjs.controllers.push('Main')
            Ext.application(app.config.extjs)
            return
        }
    }, 1024)
    con.log('extjs_load: done, waiting for ExtJS')
    return
}

function extjs_launch(){
    app.config.extjs.launch = null
    delete app.config.extjs.launch
    app.config.createViewport = true// bunch `app.config` processing here
    delete app.extjs_load

    //global `App` object is available now
    if(app.backend_check){
        App.doCheckBackend = app.backend_check
        App.doRestartBackend = app.backend_restart
        App.doTerminateBackend = app.backend_terminate

        delete app.backend_check
        delete app.backend_restart
        delete app.backend_terminate
    }
    App.cfg = app.config

    //`localStorage` doomed by local JSDuck's ExtJS docs
    Ext.state.Manager.setProvider(new Ext.state.CookieProvider)
    // handle errors raised by Ext.Error.raise()
    Ext.Error.handle = function(err){
        return !con.warn(err)
    }

    if(App.cfg.extjs.load.requireLaunch.length){
        Ext.syncRequire(App.cfg.extjs.load.requireLaunch)
    }
    if(App.cfg.createViewport){//if no app module (e.g. userman auth) does that
        Ext.globalEvents.fireEvent('createViewport')
    }

    con.log('ExtJS + App launch: OK')
}
})(window.console)
