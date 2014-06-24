Ext.define('App.view.Window',
{
    extend: Ext.window.Window,
    wm: null,//task bar / window manager button
    wmImg: 'css/ok.png',
    wmTooltip: 'wm tooltip',
    constrainHeader: true,// doesn't work properly
    autoShow: true,
    maximizable: true,
    __resizeLock: false,// see `fixHeight()`
    layout: 'fit',
    tools:[{
        type: 'refresh',
        tooltip:// developer's stuff must have no `l10n`
'view developent: reload <b>view</b> && <b>controller</b><br>' +
'<b style="color:red">NOTE</b>: no models or stores etc. are reloaded by default',
        callback:// anti-MVC pattern, but this is an abstract window to extend and control
        function reload_devel_view(panel, tool, event){
        var url

            if(!panel.wmId){
                console.warn("window doesn't support devepment mode")
                return
            }

            panel.destroy()// models, stores and backend can be reloaded there
            Ext.Loader.loadScript({
                url: url = (App.cfg.backend.url || '') + '/' +
                     panel.wmId.replace(/[.]/g, '/') + '.js'
               ,onLoad: function view_loaded(){
                    Ext.Loader.removeScriptElement(url)
                    Ext.Loader.loadScript({
                        url: url = url.replace(/[/]view[/]/, '/controller/')
                       ,onLoad: function ctl_loaded(){
                            Ext.Loader.removeScriptElement(url)
                            App.create(panel.wmId.replace(/view[.]/, 'controller.'))
                        }
                       ,onError: function ctl_not_loaded(){
                            Ext.Loader.removeScriptElement(url)
                            App.create(panel.wmId, null,{
                                constrainTo: Ext.getCmp('desk').getEl()
                            })
                        }
                    })
                }
            })
        }
    },
    {
        type: 'help',
        tooltip: 'Get Help',
        callback:
        function get_help(panel, tool, event){
            console.warn('abstract method')
        }
    }],
    initComponent:// anti-MVC pattern
    function dynamic_init_window(){
    var me = this

        if(!me.constrainTo) me.constrainTo = Ext.getCmp('desk').getEl()
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
            /* Fix bug with `constrainTo` window, which is wrongly maximized
             * - maximize: initial event
             * - resize: browser window resizes
             * */
            maximize: function maximizeViewWindow(w){
                w.__resizeLock = true
                w.setHeight(w.getHeight() - 34)// fix size
                w.__resizeLock = false
            },
            resize: function fixMaximizedHeight(w){
                if(w.maximized && !w.__resizeLock){
                    w.__resizeLock = true
                    w.setHeight(w.getHeight() - 34)// fix `constrainTo`
                    w.__resizeLock = false
                }
            },
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
