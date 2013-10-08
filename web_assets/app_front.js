
// two parts: under node-webkit and in simple browser

var devel = true
var gui = require('nw.gui')
var app = {
    tray: { obj: null ,stat: 'show' },
    w: null,
    configExtApp: null
}

l10n = {
    tray: {
        title: 'SMSки'
        ,winvis: 'SMSки работают (окно видно)'
        ,wininv: 'SMSки работают (окно скрыто)'
    }
    ,extjsNotFound:
        'Не найден или не загрузился "ExtJS" (визуальная библиотека).\n' +
        'Нужно проверить конфигурацию программы "enjsms".'
}

;(function node_webkit_uglify_js_closure(con ,app ,gui){
    app.w = gui.Window.get()
    app.w.showDevTools()

    setup_tray(app.tray ,app.w)
    load_extjs(app.w.window.document ,app.w.window)

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
})(console ,app ,gui)

//common
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
            console.log('ExtJS version: ' + Ext.getVersion('extjs'))
            //Ext.application(app.configExtApp)
        } else {
            console.err(l10n.extjsNotFound)
            w.alert(l10n.extjsNotFound)
        }
    }))
    console.log('load_extjs: done, waiting for ExtJS')
}


// for express part:
/*

//  TODO; move after express setup      xhr.open('HEAD' ,'extjs/ext-all-debug.js' ,false) ,xhr.send()
        if('undefined' != typeof global) try {
            global.require('app_back.js')
        } catch (e) {
            start_failed('Работа программы не возможна. Отсуствует или повреждён файл `app_back.js`')
            return
        }
*/