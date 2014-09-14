module.exports = { /* API setup */
    /* methods */
    cfg: null,
    db: null,// mongodb if configured

    connect: null,// connectjs
    app: null,// connect()
    mwL10n: null,// `l10n` files middleware factory for app modules

    /* modules sub api (can be removed if no such app module used)
     * performance hint: placeholders tell V8 about future structure
     **/
    wes: null,// userman: waiting events (from backend to UI)
    can: null,// userman: set of permissions collected thru whole app (app_modules)
    roles: null,// userman: same for roles
    users: null,// userman: same for users

    um: null,// access point into `userman`

    set_api: function set_api(cfg, db){
        var api = this

        api.cfg = cfg
        api.db = db

        return api
    }
}
