module.exports = { /* API setup */
    /* methods */
    app: null,// connect()
    connect: null,// connectjs
    cfg: null,
    db: null,// mongodb connected

    /* modules sub api (can be removed if no such app module used)
     * performance hint: placeholders tell V8 about future structure
     * */
    wes: null,// userman: waiting events (from backend to UI)
    can: null,// userman: set of permissions collected thru whole app (app_modules)
    roles: null,// userman: same for roles
    users: null,// userman: same for users

    set_api: function set_api(cfg, db){
        var api = this

        api.cfg = cfg
        api.db = db

        return api
    }
}
