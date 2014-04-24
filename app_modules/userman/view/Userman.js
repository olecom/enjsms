/*
 * NOTE: always provide class namespace placeholder (see bottom)
 */

//Ext.define('App.view.Userman',{// slow initial loading
App.cfg['App.view.Userman'] = {  // just cfg (fast `App` loading)
    extend: 'App.view.Window',
    title: 'App.view.Userman',
    wmImg: (App.cfg.backend.url || '') + '/css/userman/userman_shortcut.png',
    wmTooltip: 'Userman',
    wmId: 'Userman',
    autoScroll: true,
    width: 777,
    height: 555,
    items:[
    ]
}

Ext.ns('App.view.Userman')// placeholder
