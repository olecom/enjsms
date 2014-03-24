function app_modules(api){
    /* Application module loader */
    var m = '', err = '', cfg = ''
       ,fs = require('fs')

    for(m in api.cfg.app.modules){
        try {// load: app_modules/userman/app_back_userman.js
            if(fs.statSync(__dirname + '/' + m).isDirectory()){
                cfg = api.cfg.app.modules[m]
                m = './' + m + '/app_back_' + m + '.js'
            }
        } catch(ex){
            err = err || 'Error load app module(s) from `config`:\n'// ':' is used
        }
        if(!cfg){// load: app_modules/pingback.js
            cfg = api.cfg.app.modules[m]
            m = './' + m + '.js'
        }
        try {
            require(m)(api, cfg)
        } catch(ex){
            err += m.replace(/[.]js/, '[.js]') + ':\n!!!' + ex.stack + '\n'
        }
        cfg = ''
    }
    if(':' != err[err.length - 2]) api._err(err)
}

module.exports = app_modules
