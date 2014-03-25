/*
 * Connection to backend
 */
Ext.define('App.backdata.Connection',{
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
App.backdata.JS = (function create_pingback(){
    var url = (App.cfg.backend.url || '') + 'pingback.js'
       ,appjs = { 'Content-Type': 'application/javascript; charset=utf-8' }

    return function run_js_code_on_backend(code, cb){
        App.backdata.Connection.request({
            url: url, params: code, callback: cb || default_callback
           ,headers: appjs
        })
    }
    function default_callback(opts, ok, res){
        try {
            console.dir(App.backdata.JS.res = JSON.parse(res.responseText))
            console.log('`App.backdata.JS.res` has this `Object`')
        } catch (ex) {
            console.error(ex)
            if(ex.stack) console.log(ex.stack)
        }
    }
})()
