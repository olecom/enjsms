/*
 * Connection to backend
 */
Ext.define('App.backend.Connection',{
    extend: 'Ext.data.Connection',
    method: 'POST',
    url: App.cfg.backend.url ? App.cfg.backend.url : '',
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
