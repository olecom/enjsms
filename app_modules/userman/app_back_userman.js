function userman(api, cfg){
    var app = api.app

    app.use('/login', mwLogin)// '/login creates `req.session`'
    app.use('/auth', mwAuthenticate)
    app.use('/logout', mwLogout)

    app.use(function(req, res, next){
        console.log(req.url)
        next()
    })
//!!! static stufF: md5, login components connect = require('connect')

/* Role setup example:

can = {
    backend:{
        'App.view.desktop.BackendTools': true
       ,'App.back.JS': true
    }
}

 *  * roles have compiled permissions for eveny action
 * user has joined list of permissions from all roles listed in user's profile

// static data:
roles = {
    'developer.local': [ can.backend ]// can do all from specified `can`
   ,'admin.local': [ 'App.view.desktop.BackendTools' ]
   ,'developer': [ 'App.back.JS' ]
}

// after compiler:
roles = {
    'developer.local':{
        __name: 'developer.local'
       ,__what: l10n.um.roles['developer.local'] //on UI frontend
       ,'App.view.desktop.BackendTools': true
       ,'App.back.JS': true
       ....
    }
}
*/

can = {
    backend:{
        'App.view.desktop.BackendTools': true
       ,'App.back.JS': true
    }
   ,order:{

   }
   ,warehouse:{
       income:{

       }
   }
   ,shop:{

   }
}

roles = {
    'developer.local': [ can.backend ]// can do all from specified `can`
   ,'admin.local': [ 'App.view.desktop.BackendTools' ]// single true-permissions
   ,'developer': [ 'App.back.JS' ]
}

    function create_auth(u, role_name){
    /* Creating user
    req.session.user = {
        id: 'olecom' ,
        // dynamic data; is filled in auth process
        can:{//compiled list of permissions from all roles in its *order*
            'App.view.desktop.BackendTools': true
           ,'App.back.JS': true
        }
    }
    */
        var can ,i ,j ,d ,p ,roll

        if(u.can) return u

        can = roles[role_name]

        if(Array.isArray(can)){// compile permissions from role setup
            roll = can
            can = {
                __name: role_name
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
            roles[role_name] = can
        }
        u.can = can

        return u
    }

users = {// users db
    olecom:{
        /* static changable data (for DB) */
        id: 'olecom',
        pass: 'passmd5',
        roles: [ 'developer.local', 'admin.local' ],
        name:'Олег Верич',
        can: null
    }
}

    function mwLogin(req, res){
        var ret = { success: false, roles: [], err: null }
           ,u

        if(req.session && (u = req.body.plain_text)){
            u = u.split('\n')[0]// user_id
            if((u = users[u])){
                ret.success = true
                ret.roles = u
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
                u = users[data[0]]
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
        req.session && req.session.destroy()
        res.json()
    }
}

module.exports = userman
