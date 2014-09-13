//App.cfg['App.um.view.Userman'] = {// fast `App` loading; `App.create()` must be used
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
