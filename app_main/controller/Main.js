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

Ext.define('App.back.Connection',{
    singleton: true,
    extend: 'Ext.data.Connection',
    method: 'POST',
    defaultHeaders:{
        'Content-Type': 'text/plain; charset=utf-8'
    }
})

//!!! TODO: if(req.session.user.can.js), load this
App.back.JS = (function create_pingback(){
    var url = (App.cfg.backend.url || '') + 'pingback.js'

    return function run_js_code_on_backend(code, cb){
        App.back.Connection.request({
            url: url, params: code, callback: cb || default_callback
        })
    }
    function default_callback(opts, ok, res){
        try {
            console.dir(App.back.JS.res = JSON.parse(res.responseText))
            console.log('`App.back.JS.res` has this `Object`')
        } catch (ex) {
            console.error(ex)
            if(ex.stack) console.log(ex.stack)
        }
    }
})()
