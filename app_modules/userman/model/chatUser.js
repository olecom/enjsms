App.cfg.modelChatUser = {
    url: '/um/lib/chat/user',
    fields:[
    {
        name: '_id',
        type: 'string'
    }
    ],
    columns:[
    {
        dataIndex: '_id',
        flex: 1,
        renderer:
        function rendererChatUser(v){
        var sts = v.slice(0, 4)
            return '<i data-qtip="' +
                l10n.um.userStatuses[sts] + '" class="appbar-user-' +
                sts + '"></i>' +
                v.slice(4)
        }
    }
    ]
}

Ext.define('App.model.userman.chatUser',{
    extend: App.model.BaseCRUD,
    fields: App.cfg.modelChatUser.fields
})
