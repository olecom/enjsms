Ext.define('App.controller.Login', {
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
    init: function controllerLoginInit(){
        var me = this
           ,defer = 0
           ,User, user, role, pass, auth

        Ext.select("#l10n > span").each(function l10n_changers(el){
            return (0 == el.dom.className.indexOf(l10n.lang)) ?
                    el.dom.style.opacity = 0.5 :// fade out current flag
                    el.dom.onclick = l10n_set_and_change// install changer
        })

        App.cfg.createViewport = false// tell `Main`, this will fire `createViewport`
        // UI refs
        user = me.getUser()
        role = me.getRole()
        pass = me.getPass()
        auth = me.getAuth()
        // data
        User = App.model.userman.User// must be required first from app module
        // action
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
                'initwes@UI': handleInitBackendWaitEvents,
                'usts@UI': handleUserStatus,
                'wes4UI': backendEventsLogin,
                logout: logout
            }
            //,controller: { }
            //,store: {}
        })

        User.login('?', getSessionInfo)// ask backend for current session

        return

        function l10n_set_and_change(){
            if('l10n-reset' == this.className){
                if(localStorage.l10n){
                    delete localStorage.l10n
                    Ext.Msg.alert({
                        icon: Ext.Msg.INFO,
                        buttons: Ext.Msg.OK,
                        title: l10n.um.l10n,
                        msg: l10n.um.l10nReset,
                        callback: reload
                    })
                }
                return
            }
            localStorage.l10n = this.className.slice(0, 2)// first two
            reload()
        }

        function reload(){
            location.reload(true)
        }

        function getSessionInfo(ret){
            if(ret.can){
                user.emptyText = ret.user.id
                user.applyEmptyText()
                user.setHideTrigger(false)
                role.suspendEvents()// prevent e.g. pass.enable()
                role.setValue(l10n.um.roles[ret.can.__name] || ret.can.__name)
                role.resumeEvents()
                if('developer.local' == ret.can.__name){
                    authenticate()// fast pass in
                    return
                }
                auth.setText(l10n.um.loginCurrentSession)
                auth.enable()
                return// auth is ok in this session
            }
        }

        //
        function backendEventsLogin(success, data, statusText){
            App.sts(
               'backend events',
                data.length || statusText,
                success ? l10n.stsOK : l10n.stsHE,
                new Date
            )
        }

        function handleInitBackendWaitEvents(msg){
            App.sts(
                msg,
               'init backend Wait EventS',
                l10n.stsOK,
                new Date
            )
        }

        function handleUserStatus(status){
            App.backend.req('/um/userstatus', status)
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
        function authenticate(){
            if(arguments.length){// from button call arguments: `field, ev`
                App.view.userman.Login.fadeInProgress(auth)
            } else {// from direct call
                App.cfg.extjs.fading = false
                auth()// fast `developer.local`
            }

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
                    if(!App.cfg.backend.url){// `browser`
                    /* NOTE: there is no way to match reload or window/tab close
                     *       in the browser.
                     *       Thus session is lost and relogin is required. But
                     *       this can be automated by userscripts.
                     *
                     * node-webkit: session is destroyed only on window `close`
                     **/
                        Ext.EventManager.onWindowUnload(App.User.logout)
                    } else {// `nw`
                        app.w.on('close', function nw_close(){
                            App.User.logout()
                            this.close(true)
                        })
                    }
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
        var bar = App.view.items_Bar, i = 0, f

            me.destroy()// GC logout reloads page

            for(; i < bar.length; ++i){// search user status item
                f = bar[i]
                if('um.usts' == f.id){
                    f.tooltip = l10n.um.userStatus + ':<br><b>' + App.User.get('id') + '</b>'
                    f.text = (
                        '<i>' +
                            App.User.get('name') +
                        '</i> (<b>' + App.User.pes.__name + '</b>)'
                    )
                    break
                }
            }

            Ext.globalEvents.fireEvent('createViewport')
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
                    User.logout(reload)
                }
            })
        }
    },
    destroy: function destroy(){
        this.callParent(arguments)
        App.view.userman.Login.destroy()
        /*
         * NOTE: this controller is still referenced by EventBus via `me.listen()`
         * TODO: in case of logout event from backend, this may show
         *       `view.userman.Login` again without reloading of all Viewport
         */
        App.getApplication().controllers.removeAtKey('Login')
        App.controller.Login = App.view.userman.Login = null
    }
})

App.getApplication().getController('Login')/* dynamically load && init */
