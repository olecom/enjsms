/*
 *  'nodejs + connectjs': HTTP communication with backend (remote web browser)
 */

(function app_front_http(url){
var xhr = new XMLHttpRequest
    xhr.open('GET', (url ? url : '') + '/app.config.extjs.json', true)
    xhr.onreadystatechange = load_config_then_ExtJS
    xhr.send()
    xhr = null
    return

    function load_config_then_ExtJS(res){
    var extjs_config, req = res.target

        if(4 != req.readyState) return
        if(200 != req.status) throw new Error(
            ~String(req.responseURL).indexOf('ext-all')?
            l10n.extjsNotFound : l10n.errload_config_read
        )

        if(req.responseText){// config
            extjs_config = JSON.parse(req.responseText)
            if(url){
        // `nw` context
                app.config.extjs.load = extjs_config.load
                app.extjs_load(document, window)
                return
            }
        // `browser` context
        } else {// load after HEAD check
            app.extjs_load(document, window)
            return
        }

        app.config = {
            extjs: extjs_config,
            backend:{// record start time
                time: new Date,
                msg: l10n.stsBackendXHR,
                op: l10n.stsCheck
            }
        }
        req.open(// check for network availability of ExtJS
            'HEAD'
           ,(url ? url : '') + app.config.extjs.path + 'ext-all-nw.js'
           ,true
        )
        req.send()
    }
})(app.config && app.config.backend.url)
