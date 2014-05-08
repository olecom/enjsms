App.backend.waitEvents = (function create_backend_wait_events(conn){
    /* channel#2: receive events from backend */
    var defaults
    conn.suspendEvents(false)// `this` fires own signal in callback()
    conn.url = (App.cfg.backend.url || '') + '/um/lib/wait_events'
    conn.timeout = App.cfg.extjs.wait_events.timeout || (1 << 22)// ~ hour
    conn.defer = null
    defaults = {
        autoAbort: true,// backend has only one `req.session.wait_events_req()`
        callback: function backend_events(options, success, res){
            Ext.globalEvents.fireEventArgs('wes4UI', [ success, res ])
            if(conn.defer) clearTimeout(conn.defer)
            if(success){
                conn.defer = 0
                req()
                return
            }
            if(-1 != res.status){// if not autoAbort (e.g. manual request)
                conn.defer = Ext.defer(// retry a bit later
                    req,
                    App.cfg.extjs.wait_events.defer || (1 << 17)// ~ two minutes
                )
            }
            return
        }
    }
    req({ params: 'onli' })// setup waiting cycle, send initial user status
    return req// return function to act manually

    function req(opts){
    var ev = 'initwes@UI'
        Ext.globalEvents.fireEventArgs(ev, [ ev ])
        return conn.request(Ext.applyIf(defaults, opts))
    }

})(Ext.create('App.backend.Connection'))
