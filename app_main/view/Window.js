Ext.define('App.view.Window',{
    extend: 'Ext.window.Window',
    wm: null,//task bar / window manager button
    wmImg: 'css/ok.png',
    wmTooltip: 'wm tooltip',
    constrainHeader: true,// doesn't work properly
    autoShow: true,
    maximizable: true,
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
