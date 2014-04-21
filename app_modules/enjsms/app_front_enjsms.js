Ext.ns('App.view')
App.view.items_Shortcuts = Ext.Array.push(App.view.items_Shortcuts || [], [
{
    text:
'<img height="64" width="64" src="' + (App.cfg.backend.url || '') +
'/enjsms/enjsms.png"/>' +
'<br/><br/>' +
'enjSMS<br/>'
   ,height:110 ,minWidth:92
   ,tooltip: 'SMS via VOIP modems (screen shot)'
   ,handler: function open_enjsms(){
        Ext.getCmp('desk').add({ xtype: 'app-enjsms'})
    }
}
])

Ext.define('ENJSMS.view.Viewport', {
    extend: 'Ext.window.Window',
    xtype: 'app-enjsms',//correct constrain child init by `xtype`
    constrainHeader: true,
    title: 'Picture of ENJSMS.view',
    autoShow: true,
    maximizable: true,
    autoScroll: true,
    width: 1104,
    height: 600,
    items:[
    {
        xtype: 'image',
        src: (App.cfg.backend.url || '') + '/enjsms/sms.jpg'
    }
    ]
})
