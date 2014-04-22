App.view.items_Shortcuts = Ext.Array.push(App.view.items_Shortcuts || [], [
{
    text:
'<img height="64" width="64" src="' + (App.cfg.backend.url || '') +
'/css/userman/userman_shortcut.png"/>' +
'<br/><br/>' +
l10n.um.users +
'<br/>'
   ,height:110 ,minWidth:92
   ,tooltip: l10n.um.tooltip
   ,handler:
    function open_enjsms(){
    var tb = Ext.getCmp('wm').items.getByKey('Userman')
        if(tb){
            tb.toggle(true)
        } else {
            Ext.create('App.view.Userman', { renderTo: Ext.getCmp('desk').getEl() })
        }
    }
}
])
