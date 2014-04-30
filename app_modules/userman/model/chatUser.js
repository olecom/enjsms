App.cfg.modelChatUser = {
    url: '/um/lib/chat',
    fields:[{
        name: 'id',
        type: 'string',
        persist: false,

        dataIndex:'id',
        flex: 1

    }]
}

Ext.define('App.model.userman.chatUser', {
    extend: 'App.model.BaseCRUD',
    url: App.cfg.modelChatUser.url,
    fields: App.cfg.modelChatUser.fields
})
