/**
 * Main controller for all top-level application functionality
 */
Ext.define('App.controller.Main',{
    extend: 'App.controller.Base',
    /*views:[
        'Viewport',
        //'Desktop'
    ],
    refs:[
        //{
          //  ref: 'Viewport',
            //selector: '[xtype=viewport]'
        //},
        {
            ref: 'Bar',
            selector: '[xtype=app-bar]'
        }
    ],*/
    init: function controllerMainInit(){
        var me = this
           ,createViewport// function var for GC init

        createViewport = handleCreateViewport
        me.listen({
            global:{
                createViewport: createViewport
               ,updateVersions: updateVersions
               ,userStatus: handleUserStatus
// messages:
//auth ok: App.back.Connection.defaultHeaders['X-API'] = '1'
//logout : delete App.back.Connection.defaultHeaders['X-API']
            },
            controller:{ },
            component:{ },
            store:{ }
        })

        return

        function handleUserStatus(item){
            App.sts(
                'userstatus',
                item.itemId,
                l10n.stsOK,
                new Date
            )
        }

        function updateVersions(){
        var el = Ext.get('versions'), _2 = { opacity: 0 }

            el.animate({
                to: _2,
                duration: 1024,
                callback: function versionFadeOut(){
                    el.setHTML(('-= versions =-\n'+
'extjs:,' + Ext.versions.extjs.version + '\n' +
           (App.cfg.backend.url ?
'nodejs:,' + App.cfg.backend.versions.node +
'connectjs:,' + App.cfg.backend.versions.connectjs +
'node-webkit:,'+ App.cfg.backend.versions.nw : '')
                ).replace(/\n/g,'</b><br>').replace(/,/g, '<br><b>')
                    )
                    _2.opacity = 1
                    el.animate({
                        to: _2,
                        duration: 1024,
                        callback: function versionFrameAnim(){
                            el.frame("00FF00", 1, { duration: 1024 })
                        }
                    })
                }
            })
        }

        function handleCreateViewport(){
            if(App.cfg.extjs.fading){
                // very strange composition to get gears to fadeOut and viewport to fadeIn
                var b = Ext.getBody()
                b.fadeOut({duration:777 ,callback:
                    function fadingViewport(){
                        Ext.fly('startup').remove()
                        b.show()
                        Ext.create('App.view.Viewport')
                        b.fadeIn({
                            easing: 'easeIn',
                            duration: 1024,
                            callback: appReady
                        })
                    }
                })
            } else {
                Ext.fly('startup').remove()
                Ext.create('App.view.Viewport')
                appReady()
            }
        }

        function appReady(){
            /*dynamic controller for dynamic models
             * this doesn't work due to curved loading: Controller first, not Model.
               application.config: {
                    models: [ 'Base', 'BaseR', 'Status' ],
                    stores: [ 'Status' ],
                    controllers: [ 'Main' ]
                }
             **/
            //me.viewport = Ext.ComponentQuery.query('viewport')[0]
            me.suspendEvent('createViewport')
            if(createViewport) createViewport = null// GC init

            if(App.cfg.extjs.load.require.length){
                Ext.require(App.cfg.extjs.load.require)
                App.cfg.extjs.load = null// GC loading is done
            }

            App.sts(// add first System Status message
                App.cfg.backend.op,
                App.cfg.backend.msg,
                l10n.stsOK,
                App.cfg.backend.time
            )
            delete App.cfg.backend.op
            delete App.cfg.backend.msg
            delete App.cfg.backend.time
        }
    }// init()
})
