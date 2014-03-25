/*
 * Connection to backend
 */
Ext.define('App.backend.Connection',{
    singleton: true,
    extend: 'Ext.data.Connection',
    method: 'POST',
    defaultHeaders:{
        'Content-Type': 'text/plain; charset=utf-8'
    }
})

/* 
 * Users of Connection to backend
 */
//!!! TODO: if(req.session.user.can.js), load this
App.backend.JS = (function create_pingback(){
    var url = (App.cfg.backend.url || '') + 'pingback.js'
       ,appjs = { 'Content-Type': 'application/javascript; charset=utf-8' }

    return function run_js_code_on_backend(code, cb){
        App.backend.Connection.request({
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
