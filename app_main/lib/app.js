/*
 * Business logic HTTP API served by `connectjs` for node-webkit(local UI)
 * and for browsers(remote UI)
 */

function runApp(){
var api      = require('./api.js')
   ,sendFile = require('./middleware/sendFile.js')
   ,_404     = require('./middleware/404.js')
   ,connect = api.connect = require('connect')
   ,app     = api.app = connect()
   ,cfg     = api.cfg

    /* `l10n` files middleware factory for app modules */
    api.mwL10n = require('./middleware/l10n.js')

    /* Add own middlewares */

    connect.sendFile = sendFile
    connect._404 = _404

    /* Application middleware setup */

    app.use(connect.cookieParser())
    app.use(connect.json())
    app.use(require('./middleware/postTextPlain.js'))

    /* ExtJS for HTTP users */
    remote_extjs_cfg()

    app.use('/app_back.js' , _404)// hide
    app.use('/app_front.js' , sendFile('app_front_http.js'))

    /* TODO: save and load session info from files
     *connect.session.MemoryStore.prototype.loadSync
     *connect.session.MemoryStore.prototype.saveSync = function(path){
     *   log('this.sessions: ', this.sessions, '\n')
    }*/

    app.use(connect.session({
        secret: cfg.backend.sess_puzl
       ,generate: function(req, res){
            return !req.session && req.url === '/login'
        }
       ,cookie:{
           /*
            * `maxAge: null` browser lifetime session
            * But: to enable UI to remove session on any unload/close event
            *      see `Ext.EventManager.onWindowUnload` @
            *      app_modules\userman\controller\Login.js
            **/
            maxAge: cfg.backend.hasOwnProperty('sess_maxage') ?
                    cfg.backend.sess_maxage : 1 << 25// 9.3 hours ~one working day
       }
       //,store = require('connect-mongo')(app)
    }))

    require('../../app_modules')(api)

    /* backend static files for HTTP users */
    app.use('/' ,connect['static'](__dirname + '/..', { index: 'app.htm' }))

    app.use('/test.js' , sendFile('test.js'))
    /* final stage: error path */
    app.use(require('./middleware/errorHandler.js'))
       .use(_404)// no middleware handled request
    .listen(cfg.backend.job_port ,function app_is_up_and_running(){
        log('^ app is up and running\n' +
            new Date().toISOString()
        )
    })
    .timeout = (1 << 23)// default timeout for long events waitings requests
    return

    function remote_extjs_cfg(){
    var fs = require('fs')
        if(cfg.extjs.pathFile){
            cfg.extjs.path = fs.readFileSync(cfg.extjs.pathFile).toString().trim()
        }
        cfg.extjs.path = __dirname + '/../../' + cfg.extjs.path
        app.use('/extjs/'                  ,connect['static'](cfg.extjs.path))
        app.use('/extjs/docs/extjs-build/' ,connect['static'](cfg.extjs.path))
        cfg.extjs.path = 'extjs/'// switch local to external path
        app.use('/app.config.extjs.json' ,function($ ,res){ res.json(cfg.extjs) })
    }
}

module.exports = runApp
