/*
 * Consume: http://$FQDN:$PORT/um/lib/wes
 *
 * Wait events from backend using "long pooling".
 * The request is pending until something is there.
 * Thus:
 * >
 * > App.um.wes(status)
 * >
 * will not response until *next* event from backend
 *
 *
 * @status is current user status from backend:
 * App.User.id: 'onlidev@127.0.0.1 BcORk11VGsInZtzrLHD0LtYy'
 *   user status:^^^^   |         |
 *      user auth id:^^^|         |
 *            IP address:^^^^^^^^^|
 *                 `req.sessionID`:^^^^^^^^^^^^^^^^^^^^^^^^
 *
 * used in e.g. Chat to make this user bold
 *
 * If there is no pending `res` in session,
 * then user status is set `offline` ('appbar-user-offl')
 *
 * backend errors: w.res.statusCode = 501// "Not Implemented" + JSON
 *
 **/

App.um.wes = (
function create_backend_wait_events(conn){
var defaults
    /* channel#2: receive events from backend, send user status */
    conn.suspendEvents(false)// `this` fires own signal in callback()
    conn.url = App.backendURL + '/um/lib/wes'
    conn.timeout = App.cfg.extjs.wes.timeout || (1 << 22)// ~ hour
    conn.defer = null
    defaults = {
    // `wes` has only one polling `res` per `req.session`,
    // but to send new status second `req` is firing
        autoAbort: false,
        callback: backend_events
    }
    console.log('init: ' + App.User.id)
    req('onli')// setup user status by 'appbar-user-onli'

    return req// return function to act manually e.g: `App.um.wes(status)`

    function req(opts){
    var ev = 'initwes@UI'

        Ext.globalEvents.fireEventArgs(ev, [ ev ])

        if(!opts){
            opts = { }
        } else if('string' == typeof opts){// change status
            opts = { params: opts }
        }
        if(!opts.params){// if empty send current user status
            opts.params = App.User.id.slice(0, 4)
        }

        return conn.request(Ext.applyIf(opts, defaults))
    }

    function backend_events(o, success, res){
    var data, i

        if(success){
            // reset error state if any
            if(App.User.internalId){// tmp store for status in case of connection errors
                App.User.id = App.User.internalId// restore past status
                App.User.internalId = ''
            }
            if(conn.defer){
                clearTimeout(conn.defer)
                conn.defer = 0
            }
            // data processing
            if(!res.responseText) return req()// nothing to do
            try {
                data = JSON.parse(res.responseText)
            } catch(ex){
                success = false
                console.error('JSON App.um.wes:')
                console.error(res)
                Ext.Msg.show({
                   title: l10n.errun_title + ' JSON App.um.wes',
                   buttons: Ext.Msg.OK,
                   icon: Ext.Msg.ERROR,
                   msg:
('data: ' + (res.responseText || 'empty')).slice(0, 16).replace(/</g, '&lt;')
+'<br><b>'+ l10n.errun_stack + '</b>' + ex.stack.replace(/</g, '&lt;')
                })
            }
            if(!data || !data.length) return req()// nothing to do
            // handle own events
            i = data.length - 1
            do {// scan from bottom up (our event are likely to be last in list)
                switch(data[i].ev){
                // broadcasts: 'login@um' 'initwes@um' 'usts@um' ....
                default: break
                // == private events ==
                case 'Usts@um':
                // assign backend's ID instead of autogenerated User Model's ID
                    o = data[i].json
                    if(o && App.User.id != o){
                        App.User.id = o// UI event is in `um.controller.Login`
                        App.User.internalId && (App.User.internalId = '')
                    }
                    if('initwes@um' != data[0].ev &&// this is 1st event
                     !(data[2] && 'login@um' == data[2].ev)){// this is 3d one
                        o = null// do not setup twice if not init
                    }
                }
            } while(i--)
            if(o) req()// setup wes for next events, if not manual status

            return Ext.globalEvents.fireEventArgs(// broadcast !own event
                'wes4UI',
                [ success, data ]
            )
        }

        if(res.timedout) return req()// just restart polling
        if(-1 == res.status){// abort
            console.warn('wes: abort detected')
            return req()// try to restart polling
        }

        console.error('wes:', res)

        if(!App.User.internalId){
            App.User.internalId = App.User.id// save current status
            // mark as offline in case of permanent error
            App.User.id = 'offl' + App.User.id.slice(4)
        }
        conn.defer = Ext.defer(// retry a bit later
            req,
            App.cfg.extjs.wes.defer || (1 << 17)// ~ two minutes
        )
        Ext.globalEvents.fireEventArgs(
            'wes4UI',
            [ success, res.statusText || 'Disconnect']
        )

        return undefined
    }
})(Ext.create(App.backend.Connection))
