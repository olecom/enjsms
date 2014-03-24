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
    init: function(){
        var me = this
        if(me.inited){
            return
        }
        me.inited = true

        me.listen({
            global:{
                updateVersions: me.updateVersions
               ,userStatus: me.handleUserStatus
            },
            controller:{ },
            component:{ },
            store:{ }
        })

    }
   ,handleUserStatus: function handleUserStatus(item){
        App.sts(
            'userstatus',
            item.itemId,
            l10n.stsOK,
            new Date
        )
    }
    ,updateVersions: function updateVersions(){
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
})
