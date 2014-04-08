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

        Ext.select("#l10n > span").each(function l10n_changers(el){
            el.dom.onclick = function l10n_set_and_change(){
                if('l10n-reset' == this.className){
                    if(localStorage.l10n){
                        delete localStorage.l10n
                        Ext.Msg.alert({
                            icon: Ext.Msg.INFO,
                            buttons: Ext.Msg.OK,
                            title: l10n.um.l10n,
                            msg: l10n.um.l10nReset,
                            callback: function l10n_reload(){
                                location.reload(true)
                            }
                        })
                    }
                    return
                }
                if(0 == this.className.indexOf(l10n.lang))
                    return
                localStorage.l10n = this.className.slice(0, 2)// first two
                location.reload(true)
            }
        })

        App.cfg.createViewport = false// tell `Main`, this will fire `createViewport`

        user = me.getUser()
        role = me.getRole()
        pass = me.getPass()
        auth = me.getAuth()

        User = App.model.userman.User// must be required first from app module

        user.onTriggerClick = onSessionShutdownClick
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
                logout: logout
            }
            //,controller: { }
            //,store: {}
        })

        User.login('?', getSessionInfo)// ask backend for current session

        me.listen({
            global:{
                backendWaitEvents: handleBackendWaitEvents,
                backendEvents: handleBackendEvents
            }
        })

        return

        function getSessionInfo(ret){
            if(ret.can){
                user.emptyText = ret.user.id
                user.applyEmptyText()
                user.setHideTrigger(false)
                role.suspendEvents()// prevent e.g. pass.enable()
                role.setValue(l10n.um.roles[ret.can.__name] || ret.can.__name)
                role.resumeEvents()
                auth.setText(l10n.um.loginCurrentSession)
                auth.enable()
                return// auth is ok in this session
            }
        }

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
        function onSessionShutdownClick(ev){
            User.logout()
            ev && Ext.Msg.alert({
                icon: Ext.Msg.INFO,
                buttons: Ext.Msg.OK,
                title: l10n.um.logoutTitle,
                msg: l10n.um.logoutMsg(user.emptyText)
            })
            user.emptyText = l10n.um.loginUserBlank
            user.reset()
            user.focus()
            user.setHideTrigger(true)
            role.store.removeAll(true)
            role.reset()
            auth.disable()
            auth.setText(l10n.um.loginOk)
        }

        function reqRole(field, newUserId){
            if(defer) clearTimeout(defer)
            if(newUserId){
                if(!auth.disabled && newUserId != user.emptyText){
                    onSessionShutdownClick()
                }
                defer = setTimeout(function deferReqRoles(){
                    defer = 0
                    User.login(newUserId, function getSessionInfo(ret){
                        if(ret.can){
                            App.view.userman.Login.fadeOut(createViewportAuth)
                            return// auth is ok in this session
                        }

                        if(!ret.roles.length){// no user or roles
                            if(!role.disabled){// if UI has something already
                                role.store.removeAll(true)
                                role.reset()
                                role.disable()
                                pass.reset()
                                pass.disable()
                                auth.disable()
                            }
                            return
                        }
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
                return
            }
            if(!role.disabled){// empty user id
                role.store.removeAll(true)
                role.reset()
                role.disable()
                pass.reset()
                pass.disable()
                auth.disable()
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
            function callbackAuth(success, res){
                if(success){
                    App.User = User
                    App.view.userman.Login.fadeOut(createViewportAuth)
                } else {
                    // reload if no session (e.g. backend reloaded)
                    (res.status && 402 === res.status) && location.reload(true)
                    // continue (e.g. wrong password)
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
                (role.disabled ? auth : role).focus()
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
            pass.enable()
        }
        function enableAuth(){
            auth.enable()
        }
        function logout(){
            Ext.Msg.alert({
                icon: Ext.Msg.INFO,
                buttons: Ext.Msg.OK,
                title: l10n.um.logoutTitle,
                msg: l10n.um.logoutMsg(User.get('id')),
                fn: function(){
                    User.logout(function(){
                        location.reload(true)
                    })
                }
            })
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
