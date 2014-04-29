Ext.define('App.view.Window',{
    extend: 'Ext.window.Window',
    wm: null,//task bar / window manager button
    wmImg: 'css/ok.png',
    wmTooltip: 'wm tooltip',
    constrainHeader: true,// doesn't work properly
    autoShow: true,
    maximizable: true,
    tools:[{
        type:'refresh',
        tooltip: 'view developent: load new version',
        callback: function reload_devel_view(panel, tool, event){
            var to = { renderTo: Ext.getCmp('desk').getEl() }
               ,wmId = panel.wmId
               ,url

            panel.destroy()
            Ext.Loader.loadScript({
                url: url = (App.cfg.backend.url || '') + '/view/' + wmId + '.js'
               ,onLoad: function view_loaded(){
                    Ext.Loader.removeScriptElement(url)
                    Ext.Loader.loadScript({
                        url: url = (App.cfg.backend.url || '') + '/controller/' + wmId + '.js'
                       ,onLoad: function ctl_loaded(){
                            Ext.Loader.removeScriptElement(url)
                            App.create('controller.' + wmId, null, to)
                        }
                       ,onError: function ctl_not_loaded(){
                            Ext.Loader.removeScriptElement(url)
                            App.create('view.' + wmId, null, to)
                        }
                    })
                }
            })
        }
    },
    {
        type:'help',
        tooltip: 'Get Help',
        callback: function(panel, tool, event){
        }
    }],
    initComponent:
    function dynamic_init_window(){
    var me = this

        me.callParent()

        me.wm = Ext.getCmp('wm').add({
            text: '<img height=16 width=16 src="' + me.wmImg + '"/>'
           ,itemId: me.wmId || ''
           ,enableToggle: true
           ,pressed: true
           ,tooltip: me.wmTooltip
           ,toggleHandler: me.onWMToggle
           ,scope: me
        })
        me.on({
            destroy: function onCloseWindow(){
                Ext.getCmp('wm').remove(me.wm, /*autoDestroy:*/ true)
                me.wm = null
            },
            activate: function onActivateWindow(){
                me.wm.toggle(true, true)
            },
            deactivate: function onDeactivateWindow(){
                me.wm.toggle(false, true)
            }
        })
    }
   ,onWMToggle:
    function onWMToggle(_, next_state){
    var me = this// window
        if(next_state){
            Ext.WindowManager.front.setActive(false)
            me.isHidden() && me.show()
            me.setActive(true)
        } else {
            me.hide()
            me.wm.toggle(false, true)
            Ext.WindowManager.front.setActive(true)
        }
    }
})
