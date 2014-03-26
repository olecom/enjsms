/*
 * Connection to backend
 */
Ext.define('App.backend.Connection',{
    extend: 'Ext.data.Connection',
    method: 'POST',
    url: App.cfg.backend ? App.cfg.backend.url : '/',
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
