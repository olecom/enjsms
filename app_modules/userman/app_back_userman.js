/*
 * user authentication and resource authorization
 * provide frontend UI files and backend logic
 *
 * `backend.waitEvents`: per-user/session division allows UI to receive events
 * from backend via long pooling (i.e. XHR with long timeout)
 *
 * otherwise UI must do XHR frequently
 */
function userman(api, cfg){
    var app = api.app
       ,Can = cfg.can = require('./can.js')
       ,Roles = cfg.roles = require('./roles.js')
       ,Users = cfg.users = require('./users.js')
       ,wes = require('./lib/wait_events.js')(api)
       ,n = '', f = 0, files = [
            '/crypto/SHA1',
            /* true M V C loading */
            '/model/User',// + client's requested `l10n`
            '/view/Login', '/view/items_Bar', '/view/items_Shortcuts', '/view/Userman',
            '/controller/Login'
        ]

    initAuthStatic()// default authorization for `backend` permissions

    for(f = 0; f < files.length; f++){// provide [files] w/o auth
        n = files[f]
        api.cfg.extjs.load.requireLaunch.push(n)// UI `Ext.syncRequire(that)`
        n += '.js'// for this backend
        app.use(n, api.connect.sendFile(__dirname + n, true))
    }

    app.use(mwBasicAuthorization)

    api.cfg.extjs.load.require.push('App.backend.waitEvents')
    app.use('/wait_events', wes.mwPutWaitEvents)
    n = '/backend/waitEvents.js'
    app.use(n, api.connect.sendFile(__dirname + n, true))

    n = '/css/userman/css'
    api.cfg.extjs.load.css.push(n)
    app.use(n, api.connect.sendFile(__dirname + '/userman.css', true))
    app.use('/css/userman/', api.connect['static'](__dirname + '/css/'))

    app.use('/l10n/', mwL10n)

    app.use('/login', mwLogin)// '/login' creates `req.session`', shows `roles`
    app.use('/auth', mwAuthenticate)// '/auth' creates `req.session.user`'
    app.use('/logout', mwLogout)

    return

    function mwL10n(req, res, next){
        var q, s, postfix = '_userman.js'
        if(!~req.url.indexOf(postfix)){
            next()
            return// l10n is not for this module
        }
        if((q = req.url.indexOf('?')) >= 0){
            s = req.url.slice(0, q)
        }
        try{// client requested l10n
            s = __dirname + '/l10n' + s
            require('fs').statSync(s)
            api.connect.sendFile(s, true)(req, res)
        } catch(ex){// or fallback
            api.connect.sendFile(
                __dirname + '/l10n/' + api.cfg.lang + postfix,
                true// absolute path is provided
            )(req, res)
        }
    }

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
    // any `backend` permissions must be false by default to all roles
        var p, s = Can.Static
        for(p in Can.backend){
            //turn class name to backend url e.g. 'App.backend.JS' - > '/backend/JS'
            s[p.slice(3).replace(/[.]/g, '/')] = false
        }
    }

    function mwBasicAuthorization(req, res, next){
        /* turn ExtJS Class URL into `Can.backend` index
         * /backend/JS.js?_dc=1395638116367
         * /backend/JS
         */
        var idx = req.url
        idx = idx.slice(0, idx.indexOf('.js?'))

        if(req.session && req.session.can){// auth
            //if(req.headers['x-api']){// fast path for API calls
            //}
            if(!req.session.can.backend.hasOwnProperty(idx)){
                next()// to `connect.static()`
                return
            }
        // false must be in `req.session.can.backend[idx]
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
        if(~req.url.indexOf('backend')){/* hacks */
            res.statusCode = 401
            res.end()
            return
        } else {/* phony ExtJS UI */
            idx = 'App' + idx.replace(/[/]/g, '.')
            res.js('Ext.ns("' + idx + '")\n' + idx + ' = Ext.Component// Unauthorized')
        }
        return
    }

    function create_auth(session, role_name){
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
        var can ,d ,j ,p ,i ,roll

        can = Roles[role_name] || { __name: 'no role name' ,backend: { } }

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
                //turn class name to backend url 'App.backend.JS' - > '/backend/JS'
                can.backend[p.slice(3).replace(/[.]/g, '/')] = false
            }
        }
        session.can = can
        return
    }

    function mwLogin(req, res){
        var ret = { success: false, roles: [], err: null }
           ,u

        if(req.session && (u = req.body.plain_text)){
            if(req.session.can){// auth-d show permissions list - "can"
                ret.success = true
                ret.can = req.session.can
                ret.user = req.session.user
                res.json(ret)
                return// fast path
            }

            u = u.split('\n')[0]// user_id
            if((u = Users[u])){// pre auth shows roles
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
        var ret = { success: false, user: null, err: null, can: null }
           ,data
           ,u ,r

        if(req.session){
            if((ret.can = req.session.can)){
                ret.user = req.session.user
                ret.success = true
                res.json(ret)
                wes.broadcast('login', ret, 'OK')
                return// fast path
            }
            /* check user *iff* there is no one in `req.session` */
            if(!req.session.user && (data = req.body.plain_text)){
                data = data.split('\n')//: 'user_id\nrole_name\npass_sha1'
                u = Users[data[0]]
                r = data[1]
                // check password and role name in user's allowed roles list
                ret.success = u && u.pass === data[2] && !!(
                              r &&~u.roles.indexOf(r))
                if(ret.success){
                    if(req.session.fail){
                        req.session.fail = 0
                    }
                    ret.user = req.session.user = {// user data for UI (no pass)
                        id: u.id,
                        name: u.name,
                        roles: u.roles
                    }
                    create_auth(req.session, r)// permissions are in session
                    ret.can = req.session.can
                    res.json(ret)
                    wes.broadcast('auth', ret, 'OK')
                    ret.can = null
                    return// fast path
                } else {
                    ret.err = 'Bad user name, password, role'
                }
            } else {
                ret.err = 'No data available'
            }

            if(ret.err){
                req.session.fail = req.session.fail ? ++req.session.fail : 1
                if(4 == req.session.fail){// brute force preventer
                    req.session.user = true// stop auth check
                    setTimeout((
                        function prepare_allow_failer(failer){
                            return function allow_failer(){
                                failer.destroy()
                            }
                        })(req.session)
                        , 1 << 22)// wait hour or so to allow next login
                }
            }
            res.statusCode = 400
        } else {
            res.statusCode = 402
            ret.err = 'No session'
        }
        res.json(ret)
        wes.broadcast('auth', ret.err, 'ERR')
    }
    //!!! TODO: save/load MemoryStore with all sessions

    function mwLogout(req, res){
        if(req.session && !req.session.fail){// disallow bruteforce check bypass
            if(req.session.user){// one user login per session
                wes.cleanup(req.sessionID)
                wes.broadcast('out', req.session.user.id)
                req.session.user = null
                req.session.can = null
            }
            req.session.destroy()
        }
        res.json()
    }
}

module.exports = userman
