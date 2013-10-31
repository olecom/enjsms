(function uglify_js_closure(con ,process){
var http = require('http') ,inspect = require('util').inspect
var cfg = JSON.parse(process.env.NODEJS_CONFIG)

    function run_backend(){
        con.log(inspect(process.env))
        con.error('error check')
    }

//express for business logic as from node-webkit(local UI) as from regular HTTP (localhost or any host)

/*==============================================================================
\  / Process control http channel.
 \/  This: child.kill([signal]), where signals can be 'SIGTERM' or 'SIGHUP' etc.
 /\  is very old non cross platform way of child process control.
 \/
 /\  Here we have HTTP server on controlling port
/  \
================================================================================*/

process.on('uncaughtException', function(err){
  con.log('Caught exception: ' + inspect(err))
})

process.on('exit', function process_exit(){
  con.log('Process exit event')
})

var ctl = http.createServer(
function proc_ctl_http_serv(req, res){
    var len = 0, body = null
    con.log(req.url)
    if ('/cmd_exit' == req.url){
        process.nextTick(function(){
            process.exit(0)
        })
        body = '$ is going down' ,len = body.length
    } else if ('/sts_running' == req.url){
    } else if ('/cmd_stat' == req.url){
        if ('GET' == req.method){
            body = Math.ceil(process.uptime()).toString() ,len = body.length
        }
    }
    res.writeHead(200 ,{ 'Content-Length': len ,'Content-Type': 'text/plain' })
    res.end(body)
})

ctl.on('error',
function proc_ctl_http_serv_error(e){
// NOTE: net error handler must not be inside init(listen) callback!!!
    if('EADDRINUSE' == e.code){// 'EADDRNOTAVAIL'?
        con.error(
            "FATAL: can't listen host:port='127.0.0.1':" + cfg.backend.ctl_port +
            "\n" + inspect(e) +
            "\nNOTE: check config 'ctl_port' option collision"
        )
    } else {//FIXME: handle all fatal errors to unset `ctl` and process.exit()
        con.error("ERROR controlling http channel: " + inspect(e))
    }
    if (!ctl) process.exit(1)
})

ctl.on('listening',
function proc_ctl_http_serv_listening(){
    ctl = new Date()
    con.log(
        "^ backend http proc ctl @ http://127.0.0.1:" + cfg.backend.ctl_port +
        "\n" + ctl.toISOString() + "\n"
    )
})

ctl.listen(cfg.backend.ctl_port ,'127.0.0.1' ,run_backend)
ctl.unref()// "allow the program to exit if this is the only active server in the event system"
ctl = null// setup is over, waiting for 'listening' event
})(console ,process)
