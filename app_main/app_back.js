(function uglify_js_closure(global, process, con){
var cfg = require('./lib/read_config.js')

    global.log = log

    require('./lib/response.js')
    require('./lib/process.js')(process)
    require('./lib/ctl_backend.js')(cfg, run_backend)

    function log(){ con.log.apply(con, arguments) }

    function run_backend(){
        log('^ app is starting http @ port ' + cfg.backend.job_port + '\n' +
                new Date().toISOString()
        )

        require('./lib/api.js').set_api(cfg)
        if(cfg.backend.mongodb){
            return require('./lib/mongodb.js').connect(
                cfg.backend.mongodb
               ,function on_app_db(err, dbInfo){
                    err && process.exit(1)// it's over
                    log(dbInfo)
                    require('./lib/app.js')()
                }
            )
        }// else use no db:
        require('./lib/app.js')()
        return undefined
    }

})(global, process, console)
