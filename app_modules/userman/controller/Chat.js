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
    init: function controllerChatInit(){
        var me = this
        //me.listen({
        //    global:{
        //    }
            //,controller: { }
            //,store: {}
        //})
        var chat = me.getView('Chat').create()

        chat.on({ destroy: destroyChat })

        return

        function destroyChat(){
        var s, ev
           ,bus = me.application.eventbus.bus
           ,i = me.refs.length - 1

            do {
                s = me.refs[i].selector
                for(ev in bus){
                    bus[ev][s] && delete bus[ev][s]
                }
            } while(i--)
            console.log('destroyController')

            me.application.controllers.removeAtKey('Chat')
            me.destroy()
        }
    }
}
if(override) cfg.override = id

Ext.define(id, cfg)

})(App.controller.Chat)
