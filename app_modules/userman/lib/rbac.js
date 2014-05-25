/*
 * Auth* provider and manager
 **/
module.exports = rbac_setup

function rbac_setup(api){
var rbac_api, fs = require('fs')
   ,dir

    rbac_api = {
        secure_can: null,// permissions to care of specifically
        can: null, roles: null, users: null,// rbac data
        mw: mwRBAC,// manager API for UI
        merge: merge_rbac_from_others
    }

    default_access()
    expand_can_arrays()

    dir = process.cwd() + api.cfg.app.modules.userman.data + '/rbac'

    fs.stat(dir,
        function stat_um_data_rbac_dir(err, d){
            if(err){
                require('mkdirp').mkdirp(dir,
                    function mkdirp_um_data_rbac_dir(err){
                        if(err) throw(err)
                        //load_api()
                    }
                )
                return
            }
            if(!d.isDirectory()){
                throw new Error('Is not a directory: ' + dir)
            }
            //load_api()// init api
        }
    )

    return rbac_api

    function default_access(){
    var secure, backend_js_class, backend_js_api

        secure = rbac_api.secure_can = rbac_api_secure_can_setup()
        backend_js_class = 'App.backend.JS'// depends on `pingback` app_module
        backend_js_api = '/pingback'
        secure(backend_js_class, true)// setup secure permissions
        secure(backend_js_api, true)// setup secure permissions
        secure('module.*', true)

        rbac_api.can = {
            backend:[// a block of permissions
                'App.view.desktop.BackendTools'// UI classes
                ,secure(backend_js_class)// annotated secure permission used
                ,secure(backend_js_api)// annotated secure permission used
            ]
           ,userman:[
                'App.um.controller.Userman',
                'App.um.view.Userman',
                '/um/'// protect backend API calls (URL based)
            ]

           ,'App.controller.Chat': true// simple single permissions
           ,'App.view.Chat': true
           ,'/chat': true// backend API protection (URL based, 4 chars)

           ,Static:{// by default deny access to Class or other files by `initAuthStatic()`
               '/pingback.js': false// deny `backend_js_api` even here
            }
           ,API: [ ]// by default deny access to API calls (iterate array of subsets)
        }

        rbac_api.roles = {// 'role': new Array(of `can`s)
            'developer.local':[
                rbac_api.can.backend// can do all from specified `can` block
               ,'App.view.Window->tools.refresh'// developer's stuff
               ,'/um/lib/wait_events'
               ,secure('module.*')// allow any app module to load
            ]
           ,'admin.local': [ 'App.view.desktop.BackendTools' ]// single true-permissions
           ,'developer': [ secure(backend_js_class) ]
        }
        secure(backend_js_class, false)// deny access by this permission for others
        secure(backend_js_api, false)// deny access by this permission for others
        secure('module.*', false)

        rbac_api.users = {
            devka:{
                id: 'devka',
                // require('crypto').createHash('sha1').update(pass).digest('hex')
                pass: '9d4e1e23bd5b727046a9e3b4b7db57bd8d6ee684',
                roles: [ 'developer.local', 'admin.local' ],
                name: 'default login'
            }
        }
    }

    function expand_can_arrays(){
    var a, p, i, can
        can = rbac_api.can
        secure = rbac_api.secure_can
        for(p in can){
console.log('eca p: ' + p)
            if(Array.isArray(a = can[p])){
console.log('eca a: ', a)
                for(i = 0; i < a.length; ++i){
                    can[a[i]] = true// secured permissions are in general list also
                }
            }
        }
    }

    function rbac_api_secure_can_setup(){
   /*
    * Security annotations of the permissions means they can be defined only in
    * arrays of permissions i.e.:
    *    rbac_api.can = {
    *        backend:[// a block of permissions
    *            'App.view.desktop.BackendTools'// UI classes
    *            ,secure(backend_js)// special annotated permission
    *        ]
    *    }
    * then all added permissions from all sources are being checked against
    * this secure list thus preventing them to appear in `rbac_api.can` and
    * allow anything
    **/
    var secure_can = {/*// check for this in auth; examples:
            'module.*': true
           ,'App.backend.JS': true// depends on `pingback` app_module */
        }
        return function rbac_api_secure_can(id, val){
            // assign value to permission; if it is false then permission
            // is disabled and denied further (for some reason)
            if('undefined' != typeof val){// don't override false permission
                if(secure_can.hasOwnProperty(id) && !secure_can[id]){
                    return ''// exists, but false
                }
                return (secure_can[id] = (val === true)) ? id : ''
            }
            if(secure_can.hasOwnProperty(id)){
               return secure_can[id] ? id : ''
            }
            return null// no such permission in `secure_can`
        }
    }

    function merge_rbac_from_others(rbac){
    /* to `rbac_api` form e.g: `cfg.app.modules.userman.rbac`:{
            can:{
                'module.pingback': true
               ,'module.enjsms': true
            }
           ,roles:{
                'user.test':[
                    'module.enjsms'
                ]
            }
           ,users:{
                test:{
                    pass: '9d4e1e23bd5b727046a9e3b4b7db57bd8d6ee684',
                    roles: [ 'user.test' ],
                    name: 'test user'
                }
            }
        }
     **/
        if(!rbac) return

        if(0 == rbac_api.can.API.length){
            api._log('Coding error: empty `rbac_api.can.API`; use `merge_rbac()` *after* `initAuth()`')
        }

        var i, j, k, m, ii, src, dst, secure

        secure = rbac_api.secure_can
        for(i in rbac){
            if(!rbac_api.hasOwnProperty(i)){// check if `rbac_api` has such category
                api._log('!Security `merge_rbac`: overwrite attempt of "' + i + '"')
                continue// don't allow anything from untrusted sources
            }
            src = rbac[i], dst = rbac_api[i]
            for(j in src){// from source to destination
                if(dst.hasOwnProperty(j)){
                    api._log('!Security `merge_rbac`: overwrite attempt of `' + i + '["' + j + '"]`')
                    continue// don't allow overwrite anything
                }
                if('can' == i){
                    if(Array.isArray(src[j])){
                        api._log('`merge_rbac`: skip array can.' + j)
                        continue// disable arrays (nothing can be there)
                    }
                    if(null !== secure(j)){
                        api._log('!Security `merge_rbac`: skip secure permission "' + j + '"')
                        continue// there is such permission in `secure_can`
                    }
                } else if('roles' == i){// check perms thru `secure_can`
                    if(!Array.isArray((m = src[j]))){
                        continue// skip
                    }// role_name: [ ]

//console.log('merge role m: ' + m)
                    for(k = 0; k < m.length; ++k){
//console.log('merge role m[k]: ' + m[k])
                        if(null !== secure(m[k])){
                            api._log('!Security `merge_rbac`: reject role secure permission "' + m[k] + '"')
                            m[k] = ''// there is such permission in `secure_can`
                        } else {// check API subsets
//console.log('merge role API: ', rbac_api.can.API)
                            for(ii = 0; ii < rbac_api.can.API.length; ++ii){
                            // all API must heve permission
//console.log('merge role API[ii]: ' + rbac_api.can.API[ii])
                                if(0 == rbac_api.can.API[ii].indexOf(m[k])){
                                // j: "/p", API[i]: '/pingback'
                                    api._log(
                                        '!Security `merge_rbac`: skip secure API subset "' +
                                        m[k] + '" in role "'+ j + '"'
                                    )
                                    m[k] = ''
                                    break// stop scan; deny subsets of API from app modules
                                }
                            }
                        }
                    }
                }
                dst[j] = src[j]
            }
        }//TODO: merge l10n from config to global l10n
    }

    function mwRBAC(req, res, next){// manage permissions, roles, users sets
    var ret = { success: false, data: null }
        res.json(ret)
    }
}
