(function uglify_js_closure(con ,process){
var cfg = JSON.parse(process.env.NODEJS_CONFIG) ,ctl
var ipt = require('util').inspect
    function run_backend(){
        con.log('^ app is starting http @ port ' + cfg.backend.job_port + '\n' +
                new Date().toISOString()
        )
        //con.error('error check')
        run_express_app()
    }

//express for business logic as from node-webkit(local UI) as from regular HTTP (localhost or any host)

function run_express_app(){
var express = require('express')//,MongoStore = require('connect-mongo')(express)
    ,utils  = require('express/node_modules/connect/lib/utils.js')
    ,_limit = require('express/node_modules/connect/lib/middleware/limit.js')
    ,putf = { 'Content-Type': 'text/plain; charset=utf-8' }
    ,app

    /* Application middleware setup */
    app = express()
        .use(express.cookieParser())
        .use(express.session({secret: cfg.backend.sess_sec}))
        .use(express.json())
        .use(mwPostTextPlain)

    /* HTTP routing: app.get, app.post, etc. are called here */
    app .use(app.router)

    /* backend static: for non localhost users */
    app.use('/app_back.js' ,mwAssume404)
    app.use('/' ,express.static(__dirname))
    app.use('/extjs/' ,express.static(__dirname + '/' + cfg.extjs.path))
    cfg.extjs.path = 'extjs/'

/* https://github.com/caulagi/sntd/blob/master/config/express.js */
/*/ Bootstrap models
    var models_path = __dirname + '/app/models'
    fs.readdirSync(models_path).forEach(function (file) {
        if (~file.indexOf('.js')) require(models_path + '/' + file)
    })*/

//TODO: mount plugin/app backends
// Modular web applications with Node.js and Express http://vimeo.com/56166857
// from tjholowaychuk

    /* Finally, error middleware setup */
    app .use(function mwErrorHandler(err, req, res, next){
        if(!err) return next()
        if (err.status) res.statusCode = err.status
        if (res.statusCode < 400) res.statusCode = 500
        con.error(ipt(err) + ' (internal backend error)')
        res.writeHead(res.statusCode, putf)
        return res.end(err.stack)// frontend must wrap this in pretty UI
    })
    .use(mwAssume404)
    .listen(cfg.backend.job_port ,app_is_up_and_running)
    return

    function app_is_up_and_running(){
        con.log('^ app is up and running\n' +
            new Date().toISOString()
        )

        app.get('/app.config.extjs.json' ,function(req, res){
            res.json(cfg.extjs)
        })
    }

    function mwAssume404(req, res){// no middleware handled request
        res.writeHead(res.statusCode = 404, putf)
        return res.end(
            'URL: ' + req.originalUrl + '\n\n' +
            'Not found'
        )
    }

    function mwPostTextPlain(req, res, next){
        if (req._body) return next()
        var limit = _limit('4mb')
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
    con.log('Caught exception: ' + err.stack)
})

process.on('exit', function process_exit(){
    con.log('$ backend process exit event')
})

ctl = require('http').createServer(
function proc_ctl_http_serv(req, res){
    var body = ''

    res.on('close', proc_ctl_res_unexpected_close)

    con.log('ctl req url:' + req.url)
    if ('/sts_running' == req.url){
    } else if ('/cmd_exit' == req.url){
        process.nextTick(function(){
            process.exit(0)
        })
        body += '$ is going down'
    } else if ('/cmd_stat' == req.url){
        body += Math.ceil(process.uptime()) + '\n' + ctl.toISOString()
    } else {// show somw info about this
        body += '? control channel resourses:\n\n' +
        'sts_running cmd_stat cmd_exit' +
        '\n\n' +
        'application under control is at port: ' + cfg.backend.job_port + '\n'
    }
    res.writeHead(200 ,{ 'Content-Length': body.length ,'Content-Type': 'text/plain' })
    res.end(body)
})

ctl.on('listening',
function proc_ctl_http_serv_listening(){
    ctl = new Date()// fill `ctl` as running flag
    con.log(
        '^ backend http proc ctl @ http://127.0.0.1:' + cfg.backend.ctl_port + '\n' +
        ctl.toISOString()
    )
})

ctl.on('error',
function proc_ctl_http_serv_error(e){
// NOTE: net error handler must not be inside init(listen) callback!!!
    if('EADDRINUSE' == e.code){// 'EADDRNOTAVAIL'?
        con.error(
            "!!! FATAL(ctl): can't listen host:port='127.0.0.1':" + cfg.backend.ctl_port +
            "\n" + ipt(e) +
            "\nNOTE: check config 'ctl_port' option collision"
        )
    } else {//FIXME: handle all fatal errors to unset `ctl` and process.exit()
        con.error("! ERROR(ctl) controlling http channel: " + ipt(e))
    }
    if (!ctl) process.exit(1)
})

ctl.on('clientError',
function proc_ctl_client_error(e, sock){
    con.error("! ERROR(ctl) in client connection: " + ipt(e))
})

function proc_ctl_res_unexpected_close(){
    con.error('! ERROR(ctl) aborted request')
}

ctl.listen(cfg.backend.ctl_port ,'127.0.0.1' ,run_backend)
ctl.unref()// "allow the program to exit if this is the only active server in the event system"
ctl = null// setup is over, waiting for 'listening' event, `ctl` is running flag
})(console ,process)
