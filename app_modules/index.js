module.exports = app_modules

function app_modules(api){// Application modules loader
var m = '', err = '', cfg = ''
   ,fs = require('fs')
   ,auth = function no_auth(){ }

    for(m in api.cfg.app.modules){
        if('?' === m[0]) continue
        if(api.cfg.app.modules['?auth']){
            auth = api.cfg.app.modules['?auth']
            api.cfg.app.modules['?auth'] = null
        }
        auth(m)// setup && pre check
        try {// stat on FS e.g.: app_modules/userman/
            if(fs.statSync(__dirname + '/' + m).isDirectory()){
                cfg = api.cfg.app.modules[m]
                //e.g.: app_modules/userman/app_back_userman.js
                m = './' + m + '/app_back_' + m + '.js'
            }
        } catch(ex){ /* directory check failed */ }
        if(!cfg){// will try to load file e.g.: app_modules/pingback.js
            cfg = api.cfg.app.modules[m]
            m = './' + m + '.js'
        }
        try {// to load the module
            require(m)(api, cfg)// `cfg` isn't used so far in app modules...
        } catch(ex){
            err += m.replace(/[.]js/, '[.js]') + ':\n!!!' + ex.stack + '\n'
        }
        cfg = ''
        auth()// post check
    }
    err && api.con.error('Error load app module(s) from `config`:\n', err)
}
