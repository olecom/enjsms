Ext.syncRequire( '/l10n/' + l10n.lang + '_userman')// require l10n from model

Ext.define('App.model.userman.User', {
    extend: 'Ext.data.Model',
    singleton: true,// only one user in UI (`require`d before controllers by app module)
    requires: [
        'App.backend.Connection'
       ,'App.crypto.userman.SHA1'
    ],
    fields: [
        {
            name: 'id',
            type: 'string',
            persist: false
        },
        {
            name: 'name',
            type: 'string',
            persist: false
        },
        {
            name: 'Roles',
            type: 'any',// array for user admin interface
            persist: false
        }
    ],
    login: function login(newUserId, get_session_info){
        App.backend.req({
            // data
            url: '/login',
            params: newUserId,
            // action
            autoAbort: true,
            callback: function session_info(_, success, res){
                if(success){// controller (i.e. caller) updates UI
                    get_session_info(Ext.decode(res.responseText))
                    return
                }
            }
        })
    },
    auth: function auth(user, role, pass, callback){
        var me = this
        App.backend.req({
            url: '/auth',
            params: user + '\n' + role + '\n' + App.crypto.userman.SHA1.hash(pass),
            callback: function auth_cb(_, success, res){
                if(success){
                    res = Ext.decode(res.responseText)
                    me.pes = res.can
                    me.set('id', res.user.id)
                    me.set('name', res.user.name)
                    me.set('Roles', res.user.roles)
                    me.login = me.auth = null// after login GC
                }
                callback && callback(success, res)
            }
        })
    },
    pes: null,// permissions `can` list
    can: function can(perm){
        return this.pes.indexOf(perm)
    },
    logout: function logout(cb){
        App.backend.req({ url: '/logout', callback: cb })
    }
})
