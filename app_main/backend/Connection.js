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
 * usage:
 *      App.backend.req('/ns/action', 'online')
 *      App.backend.req('/ns/action', { status: "online" })
 */
App.backend.req = (
function create_backend(conn){
    /* channel#1: request data from backend */
    return function backend_request(url, data, options){
        if(url && (0 != url.indexOf('http'))){
            url = conn.url + url
        }

        if(!options){
            options = {
                url: url,
                params: null,
                jsonData: null
            }
        } else {
            options.url = url
        }

        if('string' == typeof data){
            options.params = data
        } else {
            options.jsonData = data
            options.headers = {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }

        return conn.request(options)
    }
}
)(Ext.create('App.backend.Connection'))
