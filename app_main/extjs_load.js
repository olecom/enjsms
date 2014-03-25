/*
 * common part for `nw` && `connectjs` front ends
 */

var app

(function gc_wrapper(con){
var devel = true

    app = {
        config: null,
        extjs_load: extjs_load_gc_wrapped
    }
    return

/* init stuff must be garbage collected */
function extjs_load_gc_wrapped(doc ,w){
var path, extjs

    path = app.config.extjs.path
    extjs = doc.createElement('link')
    extjs.setAttribute('rel', 'stylesheet')
    extjs.setAttribute('href', path + 'resources/css/ext-all.css')
    doc.head.appendChild(extjs)

    extjs = doc.createElement('script'),
    extjs.setAttribute('type' ,'application/javascript')
    extjs.setAttribute('charset' ,'utf-8')
    extjs.setAttribute('src' ,path + 'ext-all' + (devel ? '-debug' : '') + '.js')
    doc.head.appendChild(extjs)

    path = '1234'
    extjs = setInterval(function waiting_extjs(){
        if(w.Ext){
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
            app.config.extjs.launch = extjs_launch
            Ext.application(app.config.extjs)
            return
        } else if('' == path){
            clearInterval(extjs)
            con.error(l10n.extjsNotFound)
            doc.write(l10n.extjsNotFound)
            w.alert(l10n.extjsNotFound)
            return
        }
        con.log(path)
        path = path.slice(1)
    }, 1024)
    con.log('extjs_load: done, waiting for ExtJS')
    return
}

function extjs_launch(){
    var me = this

    //`localStorage` doomed by local JSDuck's ExtJS docs
    Ext.state.Manager.setProvider(new Ext.state.CookieProvider)
    // handle errors raised by Ext.Error.raise()
    Ext.Error.handle = function(err){
        //TODO: error list, kebab's popup with extdesk gears to show them
        return !con.warn(err)
    }

    //TODO: events via long pooling from app_backend/connectjs
    //TODO: dynamic addition in toolbar or items/xtype construction
    //TODO: for each app.config.app.modules load module's resources: css
    //global `App` object is available now
    App.cfg = app.config ,App.user = app.user ,App.role = app.role

    Ext.require('App.backend.Connection')

    if(app.config.extjs.fading){
        // very strange composition to get gears to fadeOut and viewport to fadeIn
        var b = Ext.getBody()
        b.fadeOut({duration:777 ,callback:
            function(){
                Ext.fly('startup').remove()
                b.show()
                Ext.create('App.view.Viewport')
                b.fadeIn({easing:'easeIn' ,duration: 1024 ,callback: appRun })
                con.log('extjs: faded In')
            }
        })
    } else {
        Ext.fly('startup').remove()
        Ext.create('App.view.Viewport')
        appRun()
    }
    con.log('ExtJS + App launch: OK')

    function appRun(){
        /*dynamic controller for dynamic models
         * this doesn't work due to curved loading: Controller first, not Model.
           application.config: {
                models: [ 'Base', 'BaseR', 'Status' ],
                stores: [ 'Status' ],
                controllers: [ 'Main' ]
            }
         **/
        //me.viewport = Ext.ComponentQuery.query('viewport')[0]
        me.getController('Main').init() /* dynamically loaded controller */

        App.sts(// add first System Status message
            app.config.backend.op,
            app.config.backend.msg,
            l10n.stsOK,
            app.config.backend.time
        )
        app.config.extjs.launch = null
        delete app.config.extjs.launch
        delete app.config.backend.op
        delete app.config.backend.msg
        delete app.config.backend.time

        App.doCheckBackend = app.backend_check
        App.doRestartBackend = app.backend_restart
        App.doTerminateBackend = app.backend_terminate

        delete app.backend_check
        delete app.backend_restart
        delete app.backend_terminate
        delete app.extjs_load
    }
}
})(window.console)
