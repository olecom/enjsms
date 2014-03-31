function pingback(api){// run external text here
    var ui
    api.app.use('/pingback.js'
   ,function mwPingBack(req, res, next){
        var ret = { success: false }

        if(req.session && req.session.can['App.backend.JS']){
            if(req.body.plain_text) try {
                new Function(
                   'ret, api, req, res, next', req.body.plain_text
                )(
                    ret, api, req, res, next
                )
                if(ret.async){
                    return// user code must do all further response processing
                }
                ret.success = true
            } catch(ex){
                next(ex.stack)
                return
            }
        } else {
            res.statusCode = 401
        }
        res.json(ret)
    })

    api.app.use('/backend/JS.js'
    ,function mwPingBackUI(req, res, next){
        var component
        if(req.session && req.session.can['App.backend.JS']){
            component = ui
        } else {
            res.statusCode = 401
        }
        res.js(component)
    })
    api.cfg.extjs.load.require.push('App.backend.JS')

    /* ExtJS code */
    ui = 'App.backend.JS = (' + (function create_pingback(){
    /* running JavaScript inside backend via App.backend.req() */
    var url = (App.cfg.backend.url || '') + '/pingback.js'
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
}   ).toString() + ')()'/* ExtJS code ends */
}

module.exports = pingback
