Ext.define('App.model.userman.User', {
    extend: 'Ext.data.Model',
    singleton: true,// only one user in UI (`require`d before controllers by app module)
    requires: [ 'App.backend.Connection' ],
    fields: [
        {
            name: 'id',
            type: 'string',
            persist: false
        },
        {
            name: 'Username',
            type: 'string',
            persist: false
        },
        {
            name: 'Roles',
            type: 'any',
            persist: false
        }
    ],
    login: function login(newUserId, get_roles){
        App.backend.req({
            // data
            url: '/login',
            params: newUserId,
            // action
            autoAbort: true,
            callback: function backend_events(_, success, res){
                if(success){
                    get_roles(Ext.decode(res.responseText).roles)
                }
            }
        })
    },
    auth: function auth(user, role, pass, callback){
        //TODO: req auth
        //App.backend.req({ url: '/auth' })
        //this.login = this.auth = null// after login GC
        callback && callback(true)
    },
    can: function can(perm){
        var me = this
        return Ext.Array.contains( me.get( 'Roles' ), RoleID )
    },
    logout: function logout(){
        App.backend.req({ url: '/logout' })
        //TODO: on logout event from server, do: `window.location = '/'`
    }
})
