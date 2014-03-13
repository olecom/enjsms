module.exports = function app_modules(api){
    /* Application module loader (can be in its own file) */
    try{
        if(api.cfg.app.modules.pingback){
            require('./pingback.js')(api)
        }
    } catch (ex){
        _err('app modules: ' + api.ipt(ex))
    }
        //!view.desktop.BackendTools
}
