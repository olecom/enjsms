Ext.ns('App.view')
App.view.items_Shortcuts = Ext.Array.push(App.view.items_Shortcuts || [],[
{
    text:
'<img height="64" width="64" src="' + (App.cfg.backend.url || '') +
'/enjsms/enjsms.png"/>' +
'<br/><br/>' +
'enjSMS<br/>'
   ,height:110 ,minWidth:92
   ,tooltip: 'SMS via VOIP modems (screen shot)'
   ,handler:
    function open_enjsms(){
        Ext.create('ENJSMS.view.Viewport', { renderTo: Ext.getCmp('desk').getEl() })
    }
}
])

Ext.define('ENJSMS.view.Viewport',{
    extend: 'App.view.Window',
    title: 'Picture of ENJSMS.view',
    wmImg: (App.cfg.backend.url || '') + '/enjsms/enjsms.png',
    wmTooltip: 'enjSMS',
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
