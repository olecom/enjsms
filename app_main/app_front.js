(function uglify_js_closure(con ,doc ,win ,l10n){
var devel = true
var app = { // configuration placeholders
        config: null //{ db: null ,extjs:null }
        ,user: { id: 'olecom' ,name:'Олег Верич' ,role:'склад' }//TODO:login
        ,role: { va_permissions: null }
        //,tools: { /*load_extjs: null*/ }
    }
    /* two frontend parts: under `node-webkit` and `connectjs` in browser */

    if(typeof process != 'undefined'){// `nodejs` runtime inside HTML (native desktop)
        app.process = process
        app.c_p = require('child_process')
        app.tray = { obj: null ,stat: 'show' }
        app.versions = { node: '' ,connectjs: '' }
        app.w = app.backend_check = app.backend_restart = app.backend_terminate = null

        // start local ExtJS 'App'
        check_versions(node_webkit)
        return
    } else {// 'nodejs + connectjs': XHR communication with backend (remote web browser)
        var xhr = new XMLHttpRequest()
        xhr.open('GET' ,'/app.config.extjs.json' ,true)
        xhr.onreadystatechange = function(){
            if(4 == xhr.readyState){
                if(200 != xhr.status){
                    con && con.error && con.error(l10n.errload_config_read)
                    doc.write(l10n.errload_config_read)
                    alert(l10n.errload_config_read)
                } else {// start external/remote ExtJS 'App'
                    app.config = { extjs: JSON.parse(xhr.responseText) }
                    app.config.backend = {// record start time
                        time: new Date,
                        msg: l10n.stsBackendXHR,
                        op: l10n.stsCheck
                    }
                    extjs_load(doc ,win)
                }
            }
        }
        xhr.send(null)
    }
    return
/*
 * front end: node-webkit part
 */
function check_versions(cb){
    app.c_p.exec('node --version',
    function(err, stdout){
        if(err){
            con.error("ERROR spawn `node` process: " + err)
            doc.write(l10n.errload_spawn_backend)
            app.w.window.alert(l10n.errload_spawn_backend)
            return
        }
        app.versions.node = stdout.slice(1)

    app.c_p.exec("node -e \"console.log(require('connect').version)\"",
    function(err, stdout){
        if(err){
            con.error("ERROR require('connect'): " + err)
            doc.write(l10n.errload_spawn_backend)
            app.w.window.alert(l10n.errload_spawn_backend)
            return
        }
        app.versions.connectjs = stdout
        if(typeof Ext != 'undefined'){
            App.cfg.backend.versions.connectjs = app.versions.connectjs
            App.cfg.backend.versions.node = app.versions.node
            Ext.globalEvents.fireEvent('updateVersions')
        }
        cb(app, con)// node_webkit(app, con) || spawn_backend(app, true)
    })//connectjs
    })//node.js
}

function node_webkit(app, con){
    //TODO: wrap `uncaughtException` in ExtJS window, add xhr to backend
    app.process.on('uncaughtException' ,function(err){
        con.error('uncaughtException:', err)
        con.error(err.stack)
        alert(l10n.uncaughtException  + err)
    })

    var gui = require('nw.gui')
       ,http = require('http')

    app.w = gui.Window.get()

    //if(devel) app.w.showDevTools()

    setup_tray(app.tray ,app.w)

    // long xhr pooling gets messages from backend
    load_config(app) && http.get(
        "http://127.0.0.1:" + app.config.backend.ctl_port
        ,backend_is_running
    ).on('error'
        ,backend_ctl_errors
    )
    app.backend_check = check_backend
    app.backend_restart = restart
    app.backend_terminate = terminate
    return

function backend_is_running(res){
    res.setEncoding('utf8')
    res.on('data', function(chunk){
        var pid = chunk.slice(7).replace(/\n[\s\S]*/g, '')// remove '? pid: '

        app.config.backend.time = new Date
        app.config.backend.msg = l10n.stsBackendPid(pid)
        app.config.backend.pid = pid
        app.config.backend.url = 'http://127.0.0.1:' + app.config.backend.job_port
        app.config.backend.op = l10n.stsCheck

        get_remote_ip(extjs_load)
        con.log('reload just extjs, backend is up and running already')
    })
}

function backend_ctl_errors(e){
    if("ECONNRESET" == e.code){
        con.log('backend_ctl_errors: prev. backend connection has been reset, ignore')
        return
    }

    if(app.config.extjs){// run setup only first time after ctl check
        spawn_backend(app)
        con.log('backend spawned && extjs load as callback')
        return
    }
    // ignore other errors for now
    con.warn('backend_ctl_errors():')
    con.dir(e)
}

function spawn_backend(app, restart){
// loads `node`+`connect` as separate process and answers on http requests,
// as for this `nw` instance, as for remote clients
// closing `nw` doesn't mean closing backend processing (maybe cfg it?)

    var fs = require('fs')
        ,log
        ,backend

    try {// check and/or create log dir
        if(!fs.statSync(app.config.log).isDirectory()){
            con.error('ERROR log dir is not a directory')
            log = l10n.errload_config_log_not_dir + app.config.log
            doc.write(log)
            app.w.window.alert(log)
            return false
        }
    } catch(ex){
        try {
            fs.mkdirSync(app.config.log)
        } catch(ex) {
            con.error('ERROR log dir:' + (ex = (' ' + app.config.log + '\n' + ex)))
            log = l10n.errload_config_log_mkdir + ex
            doc.write(log)
            app.w.window.alert(log)
            return false
        }
    }

    log = app.config.log +
          app.config.backend.file.replace(/[\\/]/g ,'_') + '.log'

    backend = app.c_p.spawn(
        'node'
        ,[ app.config.backend.file ]
        ,{
             detached: true
            ,env: {
                NODEJS_CONFIG: JSON.stringify(app.config)
            }
            ,stdio: [ 'ignore'
                ,fs.openSync(log ,'a+')
                ,fs.openSync(log ,'a+')
            ]
        }
    )
    if(!backend.pid || backend.exitCode){
        con.error('ERROR spawn backend exit code: ' + backend.exitCode)
        log = l10n.errload_spawn_backend + backend.exitCode
        doc.write(log)
        app.w.window.alert(log)
        return false
    }
    backend.unref()

    app.config.backend.time = new Date
    app.config.backend.msg = l10n.stsBackendPid(backend.pid),
    app.config.backend.pid = backend.pid
    app.config.backend.url = 'http://127.0.0.1:' + app.config.backend.job_port
    app.config.backend.op = l10n.stsStart
    con.log('backend.pid: ' + backend.pid)

    if(restart){
        setTimeout(check_backend, 4321)// restart, wait a bit
    } else {
        check_backend(get_remote_ip, null)// start
    }

    return true
}

function get_remote_ip(){
    app.c_p.exec('ipconfig',
    function(err, stdout){
        if(!err){
            err = stdout.match(/^[\s\S]*IPv4-[^:]*: ([^\n]*)\n/)
            if(err) app.config.backend.url = app.config.backend.url
                .replace(/127\.0\.0\.1/, err[1])
        }
        extjs_load(app.w.window.document ,app.w.window)
    })
}

function check_backend(check_ok, check_he){
    con.log('check backend port: ' + app.config.backend.ctl_port)
    if(!check_ok && !app.config.backend.pid){// not restart, check if dead
        App.sts(l10n.stsCheck, l10n.stsDead, l10n.stsHE)
        return
    }
    http.get(
        "http://127.0.0.1:" + app.config.backend.ctl_port
        ,check_ok ? check_ok : backend_ctl_alive
    ).on('error'
        ,check_he ? check_he : backend_ctl_dead
    )
}

function backend_ctl_alive(res, callback){
    res.setEncoding('utf8')
    res.on('data', function (chunk){
        var pid = parseInt(chunk.slice(7).replace(/\n[\s\S]*/g, ''), 10)// remove '? pid: '

        if(app.config.backend.pid != pid){
            con.warn('app.config.backend.pid != pid:'+ app.config.backend.pid + ' ' + pid)
            app.config.backend.pid = pid
        }
        App.sts(l10n.stsCheck, pid + ' - ' + l10n.stsAlive, l10n.stsOK)
        if(callback) callback()
    })
}

function backend_ctl_dead(e){
    if(e && "ECONNRESET" == e.code){
        con.log('backend_ctl_dead: prev. backend connection has been reset, ignore')
        return
    }

    con.log('check: backend is dead')

    if('undefined' == typeof App){// init
        win.setTimeout(function backend_init_check(){
            if(app.config.backend.pid)
                app.config.backend.pid = null
            throw new Error(l10n.errload_check_backend)
        }, app.config.backend.init_timeout || 1234)
    } else {// keep UI, if loaded
        App.sts(l10n.stsCheck, l10n.stsAlive, l10n.stsHE)
    }
}

function restart(){
    con.log('restart: check, spawn, check')
    check_backend(check_ok, check_he)

    function check_ok(res){
        backend_ctl_alive(res, request_cmd_exit)
    }

    function check_he(e){
        if(e){
            if(e && "ECONNRESET" == e.code){
                con.log('reload: prev. backend connection has been reset, ignore')
                return
            }
            con.error('check_he(error):')
            con.dir(e)
        }

        if(app.config.backend.pid)
            app.config.backend.pid = null

        App.sts(l10n.stsCheck, l10n.stsAlive, l10n.stsHE)
        App.sts(l10n.stsStart, l10n.stsRestarting, l10n.stsOK)
        con.log('restart: backend is dead; starting new')
        load_config(app) && check_versions(spawn_backend)
    }

    function request_cmd_exit(){
        con.log('request_cmd_exit ctl_port: ' + app.config.backend.ctl_port)
        http.get(
            "http://127.0.0.1:" + app.config.backend.ctl_port + '/cmd_exit'
            ,reload_ok_spawn
        ).on('error' ,check_he)
    }

    function reload_ok_spawn(){
        con.log('reload_ok_spawn()')
        App.sts(l10n.stsStart, l10n.stsRestarting, l10n.stsOK)
        setTimeout(
            function spawn_reloaded_backend(){
                load_config(app) && check_versions(spawn_backend)
            }
            ,2048
        )
    }
}

function terminate(){
    if(!app.config.backend.pid) return App.sts(
        l10n.stsCheck, l10n.stsKilledAlready, l10n.stsOK
    )

    return http.get(// get current pid
        "http://127.0.0.1:" + app.config.backend.ctl_port
        ,backend_get_current_pid
    ).on('error' ,backend_ctl_killed)

    function backend_get_current_pid(res){
        App.sts(l10n.stsKilling, l10n.stsCheck,l10n.stsOK)

        res.setEncoding('utf8')
        res.on('data'
       ,function(chunk){
            var pid  = chunk.slice(7).replace(/\n[\s\S]*/g, '')// remove '? pid: '
               ,path = app.process.cwd()

            path += path.indexOf('/') ? '/' : '\\'// add OS-specific slash
            if(pid != app.config.backend.pid)
                con.warn('current pid != app.config.backend.pid; kill anyway!'),
            app.config.backend.pid = pid
            app.c_p.exec(
               'wscript terminate.wsf ' + pid,
                defer_request_check_kill
            )
        })
    }
}

function defer_request_check_kill(err){
    var msg = app.config.backend.pid + ' ' + l10n.stsKilling
    if(err){
        con.error(err)
        App.sts(l10n.stsKilling, msg, l10n.stsHE)
        return
    }
    App.sts(l10n.stsKilling, msg, l10n.stsOK)

    setTimeout(
        function send_check_request(){
            http.get(
                "http://127.0.0.1:" + app.config.backend.ctl_port
                ,backend_ctl_not_killed
            ).on('error' ,backend_ctl_killed)
        }
        ,2048
    )
}

function backend_ctl_not_killed(income){
    con.dir(income)
    App.sts(l10n.stsCheck, l10n.stsAlive, l10n.stsHE)
}

function backend_ctl_killed(e){
    if(e && "ECONNRESET" == e.code){
        con.log('backend_ctl_killed: prev. backend connection has been reset, ignore')
        return
    }

    var m, log = 'backend is killed'
    if(app.config.backend.pid){
        app.config.backend.pid = null
        m =  l10n.stsKilled
    } else {
        m = l10n.stsKilledAlready
        log += ' already'
    }
    App.sts(l10n.stsCheck, m, l10n.stsOK)
    con.log(log)
}

function load_config(app){// loaded only by main process -- node-webkit
    var cfg
    var fs = require('fs')

    if((cfg = app.process._nw_app.argv[0])){// cmd line
        cfg = 'config/' + cfg
    } else {// HOME config
        if(app.process.env.HOME){
            cfg = app.process.env.HOME
        } else if(app.process.env.HOMEDRIVE && app.process.env.HOMEPATH){
            cfg = app.process.env.HOMEDRIVE +  app.process.env.HOMEPATH
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
        cfg = l10n.errload_config_read + cfg
        doc.write(cfg)
        app.w.window.alert(cfg)
        return false
    }

    app.config.backend.time = null
    app.config.backend.versions = {
        node: app.versions.node,
        connectjs: app.versions.connectjs,
        nw: app.process.versions['node-webkit']
    }

    con.log('reading config: ' + cfg + ' done')

    return check_extjs_path()
}

function check_extjs_path(){// find local ExtJS in and above cwd './'
    var fs = require('fs'), pe = '../', d = '', i, p
       ,ef = app.config.extjs.pathFile
       ,extjs_path

    /* lookup extjs.txt first */
    try{
        extjs_path = fs.readFileSync(ef).toString().trim()
    } catch(ex){
        if(app.config.extjs.path){
            extjs_path = app.config.extjs.path
            d += 'c'
        } else {
            ex.message += '\n\n' + l10n.extjsPathNotFound(ef)
            throw ex
        }
    }
    if('/' != extjs_path[extjs_path.length - 1]) extjs_path += '/'

    i = 7
    do {
       try{
            p = fs.statSync(extjs_path)
        } catch(ex){ }
        extjs_path = pe + extjs_path// add final level from `app_main` anyway
        if(p){
            fs.writeFileSync(ef, extjs_path)
            break
        }
    } while(--i)

    while(1){
        if(p){
            d = ''
            break
        }
        if(d){/* no 'extjs.txt' file, and cfg failed */
            d = l10n.extjsPathNotFound(ef, app.config.extjs.path, 1)
            break
        }

        if(app.config.extjs.path){
            extjs_path = app.config.extjs.path
            if('/' != extjs_path[extjs_path.length - 1]) extjs_path += '/'
        } else {/* no `extjs.txt` && no cfg value */
            d = l10n.extjsPathNotFound(ef, app.config.extjs.path, 2)
            break
        }
        i = 7, p = null
        do {
            try{
                p = fs.statSync(extjs_path)
            } catch(ex){ }
            extjs_path = pe + extjs_path
            if(p) break
        } while(--i)
        if(p){
            fs.writeFileSync(ef, extjs_path)
            break
        }
        d = l10n.extjsPathNotFound(ef, app.config.extjs.path)
        break
    }
    if(!d){
        app.config.extjs.path = extjs_path
        con.log('ExtJS path found: "' + extjs_path + '"')
        return true
    }
    con.error('ExtJS path not found')
    doc.getElementById('e').style.display = "block"
    doc.getElementById('d').innerHTML = d.replace(/\n/g, '<br>')
    return false
}

function setup_tray(t ,w){
    t.obj = new gui.Tray({ title: l10n.tray.title ,icon: 'app_main/css/favicon.png' })
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
        if('undefined' != typeof Ext){
            clearInterval(extjs)
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
        path = path.slice(1)
    }, 1024)
    con.log('load_extjs: done, waiting for ExtJS')
}

function extjs_launch(){
    var me = this
    //Ext.state.Manager.setProvider(new Ext.state.CookieProvider)
    // handle errors raised by Ext.Error.raise()
    Ext.Error.handle = function(err){
        //TODO: error list, kebab's popup with extdesk gears to show them
        return !con.warn(err)
    }

    //TODO: for each app.config.app.modules load module
    //TODO: dynamic addition in toolbar or items/xtype construction
    //global `App` object is available now
    App.cfg = app.config ,App.user = app.user ,App.role = app.role
    //TODO: events via long pooling from app_backend/express
    //App.sync_clearTimeout = Ext.defer(App.sync_extjs_nodejs, 3777)

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
    //app.config.extjs = null// clear ref for GC
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
        delete app.config.backend.op
        delete app.config.backend.msg
        delete app.config.backend.time

        App.doCheckBackend = app.backend_check
        App.doRestartBackend = app.backend_restart
        App.doTerminateBackend = app.backend_terminate

        delete app.backend_check
        delete app.backend_restart
        delete app.backend_terminate
    }
}

})(console ,document ,window ,l10n)
