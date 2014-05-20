module.exports = { /* API setup */
    /* methods */
    app: null,// connect()
    connect: null,// connectjs
    cfg: null,
    con: null,// console
    _log: null,
    _err: null,

    ipt: require('util').inspect,

    /* modules sub api (can be removed if no such app module used)
     * performance hint: placeholders tell V8 about future structure
     * */
    wes: null,// userman: waiting events (from backend to UI)
    can: null,// userman: set of permissions collected thruth whole app (app_modules)
    roles: null,// userman: same for roles
    users: null,// userman: same for users

    set_api: function set_api(cfg, con, _log, _err){
        var api = this

        api.cfg = cfg
        api.con = con
        api._log = _log
        api._err = _err

        return api
    }
}
