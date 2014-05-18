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

    App.create = function create_sub_app(ns, btn, cfg){// fast init
    /*
     * There are classes with run time development reloading for
     * - controllers (e.g. 'App.userman.Chat'),
     * - slow view:
     *     Ext.define('App.view.Chat',...)
     * - and fast view definitions (config only):
     *     App.cfg['App.view.Userman'] = { ... }
     **/
        btn && btn.setLoading(true)

        if(!(~ns.indexOf('.app.'))){
            ns = 'App.' + ns// if class name from "App" (this) namespace

            if(btn){// normal load && launch via button (not dev reload)
                if(Ext.ClassManager.classes[ns]){
                    run_module()
                    return
                }
                Ext.syncRequire(ns)
            }
        }
        if(~ns.indexOf('.controller.')){
            App.getApplication().getController(ns.slice(15))// 'App.controller.'.length
            btn && btn.setLoading(false)
            return
        }

        // define a Class *only* once
        // use `override` to redefine it (e.g. when developing) in run time
        if(App.cfg[ns]){
            btn || (App.cfg[ns].override = ns)// no button -- development reload
            Ext.define(ns, App.cfg[ns], run_module)
            App.cfg[ns] = null// GC
            return
            /* Noticed: multiple `Ext.define('some.view')` is fine from (re)loaded JS file */
        }

        Ext.Msg.show({
           title: l10n.errun_title,
           buttons: Ext.Msg.OK,
           icon: Ext.Msg.ERROR,
           msg:
"Can't do <b style='color:#FF0000'>`App.create('" + ns + "')`</b>!<br><br>" +
"<b>`App.create()` is only used with `App.cfg['Class.name']` definitions<br>" +
"in app modules for fast initial App loading.</b>"
        })
        btn && btn.setLoading(false)
        return

        function run_module(){
            if(~ns.indexOf('.app.')){
                Ext.application(ns)
            } else if(~ns.indexOf('.controller.')){
                App.getApplication().getController(ns.slice(15))
            } else {// usually plain views
                Ext.create(ns, cfg)
            }

            btn && btn.setLoading(false)
        }
    }

    Ext.state.Manager.setProvider(new Ext.state.LocalStorageProvider)
    // handle errors raised by Ext.Error.raise()
    Ext.Error.handle = function(err){
        return !con.warn(err)
    }

    if(App.cfg.extjs.load.requireLaunch.length){
        var j
           ,i = 0
           ,l = Ext.fly('startup').dom.lastChild
        do{
            Ext.syncRequire([j = App.cfg.extjs.load.requireLaunch[i]])
            l.innerHTML += '<br>' + j
        } while(++i < App.cfg.extjs.load.requireLaunch.length)
    }
    if(App.cfg.createViewport){//if no app module (e.g. userman auth) does that
        Ext.globalEvents.fireEvent('createViewport')
    }

    con.log('ExtJS + App launch: OK')
}
})(window.console)
