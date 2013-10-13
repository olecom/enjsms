(function uglify_js_closure(con ,process){
var devel = true
var app

    // two parts: under `node-webkit` and `express` in browser

    if(typeof process != 'undefined'){
        app = { // configuration placeholders
            tray: { obj: null ,stat: 'show' },
            w: null,
            config: null //{ db: null ,extjs:null }
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
    app.w.showDevTools()

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
        cfg = cfg + '/.enjsms.js'
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
            new Function('return (function(){ var config ; return ' +
                          fs.readFileSync(cfg ,'utf8') + '})()')
        )()
    } catch(ex){
        con.error('ERROR load_config:' + ex + '\n' + ex+ '\n' + cfg)
        app.w.window.alert(l10n.configLoadError + '\n' + ex + '\n' + cfg)
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

    w.addEventListener('load' ,(extjs = function(){
        w.removeEventListener('load' ,extjs)
        if('undefined' != typeof Ext){
            path = Ext.Loader.getPath('Ext')
            con.log(
                'ExtJS version: ' + Ext.getVersion('extjs') + '\n' +
                'ExtJS is at <' + path + '>'
            )
            Ext.Loader.setPath('Ext.ux', path + '/../examples/ux')
            Ext.Loader.setPath('Ext.uxo', app.config.extjs.appFolder + '/uxo')
            app.config.extjs.launch = extjs_launch
            Ext.application(app.config.extjs)
            app.config.extjs.launch = null // clear ref for GC
        } else {
            con.error(l10n.extjsNotFound)
            w.alert(l10n.extjsNotFound)
        }
    }))
    con.log('load_extjs: done, waiting for ExtJS')
}

function extjs_launch(){
    Ext.fly('startup').remove()
    con.log('extjs_launch: OK')

    // All the paths for custom classes
    //,paths: {
    //        'Ext.ux': 'extjs/examples/ux'
    //    }

      //global `App` object is available now
  //  App.sync_clearTimeout = Ext.defer(App.sync_extjs_nodejs, 3777)
}

})(console ,process)
