(// support reloading for development
function(override){
var id = 'App.controller.Chat'
   ,cfg = {
    extend:'App.controller.Base',
    __name: id,
    models:[
        'chatUser'
    ],
    views:[
        'Chat'
    ],
    refs:[
        { ref: 'Chat', selector: '[wmId=Chat]' }
    ],
    chat: null,
    init:
    function controllerChatInit(){
    var me = this
       ,sid = 'chatUsers'
       ,users, chat

        chat = me.getView('Chat').create({
            renderTo: Ext.getCmp('desk').getEl()
        })

        chat.on({
            destroy: destroyChat
        })

        chat.down('[title=' + l10n.um.chat.users + ']').add(
        {
            xtype: 'grid',
            header: false,
            hideHeaders: true,
            columns: App.cfg.modelChatUser.columns,
            store: users = Ext.StoreManager.lookup(sid) || Ext.create('App.store.CRUD',
            {
                storeId: sid,
                url: App.cfg.modelChatUser.url,
                model: App.model.userman.chatUser
            })
        })
        users.load()

        me.listen({
            global:{
               'wes4UI': backendEventsChat
            }
        })

        me.chat = chat

        // some developer friendly stuff
        chat.down('[type=help]').el.dom.setAttribute(
'data-qtip',
'dev info, app module: <b>userman</b>;<br>' +
'classes:<br><b>`model.userman.chatUser`<br>`view.Chat`<br>`controller.Chat`</b>'
        )

        return

        function destroyChat(){
            Ext.StoreManager.lookup(sid).destroyStore()

            me.application.eventbus.unlisten(me.id)
            me.application.controllers.removeAtKey(me.id)

            App.backend.req('/um/lib/chat/deve')// reload backend api
            me.destroy()
        }

        function backendEventsChat(success, data){
        //backend event e.g.: `wes.broadcast('out@um', wes.get_id(req))// logout`
        var i, msg
            if(success){
                i = data.length// is Array or blow up
                if(i) do {
                    if((msg = data[--i])){
                        if('usts@um' === msg.ev){// handle status change, login
                            users.findBy(function findUserId(item, id){
                                if(id.slice(4) == msg.json.slice(4)){
                                // prefix: 'onli' 'away' etc...
                                    item.setId(msg.json)
                                    msg = null
                                    return true
                                }
                                return false
                            })
                            if(msg){// not found, handle login/auth case
                                users.add({ _id: msg.json })
                            }
                        } else if('out@um' === msg.ev){
                            msg.json = users.getById(msg.json)
                            msg.json && users.remove(msg.json)
                        }
                    }
                } while(i)
            }
        }
    }
}
if(override) cfg.override = id

Ext.define(id, cfg)

})(App.controller.Chat)
