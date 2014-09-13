Ext.syncRequire('/l10n/' + l10n.lang + '_um')// require l10n from model

Ext.define('App.model.userman.User',{
    extend: App.model.BaseCRUD,
    singleton: true,// only one user in UI (`require`d before controllers by app module)
    requires:[ 'App.crypto.userman.SHA1' ],
    can: null,// permissions; usage: `App.User.can['App.backend.JS'] && (run_that())`
    fields:[
    {
        name: 'id',
        persist: false
    },
    {
        name: 'name',
        persist: false
    },
    {
        name: 'Roles',
        persist: false
    }
    ],
    login: function login(newUserId, get_session_info){
        App.backend.req('/login', newUserId,{
            autoAbort: true,
            callback: function session_info(err, json){
                if(!err){// controller (i.e. caller) updates UI
                    get_session_info(json)
                    return
                }
            }
        })
    },
    auth: function auth(user, role, pass, callback){
    var me = this

        App.backend.req('/auth',
            user + '\n' + role + '\n' + App.crypto.userman.SHA1.hash(pass),
            function auth_cb(err, json, res){
                if(!err){
                    me.can = json.can
                    me.set('id', json.user.id)
                    me.set('name', json.user.name)
                    me.set('Roles', json.user.roles)
                    me.login = me.auth = null// after login GC
                }
                callback && callback(err, json, res)
            }
        )
    },
    logout: function logout(cb){
        App.backend.req('/logout', null, cb)
    }
})
