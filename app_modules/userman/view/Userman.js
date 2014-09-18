//App.cfg['App.um.view.Userman'] = {// fast `App` loading; `App.create()` must be used
(function gc(l10n){

App.view.items_Shortcuts = Ext.Array.push(App.view.items_Shortcuts || [ ],[
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
])

Ext.define('App.um.view.Userman',{ // slow initial loading
    extend: App.view.Window,
    title: 'App.um.view.Userman',
    wmImg: App.backendURL + '/css/userman/userman_shortcut.png',
    wmTooltip: 'Userman',
    wmId: 'um.view.Userman',
    autoScroll: !true,
    stateful: true,
    stateId: 'um.u',
    width: 555,
    height: 444,
    layout: 'border',
    items:[
    {
        region:'north',
        title: 'permissions (what role `can` do)',
        collapsible: true,
        split: true,
        html: '-= can list =-',
        flex: 1
    },
    {
        region:'center',
        title: 'roles as sets of permissions',
        collapsible: true,
        split: true,
        flex: 1
    },
    {
        region:'south',
        title: 'users as sets of id, roles, pass',
        collapsible: true,
        split: true,
        flex: 1
    }
    ]
}
)
})(l10n)
