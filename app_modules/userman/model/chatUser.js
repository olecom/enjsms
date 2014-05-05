App.cfg.modelChatUser = {
    url: '/um/lib/chat/user',
    fields:[
    {
        name: 'id',
        type: 'string',
        persist: false
    }
    ],
    columns:[
    {
        dataIndex:'id',
        flex: 1
    }
    ]
}

Ext.define('App.model.userman.chatUser',{
    extend: 'App.model.BaseCRUD',
    fields: App.cfg.modelChatUser.fields
})
