module.exports = { /* API setup */
    /* methods */
    app: null,
    cfg: null,
    con: null,
    _log: null,
    _err: null,

    ipt: require('util').inspect,

    /* data
    users: users,
    roles: roles */

    set_api: function set_api(cfg, con, _log, _err){
        var api = this

        api.cfg = cfg
        api.con = con
        api._log = _log
        api._err = _err

        return this
    }
}
