function pingback(api){// run external text here
var ui

    api.app.use('/pingback.js'
   ,function mwPingBack(req, res, next){
    var ret = { success: false }

        if(req.session && req.session.can['App.backend.JS']){
            if(req.txt) try {
                new Function(
                   'ret, api, req, res, next', req.txt
                )(
                    ret, api, req, res, next
                )
                if(ret.async){
                    return// user code must do all further response processing
                }
                ret.success = true
            } catch(ex){
                next(ex.stack)// pass to the standard error handling middleware
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

    ui = 'App.backend.JS = (' + (
/* == ExtJS code == */
function create_pingback(){
/* running JavaScript inside backend via App.backend.req()
 * usage:
 * > App.backend.JS(' ret.data = { val: 123 } ')
 * >>{"success":true,"data":{"val":123}}
 **/
var url = App.backendURL + '/pingback.js'
   ,appjs = { 'Content-Type': 'application/javascript; charset=utf-8' }

    return function run_js_code_on_backend(code, cb){
        App.backend.req(url, code,{
                callback: cb || default_callback
               ,headers: appjs
            }
        )
    }

    function default_callback(err, json){
        if(err) return console.error(err)

        console.dir(App.backend.JS.res = json)
        console.log('result is here: `App.backend.JS.res`')
    }
}
/* -- ExtJS code ends here -- */).toString() + ')()'
}

module.exports = pingback
