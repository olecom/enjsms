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
    function open_userman(btn){
    var tb = Ext.getCmp('wm').items.getByKey('Userman')
        if(tb){
            tb.toggle(true)
        } else {
            App.create('view.Userman', btn,{
                renderTo: Ext.getCmp('desk').getEl()
            })
        }
    }
}
,
{
    text:
'<img height="64" width="64" src="' + (App.cfg.backend.url || '') +
'/css/userman/chat_64px.png"/>' +
'<br/><br/>' +
l10n.um.chat.title +
'<br/>'
   ,height:110 ,minWidth:92
   ,tooltip: l10n.um.chat.tooltip
   ,handler:
    function open_chat(btn){
    var id = 'Chat', tb = Ext.getCmp('wm').items.getByKey(id)
        if(tb){
            tb.toggle(true)
        } else {
            if(!App.getApplication().controllers.getByKey(id)) App.create(
                'controller.' + id, btn
            )
        }
    }
}
])
