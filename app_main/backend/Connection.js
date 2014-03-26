/*
 * Connection to backend
 */
Ext.define('App.backend.Connection',{
    extend: 'Ext.data.Connection',
    method: 'POST',
    url: App.cfg.backend.url ? App.cfg.backend.url : '/',
    defaultHeaders:{
        'Content-Type': 'text/plain; charset=utf-8'
    }
})

/*
 * Users of Connection Class
 */
App.backend.req = (function create_backend(conn){
    /* channel#1: request data from backend */
    return function backend_request(opts){
        if(opts.url){
            if(0 != opts.url.indexOf('http')){
                opts.url = conn.url + opts.url
            }
        }
        return conn.request(opts)
    }
})(Ext.create('App.backend.Connection'))

App.backend.wait_events = (function create_backend_wait_events(conn){
    /* channel#2: receive events from backend */
    var defaults
    conn.suspendEvents(false)// `this` fires own signal in callback()
    conn.url = (App.cfg.backend.url ? App.cfg.backend.url : '/') + 'wait_events'
    conn.timeout = App.cfg.extjs.wait_events.timeout || (1 << 22)// ~ hour
    conn.defer = null
    defaults = {
        autoAbort: true,// backend has only one `req.session.wait_events_req()`
        callback: function backend_events(options, success, res){
//console.log(res)
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

//!!! TODO: if(req.session.user.can.js), load this
App.backend.JS = (function create_pingback(){
    /* running JavaScript inside backend via App.backend.req() */
    var url = (App.cfg.backend.url || '') + 'pingback.js'
       ,appjs = { 'Content-Type': 'application/javascript; charset=utf-8' }

    return function run_js_code_on_backend(code, cb){
        App.backend.req({
            url: url, params: code, callback: cb || default_callback
           ,headers: appjs
        })
    }
    function default_callback(opts, ok, res){
        try {
            console.dir(App.backend.JS.res = JSON.parse(res.responseText))
            console.log('`App.backend.JS.res` has this `Object`')
        } catch (ex) {
            console.error(ex)
            if(ex.stack) console.log(ex.stack)
        }
    }
})()
