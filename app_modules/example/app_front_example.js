Ext.syncRequire( '/l10n/' + l10n.lang + '_example')// require l10n first time
Ext.ns('App.example.controller')

App.view.items_Shortcuts = Ext.Array.push(App.view.items_Shortcuts || [ ],[
{
    text:
'<img height="74" width="68" src="' + App.backendURL +
'/css/example/yd.png"/>' +
'<br/><br/>' + l10n.ex.modname +
'<br/>'
   ,height: 110 ,minWidth: 92
   ,tooltip: l10n.ex.tooltip
   ,handler:
    function launch_pos(btn){
    var tb = Ext.getCmp('wm').items.getByKey('example.view.Supro')
        if(tb){
            tb.toggle(true)
        } else {
            App.create('example.controller.Supro', btn)
        }
    }
}
])
