(function uglify_js_closure(global, process, con){
var cfg = require('./lib/read_config.js')

    global.log = function log(){ con.log.apply(con, arguments)}

    require('./lib/response.js')
    require('./lib/process.js')(global, process)
    require('./lib/ctl_backend.js')(cfg, run_backend)

    return

    function run_backend(){
        log('^ app is starting http @ port ' + cfg.backend.job_port + '\n' +
            new Date().toISOString()
        )

        if(!cfg.backend.mongodb) return require('./lib/app.js')(cfg)

        return require('./lib/mongodb.js').connect(cfg.backend.mongodb,
        function on_app_db(err, db){
            err && process.exit(1)// it's over, don't even launch

            return require('./lib/app.js')(cfg, db)
        }
        )
    }
})(global, process, console)
