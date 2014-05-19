(// support reloading for development
function(override){
var id = 'App.controller.Chat'
   ,cfg = {
    extend: App.controller.Base,
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
    //!!!chat: null,// dev tools: App.getApplication().getController('Chat').chat
    init:
    function controllerChatInit(){
    var me = this
       ,text ,cr ,tbl, msg_tpl, prev, curr
       ,users ,uname
       ,sid = 'chatUsers'
       ,date_fmt = Ext.util.Format.dateRenderer('[H:i:s]')
       ,chat = new App.view.Chat({ constrainTo: Ext.getCmp('desk').getEl() })

        chat.on({
            destroy: destroyChat
        })

        /* Developed, tested, debugged using reload `view.Window` tool button */

        // = users =
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

        uname = '<b style="color:#DAA520">' + App.User.get('id') + '</b>&nbsp;|&nbsp;'

        // = text =
        // * chat room *
        cr = chat.down('[itemId=cr]')
        tbl = cr.getEl().dom.children[0].children[0].children[0]// <tbody>
        msg_tpl = Ext.DomHelper.createTemplate(
'<tr style="vertical-align:top;">' +
'<td style="width:32px;">{0}</td>' +
'<td style="width:16%; text-align:right;">{1}</td>' +
'<td style="word-break: break-all;">{2}</td>' +
'</tr>'
        )
        msg_tpl.compile()
        msg_tpl.append(// top line
            tbl,
            [
                date_fmt(new Date),
'<div style="border-bottom:red solid 1px;">&nbsp;' + l10n.um.user + '&nbsp;|&nbsp;</div>',
'<div style="border-bottom:red solid 1px;">' + l10n.um.chat.messages + '</div>'
            ]
        )

        // * text input *
        text = chat.down('textfield')
        text
            .focus()
            .on(
            {   specialkey:
                function on_chat_text_specialkey(field, e){
                var key = e.getKey()
                    // e.HOME, e.END, e.PAGE_UP, e.PAGE_DOWN,
                    // e.TAB, e.ESC, arrow keys: e.LEFT, e.RIGHT, e.UP, e.DOWN
                    if(key == e.ENTER){
                        sendChat()
                    } else if(key == e.ESC){
                        curr = text.getValue()
                        text.setValue()
                    } else if(key == e.UP && !curr){// previous text
                        curr = text.getValue()
                        text.setValue(prev)
                    } else if(key == e.DOWN && curr){
                        text.setValue(curr)// current text
                        curr = null
                    } else if(key == e.PAGE_UP){
                        cr.scrollBy(0, -222, true)
                    } else if(key == e.PAGE_DOWN){
                        cr.scrollBy(0, +222, true)
                    }
                }
                //change: function on_change
            }
        )
        // * send text *
        chat.down('button[iconCls=ok]').on({ click: sendChat })

        /** Developed, tested, debugged using reload `view.Window` tool button **/
        /*----------------------------------------------------------------------*/

        me.listen({
            global:{
               'wes4UI': backendEventsChat
            }
           /*,component:{// dynamic binding and multiple views handling
            *    '[wmId=Chat]':{
            *        close: function(){
            *            console.log('closeView')
            *        }
            *    }
            *}*/
        })

        // some developer friendly stuff
        //!!!me.chat = chat
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
            App.User.can['App.view.Window.tools.refresh'] && (
                App.backend.req('/um/lib/chat/deve')// reload backend api
            )
        }

        function sendChat(){
            if((prev = text.getValue())){
                App.backend.req(
                    '/um/lib/chat/text',
                    {
                        usr: App.User.id,
                        msg: prev
                    }
                )
                text.setValue((curr = ''))
            }
        }

        function backendEventsChat(success, data){
        //backend event e.g.: `wes.broadcast('out@um', wes.get_id(req))// logout`
        var i, msg
           ,u
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
                                msg = (
                                   '<i style="color:#4169E1">' +
                                    l10n.um.chat.user_in +
                                   '</i>&nbsp;<b style="color:#00FF00">' +
                                    msg.json.slice(4, msg.json.indexOf(' ')) + '</b>'
                                )
                                u = '<b style="color:#00FF00">----></b>&nbsp;|&nbsp;'
                            }
                        } else if('out@um' === msg.ev){
                            u = users.getById(msg.json)
                            u && users.remove(u)
                            msg = (
                               '<i style="color:#4169E1">' +
                                l10n.um.chat.user_out +
                               '</i>&nbsp;<b style="color:#FF0000">' +
                                msg.json.slice(4, msg.json.indexOf(' ')) + '</b>'
                            )
                            u = '<b style="color:#FF0000">&lt;----</b>&nbsp;|&nbsp;'
                        } else if('chatmsg@um' === msg.ev){
                            msg = JSON.parse(msg.json)//TODO: try

                            u = (msg.usr == App.User.id ?
                                uname :
                               '&nbsp;' +
                                msg.usr.slice(4, msg.usr.indexOf(' ')) +
                               '&nbsp;|&nbsp;'
                            )
                            msg = msg.msg
                        }
                        if(u){// print msg into chat room
                            msg_tpl.append(
                                tbl,
                                [ date_fmt(new Date), u, msg ]
                            ).scrollIntoView(tbl.parentElement)
                            u = null// clear print flag
                        }
                    }
                } while(i)
            }
        }
    }
}
if(override) cfg.override = id
/* Notice: can not do it in `App.create()`. For some reason `Ext.define()`
 * fails to define controller. Also views reloaded from file and redefined
 * work OK. When redefined in run time something goes wrong and view
 * Class after destroying of an instance fails to create new ones...
 *
 * Thus there are classes with run time development reloading for
 * - controllers (this one),
 * - slow view:
 *   Ext.define('App.view.Chat',...)
 * - and fast view definitions (config only):
 *   App.cfg['App.view.Userman'] = { ... }
 **/
Ext.define(id, cfg)

})(App.controller.Chat)
