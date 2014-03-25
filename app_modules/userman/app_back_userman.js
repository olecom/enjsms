function userman(api, cfg){
    var app = api.app
       ,Can = cfg.can = require('./can.js')
       ,Roles = cfg.roles = require('./roles.js')
       ,Users = cfg.users = require('./users.js')

    initAuthStatic()

    app.use(mwBasicAuthorization)
    app.use('/login', mwLogin)// '/login' creates `req.session`', shows `roles`
    app.use('/auth', mwAuthenticate)// '/auth' creates `req.session.user`'
    app.use('/logout', mwLogout)

/* Role setup example:

can = {
    backend:{
        'App.view.desktop.BackendTools': true
       ,'App.backend.JS': true
    }
}

 *  * roles have compiled permissions for eveny action
 * user has joined list of permissions from all roles listed in user's profile

// static data:
roles = {
    'developer.local': [ can.backend ]// can do all from specified `can`
   ,'admin.local': [ 'App.view.desktop.BackendTools' ]
   ,'developer': [ 'App.backend.JS' ]
}

// after compiler:
roles = {
    'developer.local':{
        __name: 'developer.local'
       ,__what: l10n.um.roles['developer.local'] //on UI frontend
       ,'App.view.desktop.BackendTools': true
       ,'App.backend.JS': true
       ....
    }
}
*/

    function initAuthStatic(){
        var p, s = Can.Static
        for(p in Can.backend){
            //turn class name to backend url 'App.backback.JS' - > '/back/JS'
           s[p.slice(3).replace(/[.]/g, '/')] = false
        }
    }

    function mwBasicAuthorization(req, res, next){
        /* turn ExtJS Class URL into `Can.backend` index
         /back/JS.js?_dc=1395638116367
         /back/JS
         */
        var idx = req.url
        idx = idx.slice(0, idx.indexOf('.js?'))

        if(req.session && req.session.user){// auth
            //if(req.headers['x-api']){// fast path for API calls
            //}
            if(!req.session.user.can.backend.hasOwnProperty(idx)){
                next()// to `connect.static()`
                return
            }
        // false must be in `req.session.user.can.backend[idx]
        // fall thru
        } else if(!Can.Static.hasOwnProperty(idx)){// no auth
            next()
            return
        }
        // false must be in `Can.Static`
        /* crud reject (API calls):
            res.statusCode = 401// 'Unauthorized'
         * gracefull (compenents in ExtJS frontend code loaded from MVC files):
            Ext.ns("App.view.desktop.BackendTools")
            App.view.desktop.BackendTools = Ext.Component// Unauthorized
        */
        idx = 'App' + idx.replace(/[/]/g, '.')
        res.json('Ext.ns("' + idx + '")\n' + idx + ' = Ext.Component// Unauthorized')
        return
    }

    function create_auth(u, role_name){
    /* Creating user
    req.session.user = {
        id: 'olecom' ,
        // dynamic data; is filled in auth process
        can:{//compiled list of permissions from all roles in its *order*
            'App.view.desktop.BackendTools': true
           ,'App.backback.JS': true
        }
    }
    */
        var can ,i ,j ,d ,p ,roll

        if(u.can) return u

        can = Roles[role_name] || { __name: 'null' ,backend: { } }

        if(Array.isArray(can)){// compile permissions from role setup
            roll = can
            can = {
                __name: role_name
               ,backend: { }
            }
            d = roll.length
            for(i = 0; i < d; i++){
                j = roll[i]
                if('string' == typeof j){// single permission name
                    can[j] = true        // is true
                } else {
                    for(p in j){         // group of permissions
                        can[p] = j[p]    // value as is in group `can`
                    }
                }
            }
            Roles[role_name] = can
        }
        // compile ExtJS MVC component file access for `Can.backend` permission
        for(p in Can.backend){
            if(!can[p]){
                //turn class name to backend url 'App.backback.JS' - > '/backend/JS'
                can.backend[p.slice(3).replace(/[.]/g, '/')] = false
            }
        }
        u.can = can
        return u
    }

    function mwLogin(req, res){
        var ret = { success: false, roles: [], err: null }
           ,u

        if(req.session && (u = req.body.plain_text)){
            u = u.split('\n')[0]// user_id
            if((u = Users[u])){
                ret.success = true
                ret.roles = u.roles
                res.json(ret)
                return// fast path
            }
            //if no user found, then auth will fail, don't tell it here
        } else {
            ret.err = 'Miscoding! No session and/or plain text username'
        }
        res.json(ret)
    }

    function mwAuthenticate(req, res){
        var ret = { success: false, user: null, err: null }
           ,data
           ,u ,r

        if(req.session){
            if((ret.user = req.session.user)){
                ret.success = true
                res.json(ret)
                return// fast path
            }

            if((data = req.body.plain_text)){
                data = data.split('\n')//: 'user_id\npass_md5\nrole_name'
                u = Users[data[0]]
                r = data[2]
                // TODO: check pass in md5
                // check password and role name in user's allowed roles list
                ret.success = u && u.pass === data[1] && !!(
                              r &&~u.roles.indexOf(r)
                            )

                if(ret.success){
                    // generate session for user: compile roles, can
                    req.session.user = create_auth(u, r)
                    res.json(ret)
                    return// fast path
                } else {
                    ret.err = 'Bad user name, password, role'
                }
            } else {
                ret.err = 'No data available'
            }

            if(ret.err){
                req.session.fail = req.session.fail ? ++req.session.fail : 1
                if(4 == req.session.fail){
                    req.session.user = true// stop auth check
                    setTimeout((
                        function prepare_allow_failer(failer){
                            return function allow_failer(){
                                failer.destroy()
                            }
                        })(req.session)
                        , 1 << 22)// wait hour or so to allow next login
                }
                res.statusCode = 400
            }
        } else {
            ret.err = 'Miscoding! No session'
        }
        res.json(ret)
    }
    //!!! TODO: save/load MemoryStore with all sessions

    function mwLogout(req, res){
        if(req.session && req.session.user){
            req.session.user = null
            req.session.user.can = null
        }
        req.session && req.session.destroy()
        res.json()
    }
}

module.exports = userman
