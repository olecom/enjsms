Ext.define('App.view.Window',
{
    extend: Ext.window.Window,
    wm: null,//task bar / window manager button
    wmImg: 'css/ok.png',
    wmTooltip: 'wm tooltip',
    constrainHeader: true,// doesn't work properly
    autoShow: true,
    maximizable: true,
    tools:[{
        type:'refresh',
        tooltip:// developer's stuff must have no `l10n`
'view developent: reload <b>view</b> && <b>controller</b><br>' +
'<b style="color:red">NOTE</b>: no models or stores etc. are reloaded by default',
        callback:// anti-MVC pattern, but this is an abstract window to extend and control
        function reload_devel_view(panel, tool, event){
        var wmId = panel.wmId
           ,ns = ''
           ,url

            if(!wmId){
                console.warn("window doesn't support devepment mode")
                return
            }

            panel.destroy()// models, stores and backend can be reloaded there
            panel.ns && (ns += '/' + panel.ns)
            Ext.Loader.loadScript({
                url: url = (App.cfg.backend.url || '') + ns + '/view/' + wmId + '.js'
               ,onLoad: function view_loaded(){
                    Ext.Loader.removeScriptElement(url)
                    Ext.Loader.loadScript({
                        url: url = (App.cfg.backend.url || '') + ns + '/controller/' + wmId + '.js'
                       ,onLoad: function ctl_loaded(){
                            Ext.Loader.removeScriptElement(url)
                            ns && (ns = panel.ns + '.')
                            App.create(ns + 'controller.' + wmId)
                        }
                       ,onError: function ctl_not_loaded(){
                            Ext.Loader.removeScriptElement(url)
                            ns && (ns = panel.ns + '.')
                            App.create(ns + 'view.' + wmId, null,{
                                constrainTo: Ext.getCmp('desk').getEl()
                            })
                        }
                    })
                }
            })
        }
    },
    {
        type:'help',
        tooltip: 'Get Help',
        callback:
        function get_help(panel, tool, event){
            console.warn('abstract method')
        }
    }],
    initComponent:// anti-MVC pattern
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
   ,onWMToggle:// anti-MVC pattern
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
}
)
