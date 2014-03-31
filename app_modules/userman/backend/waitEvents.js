App.backend.waitEvents = (function create_backend_wait_events(conn){
    /* channel#2: receive events from backend */
    var defaults
    conn.suspendEvents(false)// `this` fires own signal in callback()
    conn.url = (App.cfg.backend.url ? App.cfg.backend.url : '') + '/wait_events'
    conn.timeout = App.cfg.extjs.wait_events.timeout || (1 << 22)// ~ hour
    conn.defer = null
    defaults = {
        autoAbort: true,// backend has only one `req.session.wait_events_req()`
        callback: function backend_events(options, success, res){
            Ext.globalEvents.fireEventArgs('backendEvents', [ success, res ])
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
    req()// setup waiting cycle
    return req// return function to act manually

    function req(opts){
        //TODO: l10n.um after loading of resources
        Ext.globalEvents.fireEventArgs('backendWaitEvents', [ 'backendWaitEvents' ])
        return conn.request(opts || defaults)
    }
})(Ext.create('App.backend.Connection'))
