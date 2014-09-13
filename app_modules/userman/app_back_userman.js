/*
 * user authentication and resource authorization
 * provide frontend UI files and backend logic
 *
 * `backend.waitEvents`: per-user/session division allows UI to receive events
 * from backend via long pooling (i.e. XHR with long timeout)
 *
 * otherwise UI must do XHR frequently
 */

module.exports = userman

function userman(api, cfg){
var app = api.app
   ,Can ,Roles ,Users
   ,n ,f ,m ,files ,wes ,rbac

    wes = api.wes = require('./lib/wait_events.js')(api)
    rbac = require('./lib/rbac.js')(api)

    Can = api.can = rbac.can
    Roles = api.roles = rbac.roles
    Users = api.users = rbac.users

    initAuth()// set default 'deny' authorization for all permissions

    files = [
        '/crypto/SHA1',
        /* true M V C loading */
        '/model/User',// + client's requested `l10n`
        '/view/Login', '/view/items_Bar', '/view/items_Shortcuts',
        '/controller/Login'
    ]

    for(f = 0; f < files.length; f++){// provide [files] w/o auth
        n = '/um' + (m = files[f])// apply own namespace
        api.cfg.extjs.load.requireLaunch.push(n)// UI `Ext.syncRequire(that)`
        n += '.js'// for this backend
        app.use(n, api.connect.sendFile(__dirname + (m += '.js'), true))
    }

    app.use(mwBasicAuthorization)// apply default 'deny' from `initAuth()`

    api.cfg.extjs.load.require.push('App.backend.waitEvents')
    app.use('/um/lib/wait_events', wes.mwPutWaitEvents)
    app.use(n = '/backend/waitEvents.js', api.connect.sendFile(__dirname + n, true))

    // cfg check for more functionality
    if(!cfg || 'string' != typeof cfg.data){
        throw new Error('Not a string: `config.app.modules.userman.data`')
    }

    // high priority
    app.use('/um/lib/chat', require('./lib/chat.js')(api))// backend API && MVC UI:
    app.use(n = '/model/chatUser.js', api.connect.sendFile(__dirname + n, true))
    app.use(n = '/view/Chat.js', api.connect.sendFile(__dirname + n, true))
    app.use(n = '/controller/Chat.js', api.connect.sendFile(__dirname + n, true))

    app.use('/um/lib/rbac', rbac.mw)
    app.use('/um' + (n = '/view/Userman.js'), api.connect.sendFile(__dirname + n, true))
    app.use('/um' + (n = '/controller/Userman.js'), api.connect.sendFile(__dirname + n, true))

    // low priority stuff:
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

/* Permission/Role/User setup example see `rbac.js` */

    function check_type_and_apply_perm(can){
        if(!can){
            log('Warning: permission name is not defined')
            return
        }
        do {
            if(0 == can.indexOf('module.')
                 ||~can.indexOf('->')){
            // it is not a file to serve
                break
            }
            if('/' == can[0]){//#2
                Can.API.push(can)// denied by default
                break
            }
            //#1 'App.backend.JS' == >> '/backend/JS'
            can = can.replace(/^[^.]*[.]/, '/').replace(/[.]/g, '/')
            Can.Static[can] = false// denied by default
        } while(0)
        // secured permissions are being checked in `create_auth()` when
        // `req.session.can` is created
        Can[can] = true// there is such permission
    }

    function initAuth(){
   /*
    ** types of permissions:
    * 1) 'App.backend.JS': Class name is file name  == >> '/backend/JS'
    * 2) 'App.view.Window->tools.refresh': subclass permission (nothing special)
    * 3) '/um/' || '/chat': backend URL (API calls)
    * 4) 'module.pingback' || 'modules.*': allowed app modules
    *
    ** any permissions (allow something) must be false (deny by default)
    * 1) Can.Static
    * 2) Can.API
    * -) Can.UI (not really as it is not a file to serve)
    * -) Can:Modules (not really as it is not a file to serve)
    *
    ***/
    var p, r, i
        for(p in Can){
            if('boolean' == typeof Can[p]){
                check_type_and_apply_perm(p)
            }// skip all other, can arrays are expanded in `rbac_setup()`
        }
        for(p in Roles){
            r = Roles[p]
            if(!Array.isArray(r)){
                log('Warning: role "' + p + '" is not Array')
                continue
            }
            for(i = 0; i < r.length; ++i){
                if(Array.isArray(r[i])) continue// skip; array in Roles must be from Can
                check_type_and_apply_perm(r[i])
            }
        }
        rbac.merge(api.cfg.app.modules.userman.rbac)// use after init
//log('rbac initAuth: ', require('util').inspect(rbac, { depth : 6 }))
    }

    function mwBasicAuthorization(req, res, next){
    // see `create_auth()`
    var i, idx, can, perm
        /* protect namespace of this from any no auth access */
        if(0 == req.url.indexOf('/um/')){// TODO: configure other protected namespaces
            do {
                if(req.session){
                    if(req.session.user){
                        break
                    }
                }
                res.statusCode = 401// no auth
                req.session || res.statusCode++// 402 no session
                res.end()
                return
            } while(0)
        }

        /* turn ExtJS Class URL into `Can.backend` index
         * /backend/JS.js?_dc=1395638116367
         * /backend/JS
         */
        idx = req.url.indexOf('.js?')
        perm = req.url
        if(req.session && (can = req.session.can)){// auth
            if(~idx){// *.js files
                perm = perm.slice(0, idx)
                if(Can.Static.hasOwnProperty(perm) && can.Static[perm]){
log('allow session Can.Static: ' + perm)
                    return next()// allow connect.static
                }
            } else {
log('perm: ' + perm + ' can: ', can)
                for(i = 0; i < can.API.length; ++i){// scan all API
log('check: ' + can.API[i])
                    if(0 == perm.indexOf(can.API[i])){// for subsets
                    // e.g. '/um/' in ''/um/lib...''
log('allow "' + perm + '" by can.API: ' + can.API[i])
                        return next()// allow API
                    }
                }
            }
            // all other falls thru
        }

        if(!Can.Static.hasOwnProperty(perm)){// no auth
           for(i = 0; i < Can.API.length; ++i){// all API must heve permission
log('Check: ' + Can.API[i])
                if(0 == perm.indexOf(Can.API[i])){
                // search for subsets e.g. '/um/' in ''/um/lib...''
log('disallow "' + perm + '" by Can.API: ' + Can.API[i])
                    perm = ''
                    break
                }
            }
            if(perm){
log('allow Can.Static: ' + perm)
                return next()// allow stuff that is NOT listed there
            }
            // fall thru to disallow
        }
        // disallow
        if(!~idx){// not *.js files
            res.statusCode = 401// crud reject (API calls)
            res.json({ success: false, err: "URL '"+ (perm || '/') + "' Unauthorized" })
        } else {
           /* gracefully reject Classes loaded from MVC files by phony UI e.g.:
            *   Ext.ns("App.view.desktop.BackendTools")
            *   App.view.desktop.BackendTools = Ext.Component// Unauthorized
            **/
            perm = 'App' + perm.replace(/[/]/g, '.')
            res.js(
               'if(window.Ext){\n' +
               '    Ext.ns("' + perm + '")\n    ' +
                    perm + ' = Ext.' + (
                    ~perm.indexOf('.controller.') ? 'app.Controller' : 'Component'
                ) + '\n}// Unauthorized'
            )
        }
        return
    }

    function create_auth(session, role_name){
   /* Creating user/session authorization
    * req.session.can = {
    *     __name: 'role.name'
    *     // access to static (Class) files
    *     // if file URL (i.e. with '*.js' postfix; stripped)  is in there
    *     // then allow access (which is denied by default)
    *    ,Static: { '/backend/JS': true }
    *     // access to API calls
    *     // `mwBasicAuthorization` scans this array for every URL that is
    *     // not a '*.js' file; if there is a match of any items here with URL's
    *     // first place e.g. URL: "/um/lib/..." && can.API[0]: "/um/" allow access
    *    ,API: [ '/um/' ]
    *     //compiled list of permissions from all roles in its priority *order*
    *    ,'App.view.desktop.BackendTools': true
    *    ,'App.backback.JS': true
    * }
    **/
    var can, d, p, i, roll
        can = Roles[role_name] || { __name: 'no role name' }
        if(Array.isArray(can)){// compile permissions from role setup
            roll = can
            can = {
                __name: role_name
               ,Static: { }
               ,API: [ ]
            }
            for(i = 0; i < roll.length; ++i){
                p = roll[i]
                if(Array.isArray(p)){// group of permissions from Can
                    for(d = 0; d < p.length; ++d){
                        apply_permission(p[d])
                    }
                } else {
                    apply_permission(p)
                }
            }
            Roles[role_name] = can// rewrite role with complied list of perm-s
        }
        session.can = can
        return

        function apply_permission(j){
        var i, is_api = false
log('perm apply:"' + j + '"; Can[j]: ', Can[j])
            if(true === Can[j]){// single available permission name
            // secured permissions true here and blocked from others in `rbac.merge`
                can[j] = true

                for(i = 0; i < Can.API.length; ++i){// all Can.API must heve Can
                    if(j === Can.API[i]){// add permission if it is in Can.API
                        can.API.push(j)
                        is_api = true
                        break
                    }
                }
                if(!is_api){
                    j = j.replace(/^[^.]*[.]/, '/').replace(/[.]/g, '/')
                    if(Can.Static.hasOwnProperty(j)){
                        can.Static[j] = true
                    }
                }
            } else {
            // security: check any new permission
                if(null === rbac.secure_can(j)){// no such perm-n
                    for(i = 0; i < Can.API.length; ++i){// all API must heve permission
                        if(0 == Can.API[i].indexOf(j)){// j: "/p", API[i]: '/pingback'
                            is_api = true
                            log('!Security `apply_permission`: skip secure API subset "' + j + '"')
                            break// stop scan; deny subsets of API from app modules
                        }
                    }
                    if(!is_api){// allow API or any other perm-n from app modules
                        check_type_and_apply_perm(j)
                    }
                } else {
                    log('!Security `apply_permission`: skip secure permission "' + j + '"')
                }
            }
        }
    }

    function mwLogin(req, res){
    var ret = { success: false, roles: [], err: null }
       ,u

        if(req.session && (u = req.txt)){
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
            ret.err = '!session_txt'
        }
        res.json(ret)
    }

    function mwAuthenticate(req, res){
   /* req.session.user = {// user data for UI (no pass)
    *     id: u.id,
    *     name: u.name,
    *     roles: u.roles
    * }
    **/
    var ret = { success: false, user: null, err: null, can: null }
       ,data
       ,u ,r

        if(req.session){
            if((ret.can = req.session.can)){
                ret.user = req.session.user
                ret.success = true
                res.json(ret)
                ret.can = null//security: don't show permissions to others
                wes.broadcast('login@um', ret)
                return// fast path
            }
            /* check user *iff* there is no one in `req.session` */
            if(!req.session.user && (data = req.txt)){
                data = data.split('\n')//: 'user_id\nrole_name\npass_sha1'
                u = Users[data[0]]
                r = data[1]
                // check password and role name in user's allowed roles list
                ret.success = u && u.pass === data[2] && !!(
                              r &&~u.roles.indexOf(r))

                if('developer.local' === r &&
                   '127.0.0.1' !== req.socket.remoteAddress){
                    ret.success = false//security: don't allow remote access
                    ret.err = '!remote_access'
                }
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
                    ret.can = req.session.can// permissions for UI
                    res.json(ret)
                    ret.can = null//security: don't show permissions to others
                    wes.broadcast('auth@um', ret)
                    return// fast path
                } else {
                    ret.err || (ret.err = '!bad_upr')
                }
            } else {
                ret.err = '!data'
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
            ret.err = '!session'
        }
        res.json(ret)
        wes.broadcast('auth@um', ret)
    }
    //!!! TODO: save/load MemoryStore with all sessions

    function mwLogout(req, res){
        if(req.session && !req.session.fail){// disallow bruteforce check bypass
            if(req.session.user){// one user login per session
                wes.broadcast('out@um', wes.get_id(req))
                wes.cleanup(req.sessionID)
                req.session.user = null
                req.session.can = null
            }
            req.session.destroy()
        }
        res.json()
    }
}
