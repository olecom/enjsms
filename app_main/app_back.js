(function uglify_js_closure(con){
var cfg = require('./lib/read_config.js')

    require('./lib/response.js')
    require('./lib/process.js')
    require('./lib/ctl_backend.js')(cfg, run_backend)

    function _log(m){ con.log(m) }
    function _err(e){ con.error(e) }

    function run_backend(){
        _log('^ app is starting http @ port ' + cfg.backend.job_port + '\n' +
                new Date().toISOString()
        )
        require('./lib/api.js').set_api(cfg, con, _log, _err)
        require('./lib/app.js')()
    }

})(console)
