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

        user.onTriggerClick = function onSessionShutdownClick(){
            role.reset()
            auth.disable()
            auth.setText(l10n.um.loginOk)
            user.focus()
            user.setHideTrigger(true)
            Ext.Msg.alert({
                icon: Ext.Msg.INFO,
                buttons: Ext.Msg.OK,
                title: l10n.um.logoutTitle,
                msg: l10n.um.logoutMsg(user.emptyText)
            })
            user.emptyText = l10n.um.loginUserBlank
            user.reset()
            User.logout()
        }

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

        User.login('?', function getSessionInfo(ret){
            if(ret.can){
                user.emptyText = ret.user.id
                user.applyEmptyText()

                role.setValue(l10n.um.roles[ret.can.__name] || ret.can.__name)
                auth.setText(l10n.um.loginCurrentSession)
                auth.enable()
                return// auth is ok in this session
            }
        })

        me.listen({
            global:{
                backendWaitEvents: handleBackendWaitEvents,
                backendEvents: handleBackendEvents
            }
        })

        return

        //
        function handleBackendEvents(success, res){
            App.sts(
                'backend events',
                res.responseText || res.statusText,
                success ? l10n.stsOK : l10n.stsHE,
                new Date
            )
        }

        function handleBackendWaitEvents(msg){
            App.sts(
                'backend events',
                msg,
                l10n.stsOK,
                new Date
            )
        }

        // auth data actions
        function reqRole(field, newUserId){
            if(defer) clearTimeout(defer)
            if(newUserId){
                defer = setTimeout(function deferReqRoles(){
                    defer = 0
                    User.login(newUserId, function getSessionInfo(ret){
                        if(ret.can){
                            App.view.userman.Login.fadeOut(createViewportAuth)
                            return// auth is ok in this session
                        }

                        if(!ret.roles.length)
                            return
                        var models = new Array(ret.roles.length)
                           ,i = 0, r

                        for(; i < ret.roles.length; i++){
                            r = ret.roles[i]
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
        }
        function createViewportAuth(){
            me.destroy()// GC logout reloads page
            Ext.globalEvents.fireEvent('createViewport')
        }

        // auth UI actions
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
        function enablePass(_, value){
            user.setHideTrigger(value.length == 0)
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
