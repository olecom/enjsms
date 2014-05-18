//Ext.define('App.view.Userman',{ // slow initial loading
App.cfg['App.um.view.Userman'] = {// just cfg (fast `App` loading)
    ns: 'um',
    extend: 'App.view.Window',
    title: 'App.um.view.Userman',
    wmImg: (App.cfg.backend.url || '') + '/css/userman/userman_shortcut.png',
    wmTooltip: 'Userman',
    wmId: 'Userman',
    autoScroll: true,
    width: 777,
    height: 555,
    items:[
    ]
}
