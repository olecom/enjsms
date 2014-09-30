App.view.items_Shortcuts = Ext.Array.push(App.view.items_Shortcuts || [ ],[
{
    text:
'<img height="64" width="64" src="' + App.backendURL +
'/enjsms/enjsms.png"/><br><br>' +
'enjSMS' +
'<br>'
   ,height:110 ,minWidth:92
   ,tooltip: 'SMS via VOIP modems (screen shot)'
   ,handler:
    function launch_enjsms(){
        (new ENJSMS.view.Viewport({
            constrainTo: Ext.getCmp('desk').getEl()
        })).maximize()
    }
}
])

Ext.define('ENJSMS.view.Viewport',
{
    extend: App.view.Window,
    title: 'Picture of ENJSMS.view',
    wmImg: App.backendURL + '/enjsms/enjsms.png',
    wmTooltip: 'enjSMS',
    autoScroll: true,
    layout: 'auto',
    width: 1111,
    height: 577,
    items:[
    {
        xtype: 'image',
        src: App.backendURL + '/enjsms/sms.jpg'
    }]
})
