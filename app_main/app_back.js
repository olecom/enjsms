(function uglify_js_closure(con ,process){
var cfg ,ctl
   ,ipt = require('util').inspect
   ,text_plain = { 'Content-Type': 'text/plain; charset=utf-8' }
   ,app_json   = { 'Content-Type': 'application/json; charset=utf-8' }

function _log(m){ con.log(m) }
function _err(e){ con.error(e) }

    function run_backend(){
        _log('^ app is starting http @ port ' + cfg.backend.job_port + '\n' +
                new Date().toISOString()
        )
        //_err('error check')
        run_app()
    }

require('http').ServerResponse.prototype.json =
/*  res.json({ success: true })
 *  res.json('{ "success": true }')
 *  res.json(401, { msg: ' Authorization Required' })
 */
function res_json(obj){
    if(2 == arguments.length){// args: status / body
        this.statusCode = obj
        obj = arguments[1]
    }
    if('string' != typeof obj) obj = JSON.stringify(obj)
    this.setHeader('Content-Length', obj.length)
    this.writeHead(this.statusCode, app_json)
    this.end(obj)
}

/*`connect` for business logic as from node-webkit(local UI)
 * as from regular HTTP (localhost or any host)
 */

function run_app(){
var utils  = require('connect/lib/utils.js')
   ,connect = require('connect')
   ,app = connect()

    /* Application middleware setup */

    app.use(connect.cookieParser())
    app.use(connect.json())
    app.use(mwPostTextPlain)

    /* backend static: for non localhost users */
    remote_extjs_cfg()
    app.use('/app_back.js' ,mwAssume404)

    /* have `session` after `static`, to prevent needless work */
    // TODO!!!: .use(require('connect.session')({secret: cfg.backend.sess_puzl}))
    //,MongoStore = require('connect-mongo')(express)

// TODO: require plugins here
/* https://github.com/caulagi/sntd/blob/master/config/express.js */
/*/ Bootstrap models
    var models_path = __dirname + '/app/models'
    fs.readdirSync(models_path).forEach(function (file) {
        if (~file.indexOf('.js')) require(models_path + '/' + file)
    })*/

    /* Finally, error middleware setup */
    app.use(function mwErrorHandler(err, req, res, next){
            if(!err) return next()
            if (err.status) res.statusCode = err.status
            if (res.statusCode < 400) res.statusCode = 500
            _err('ErrorHandler:')
            err.url = req.url
            err = ipt(err, { depth: 4 })
            _err(err)
            res.writeHead(res.statusCode, res.ContentTypes.TextPlain)
            return res.end(err)//XXX frontend must wrap this in pretty UI
        })
       .use(mwAssume404)// no middleware handled request
    .listen(cfg.backend.job_port ,app_is_up_and_running)
    return

    function remote_extjs_cfg(){
        var fs = require('fs')
        if(cfg.extjs.pathFile){
            cfg.extjs.path = fs.readFileSync(cfg.extjs.pathFile).toString().trim()
        }
        app.use('/extjs/' ,connect['static'](__dirname + '/' + cfg.extjs.path))
        cfg.extjs.path = 'extjs/'// switch local to external path
        app.use('/app.config.extjs.json' ,function($ ,res){ res.json(cfg.extjs) })
    }

   function app_is_up_and_running(){
        _log('^ app is up and running\n' +
            new Date().toISOString()
        )
    }

    function mwAssume404(req, res){
        res.writeHead(res.statusCode = 404, text_plain)
        return res.end(
            'URL: ' + req.originalUrl + '\n\n' +
            'Not found'
        )
    }

    function mwPostTextPlain(req, res, next){
        if (req._body) return next()
        var limit = connect.limit('4mb')
        if('text/plain' == utils.mime(req))
            return limit(req, res
        ,function(err){
          if(err) return next(err)
          var buf = ''
          req.setEncoding('utf8')
          req.on('data', function(chunk){ buf += chunk })
          req.on('end', function(){
              req.body = { plain_text: buf }
              next()
          })
          return req._body = true
        })
        return next()
    }
}

/*==============================================================================
\  / Process control http channel.
 \/  This: child.kill([signal]), where signals can be 'SIGTERM' or 'SIGHUP' etc.
 /\  is very old non cross platform way of child process control.
 \/
 /\  Here we have HTTP server on controlling port
/  \
================================================================================*/

process.on('uncaughtException', function(err){
    _log('Caught exception: ' + err.stack)
})

process.on('exit', function process_exit(){
    _log('$ backend process exit event')
})


try {
    cfg = JSON.parse(process.env.NODEJS_CONFIG)
} catch(ex){
    cfg = (new Function('var config ; return ' + process.env.NODEJS_CONFIG))(ex)
}

ctl = require('http').createServer(
function proc_ctl_http_serv(req, res){
    var body = ''

    res.on('close', proc_ctl_res_unexpected_close)

    _log('ctl req url:' + req.url)
    if ('/sts_running' == req.url){
    } else if ('/cmd_exit' == req.url){
        process.nextTick(function(){
            process.exit(0)
        })
        body += '$ is going down'
    } else if ('/cmd_stat' == req.url){
        body += Math.ceil(process.uptime()) + '\n' + ctl.toISOString()
    } else {// show some info about this
        body += '? pid: ' + process.pid +
        '\ncontrol channel resourses:\n' +
        '\n"sts_running", "cmd_stat", "cmd_exit"' +
        '\n\n' +
        'application under control is at HTTP port: ' + cfg.backend.job_port + '\n'
    }
    res.writeHead(200 ,{ 'Content-Length': body.length ,'Content-Type': 'text/plain' })
    res.end(body)
})

ctl.on('listening',
function proc_ctl_http_serv_listening(){
    ctl = new Date()// fill `ctl` as running flag
    _log(
        '^ backend http proc ctl @ http://127.0.0.1:' + cfg.backend.ctl_port + '\n' +
        ctl.toISOString()
    )
})

ctl.on('error',
function proc_ctl_http_serv_error(e){
// NOTE: net error handler must not be inside init(listen) callback!!!
    if('EADDRINUSE' == e.code){// 'EADDRNOTAVAIL'?
        _err(
            "!!! FATAL(ctl): can't listen host:port='127.0.0.1':" + cfg.backend.ctl_port +
            "\n" + ipt(e) +
            "\nNOTE: check config 'ctl_port' option collision"
        )
    } else {//FIXME: handle all fatal errors to unset `ctl` and process.exit()
        _err("! ERROR(ctl) controlling http channel: " + ipt(e))
    }
    if (!ctl) process.exit(1)
})

ctl.on('clientError',
function proc_ctl_client_error(e, sock){
    _err("! ERROR(ctl) in client connection: " + ipt(e))
})

function proc_ctl_res_unexpected_close(){
    _err('! ERROR(ctl) aborted request')
}

ctl.listen(cfg.backend.ctl_port ,'127.0.0.1' ,run_backend)
ctl.unref()// "allow the program to exit if this is the only active server in the event system"
ctl = null// setup is over, waiting for 'listening' event, `ctl` is running flag
})(console ,process)
