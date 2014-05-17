Ext.define('App.view.Chat',
{
    extend: 'App.view.Window',
    title: l10n.um.chat.title,
    wmImg: (App.cfg.backend.url || '') + '/css/userman/chat_64px.png',
    wmTooltip: 'Chat',
    wmId: 'Chat',
    width: 777,
    height: 555,
    layout: 'border',
    stateful: true,
    stateId: 'um.c',
    onEsc: Ext.emptyFn,
    items:[
    {
        region: 'south',
        collapsible: !true,
        layout: 'hbox',
        items:[
        Ext.create('Ext.panel.Tool',{
            type: 'help',
            tooltip: {
                text: l10n.um.chat.keys,
                dismissDelay: 23456
            }
        }),
        {
            xtype: 'textfield',
            fieldLabel: '<b>' + App.User.get('id') + '</b>>',
            labelSeparator: '',
            labelWidth: 'auto',
            padding: '0 0 0 5',
            fieldStyle: 'font-family: Tahoma, sans-serif; font-size: 12pt;',
            flex: 1
        },
        {   xtype: 'button', text: l10n.um.chat.send, iconCls: 'ok' }
        ]
    },{
        region: 'east',
        title: l10n.um.chat.users,
        layout: 'fit',
        collapsible: true,
        split: true,
        width: 150
        //items: with dynamic stuff are filled by the controller
    },{
        region: 'center',
        autoScroll: true,
        itemId: 'cr',// chat room
        bodyStyle: 'font-family: Tahoma, sans-serif; font-size: 12pt; background-color: black;',
        layout:{
            type: 'table',
            columns: 3,
            tableAttrs:{
                style: 'color:#FFFFFF; width:100%; padding: 0 0 16px 8px;'
            }
        }
        //items: with dynamic stuff are filled by the controller
    }
    ]
}
)
