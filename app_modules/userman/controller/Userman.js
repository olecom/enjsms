Ext.define('App.controller.Userman', {
    extend: 'App.controller.Base',

    views: [
        'userman.Login'// auto requires App.view.userman.Login
    ],
    refs: [
        { ref: 'user', selector: 'field[name=user]' },
        { ref: 'role', selector: 'field[name=role]' },
        { ref: 'pass', selector: 'field[name=pass]' },

        { ref: 'auth', selector: 'button[iconCls=ok]' }
    ],
    init: function controllerUsermanInit(){
        var me = this
           ,defer = 0
           ,User, user, role, pass, auth

        App.cfg.createViewport = false// tell `Main`, this will fire `createViewport`

        user = me.getUser()
        role = me.getRole()
        pass = me.getPass()
        auth = me.getAuth()

        User = App.model.userman.User// must be required first from app module

        user.focus()
        user.on({
            /* using `ref`s, but this is equivalent to:
                this.listen component:{
                     'field[name=user]':{
                        specialkey: gotoRoles
                }
             * or *
                this.control({
                    'field[name=user]':{
                        specialkey: gotoRoles
                }
             */
            specialkey: gotoRoles,
            change: reqRole
        })
        role.on({
            specialkey: gotoPass// double keypress needed
           ,change: enablePass
        })
        pass.on({
            specialkey: gotoAuth
           ,change: enableAuth
        })
        auth.on({
            click: authenticate
        })

        me.listen({
            global:{
                /* runApp: Login widget is `singleton: true` and runs already */
            }
            //,controller: { }
            //,store: {}
        })
        return

        // data actions
        function reqRole(field, newUserId){
            if(defer) clearTimeout(defer)
            if(newUserId){
                defer = setTimeout(function deferReqRoles(){
                    defer = 0
                    User.login(newUserId, function getRoles(roles){
                        if(!roles.length)
                            return
                        var models = new Array(roles.length)
                           ,i = 0, r

                        for(; i < roles.length; i++){
                            r = roles[i]
                            models[i] = { role: l10n.um.roles[r] || r, '=': r }
                        }
                        role.store.loadData(models, false)

                        if(role.disabled){
                            role.enable()
                        }
                    })
                }, 512)
                return// fast path
            } else {
                role.disable()
            }
        }
        function authenticate(field, ev){
            App.view.userman.Login.fadeInProgress(auth)
            return

            function auth(){
                User.auth(
                    user.getValue(),
                    role.getValue(),
                    pass.getValue(),
                    callbackAuth
                )
            }
            function callbackAuth(success){
                if(success){
                    App.User = User
                    App.view.userman.Login.fadeOut(createViewportAuth)
                } else {
                    user.selectText()
                    App.view.userman.Login.fadeOutProgress()
                }
            }
            function createViewportAuth(){
                me.destroy()// GC logout reloads page
                Ext.globalEvents.fireEvent('createViewport')
            }
        }
        // UI actions

        function loadDesktop(){
    //requires:[
//        'App.view.Bar',
      //  'App.view.Desktop'
    //],

/*    ,items:[
//        { xtype: 'app-bar' },
        { xtype: 'desktop' }
    ]*/

/*    ,initComponent: function() {
 *       var me = this
 *       me.items = [
 *           { xtype: 'app-bar' }
 *          ,{ xtype: 'desktop' }
 *       ]
 *       me.callParent(arguments)
 *   }*/
        }
        function gotoRoles(_, ev){
            if(ev.getKey() == ev.ENTER){
                role.focus()
            }
        }
        function gotoPass(_, ev){
            if(ev.getKey() == ev.ENTER){
                pass.focus()
            }
        }
        function gotoAuth(_, ev){
            if(ev.getKey() == ev.ENTER){
                auth.focus()
            }
        }
        function enablePass(){
            pass.enable()
        }
        function enableAuth(){
            auth.enable()
        }

    },
   destroy: function destroy(){
        this.callParent(arguments)
        App.view.userman.Login.destroy()
        App.getApplication().controllers.removeAtKey('Userman')
        App.controller.Userman = App.view.userman.Login = null
    }
})

App.getApplication().getController('Userman')/* dynamically load && init */
