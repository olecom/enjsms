Ext.define('App.view.Chat',{
    extend: 'App.view.Window',
    title: 'App.view.Chat: ' + l10n.um.chat.title,
    wmImg: (App.cfg.backend.url || '') + '/css/userman/chat_64px.png',
    wmTooltip: 'Chat',
    wmId: 'Chat',
    width: 777,
    height: 555,
    layout: 'border',
    stateful: true,
    stateId: 'um.c',
    items:[
    {
        region: 'south',
        collapsible: !true,
        layout: 'hbox',
        items:[
        {
            xtype: 'textfield',
            fieldLabel: '<b>' + App.User.get('id') + '</b>>',
            labelSeparator: '',
            labelWidth: 'auto',
            padding: '0 0 0 5',
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
        layout:{
            type: 'table',
            columns: 2,
            tableAttrs:{
                style:
'font-family: monospace; background-color: black; color: #FFFFFF; width: 100%; height: 100%'
            },
            trAttrs:{
                style:{
                    'vertical-align': 'top'
                }
            }
        },
        defaults: { xtype: 'component' },
        items: [{
            html: l10n.um.user + '|'
           ,style: 'text-align:right; border-bottom:red solid 1px;'
        },{
            html: l10n.um.chat.messages
            ,style: 'border-bottom:red solid 1px;'
        }
        ]
    }
    ]
})
