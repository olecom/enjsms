Ext.define('App.view.Bar',{
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'app-bar'
   ,baseCls: 'x-gray-toolbar'
   ,defaults:{
        //scale: 'small'
        //cls: 'appdesktop-btn'
        //height:44
    }
   ,initComponent: function bar_dynamic_init(){
    var me = this

        me.items = Ext.Array.push([
            {// window manager
                xtype:'toolbar'
               ,baseCls: 'x-gray-toolbar'
               ,style:'border:0;'
               ,flex: 1
               ,enableOverflow: true
               ,items:[{
                    text: '<img height=16 width=16 src="css/favicon.png"/>'
                   ,enableToggle: true
                    //,toggleHandler: onItemToggle
                   ,pressed: true
                }
               ,{ text: '<img height=16 width=16 src="'+ App.cfg.backend.url + '/css/userman/userman_shortcut.png"/>' }
                ]
            }
            ]
            ,App.view.items_Bar// app modules items
        )

        me.callParent(arguments)
        delete App.view.items_Bar
    }
})
