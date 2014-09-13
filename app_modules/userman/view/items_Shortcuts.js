App.view.items_Shortcuts = Ext.Array.push(App.view.items_Shortcuts || [], [
{
    text:
'<img height="64" width="64" src="' + App.backendURL +
'/css/userman/userman_shortcut.png"/>' +
'<br/><br/>' +
l10n.um.users +
'<br/>'
   ,height:110 ,minWidth:92
   ,tooltip: l10n.um.tooltip
   ,handler:
    function open_userman(btn){
    var tb = Ext.getCmp('wm').items.getByKey('um.view.Userman')
        if(tb){
            tb.toggle(true)
        } else {
            App.create('um.controller.Userman', btn)
        }
    }
}
,
{
    text:
'<img height="64" width="64" src="' + App.backendURL +
'/css/userman/chat_64px.png"/>' +
'<br/><br/>' +
l10n.um.chat.title +
'<br/>'
   ,height:110 ,minWidth:92
   ,tooltip: l10n.um.chat.tooltip
   ,handler:
    function open_chat(btn){
    var tb = Ext.getCmp('wm').items.getByKey('um.view.Chat')
        if(tb){
            tb.toggle(true)
        } else {
            App.create('um.controller.Chat', btn)
        }
    }
}
])
