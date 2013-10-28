(function uglify_js_closure(con ,process){
var devel = true
var app

    // two parts: under `node-webkit` and `express` in browser

    if(typeof process != 'undefined'){
        app = { // configuration placeholders
            tray: { obj: null ,stat: 'show' },
            w: null,
            config: null //{ db: null ,extjs:null }
            ,user: { id: 'olecom' ,name:'Олег Верич' ,role:'склад' }//TODO:login
            ,role: { va_permissions: null }
            //,tools: { /*load_extjs: null*/ }
        }
        node_webkit(con ,app)
    }
    //else 'node_express'

/*
 * front end: node-webkit part
 */
function node_webkit(con ,app){
    var gui = require('nw.gui')
    app.w = gui.Window.get()
    //if(devel) app.w.showDevTools()

    setup_tray(app.tray ,app.w)

    load_config(app) && extjs_load(app.w.window.document ,app.w.window)

    return

function load_config(app){// loaded only by main process -- node-webkit
    var cfg
    var fs = require('fs')

    if((cfg = process._nw_app.argv[0])){// cmd line
        cfg = 'config/' + cfg
    } else {// HOME config
        if(process.env.HOME){
            cfg = process.env.HOME
        } else if(process.env.HOMEDRIVE && process.env.HOMEPATH){
            cfg = process.env.HOMEDRIVE +  process.env.HOMEPATH
        }
        cfg = cfg + '/.enjsms.js'//FIXME: app specific part
        try {
            fs.statSync(cfg)
        } catch (ex){
            cfg = null
        }
    }
    if(!cfg)// default
        cfg = 'config/cfg_default.js'

    try {
        app.config = (
            new Function('var config ; return ' +
                          fs.readFileSync(cfg ,'utf8'))
        )()
    } catch(ex){
        con.error('ERROR load_config:' + (cfg = (' ' + cfg + '\n' + ex)))
        app.w.window.alert(l10n.configLoadError + cfg)
        return false
    }
    con.log('reading config: ' + cfg + ' done')
    return true
}

function setup_tray(t ,w){
    t.obj = new gui.Tray({ title: l10n.tray.title ,icon: 'app_main/images/favicon.png' })
    t.obj.tooltip = l10n.tray.winvis

    t.obj.on('click' ,function onTrayClick(){
        if('show' == t.stat){// simple show,focus / hide
            t.stat = 'hide'
            t.obj.tooltip = l10n.tray.wininv
            w.hide()
        } else {
            w.show()
            t.obj.tooltip = l10n.tray.winvis
            t.stat = 'show'
        }
    })
    con.log('setup_tray: done')
}
}// nw

/*
 * common tools for `nw` && `express` front ends
 */

function extjs_load(doc ,w){
var extjs, path

    path = devel ? '../../../ext-4.2.1.883/' : 'extjs/'
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
        if('undefined' != typeof Ext){
            clearInterval(extjs)
            path = Ext.Loader.getPath('Ext')
            con.log(
                'ExtJS version: ' + Ext.getVersion('extjs') + '\n' +
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
            w.alert(l10n.extjsNotFound)
            return
        }
        path = path.slice(1)
    }, 1024)
    con.log('load_extjs: done, waiting for ExtJS')
}

function extjs_launch(){
    Ext.state.Manager.setProvider(new Ext.state.CookieProvider())

    //TODO: for each app.config.app.modules load module
    //TODO: dynamic addition in toolbar or items/xtype construction
    //global `App` object is available now
    app.config.extjs = null // clear ref for GC
    App.config = app.config ,App.user = app.user ,App.role = app.role
    //TODO: events via long pooling from app_backend/express
    //App.sync_clearTimeout = Ext.defer(App.sync_extjs_nodejs, 3777)

    // very strange composition to get gears to fadeOut and viewport to fadeIn
    var b = Ext.getBody()
    b.fadeOut({duration:777 ,callback: function(){
        Ext.fly('startup').remove()
        b.show()
        Ext.create('App.view.Viewport')
        b.fadeIn({easing:'easeIn' ,duration:1024})
        con.log('extjs: faded In')
    }})
    con.log('extjs_launch: OK')
}

})(console ,process)
