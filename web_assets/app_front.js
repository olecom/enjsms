
// two parts: under node-webkit and in simple browser

var devel = true
var gui = require('nw.gui')
var app = {
    tray: { obj: null ,stat: 'show' },
    w: null,
    config: { ExtApp: null }
}
var tools = {}

l10n = {
    tray: {
        title: 'SMSки'
        ,winvis: 'SMSки работают (окно видно)'
        ,wininv: 'SMSки работают (окно скрыто)'
    }
    ,extjsNotFound:
        'Не найден или не загрузился "ExtJS" (визуальная библиотека).\n' +
        'Нужно проверить конфигурацию программы "enjsms".'
    ,configLoadError:
        'Ошибка при чтении файла конфигурации!'
}

tools_common_uglify_js_closure(console ,app)

;(function node_webkit_uglify_js_closure(con ,app ,gui ,tools){
    app.w = gui.Window.get()
    app.w.showDevTools()

    setup_tray(app.tray ,app.w)

    load_config(app) && tools.load_extjs(app.w.window.document ,app.w.window)
    return

function load_config(app){
    var cfg
    var fs = require('fs')

    if(process._nw_app && (cfg = process._nw_app.argv[0])){// cmd line
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
    t.obj = new gui.Tray({ title: l10n.tray.title ,icon: 'web_assets/images/favicon.png' })
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
})(console ,app ,gui ,tools)

//common

//;(
function tools_common_uglify_js_closure(con ,app){

    tools.load_extjs = load_extjs
    return

function load_extjs(doc ,w){
var extjs, path

    path = devel ? '../../../ext-4.2.1.883/' : 'extjs/'
    extjs = doc.createElement('link')
    extjs.setAttribute('rel', 'stylesheet')
    extjs.setAttribute('href', path + 'resources/css/ext-all.css')
    doc.head.appendChild(extjs)

    extjs = doc.createElement('script'),
    extjs.setAttribute('type' ,'application/javascript')
    extjs.setAttribute('charset' ,'utf-8')
    extjs.setAttribute('src' , path + 'ext-all.js')
    doc.head.appendChild(extjs)

    w.addEventListener('load' ,(extjs = function(){
        w.removeEventListener('load' ,extjs)
        if('undefined' != typeof Ext){
            con.log('ExtJS version: ' + Ext.getVersion('extjs'))
            //Ext.application(app.configExtApp)
        } else {
            con.error(l10n.extjsNotFound)
            w.alert(l10n.extjsNotFound)
        }
    }))
    con.log('load_extjs: done, waiting for ExtJS')
}
}
//)(console ,app)
