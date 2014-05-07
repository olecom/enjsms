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
        flex: 1
    }
    ]
}

Ext.define('App.model.userman.chatUser',{
    extend: App.model.BaseCRUD,
    fields: App.cfg.modelChatUser.fields
})
