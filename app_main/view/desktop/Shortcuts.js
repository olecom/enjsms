Ext.define('App.view.desktop.Shortcuts',{
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'app-shortcuts',
    style: 'background-color:transparent;background-image:none;'

    //,stateId: 'dpss'
    //,stateful: true

    ,enableOverflow: true
    ,defaults: {
        reorderable: true
    }
    ,plugins : [ { xclass: 'Ext.uxo.BoxReorderer' } ]
    ,initComponent: function shortcuts_dynamic_init(){
        var me = this

        me.items = Ext.Array.push([
        {
            xtype:'splitbutton',
            text: 'Menu Button',
            iconCls: 'add16',
            menu: [{text: 'Menu Item 1'}]
        }
        ,{ xtype: 'datefield' }
        ,{
            text: '<img height=64 width=64 src="css/procman_shortcut.png"/><br/><br/>' +
                  'Процессы<br/>'
            ,height:110 ,minWidth:92
            ,tooltip: 'Запуск/Управление процессами'
        }

        ,{
            text: '<img height=64 width=64 src="css/favicon.png"/><br/><br/>' +
                  'SMS Программа<br/>'
            ,height:110 ,minWidth:92
            ,tooltip: 'SMS Программа'
        }
        ]
        ,App.view.items_Shortcuts// app modules items
        )

        me.callParent(arguments)
        delete App.view.items_Shortcuts
    }
})
