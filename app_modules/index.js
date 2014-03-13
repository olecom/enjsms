function app_modules(api){
    /* Application module loader */
    try{
        if(api.cfg.app.modules.pingback){
            require('./pingback.js')(api)
        }
    } catch (ex){
        _err('app modules: ' + api.ipt(ex))
    }
        //!view.desktop.BackendTools
}

module.exports = app_modules
