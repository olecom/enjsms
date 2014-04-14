/*
 *  'nodejs + connectjs': HTTP communication with backend (remote web browser)
 */

(function get_extjs_remote_config(url){
var xhr = new XMLHttpRequest
    xhr.open(
        'GET'
        ,(url ? url : '') + '/app.config.extjs.json'
        ,true
    )
    xhr.onreadystatechange = onreadystatechange
    xhr.send()
    return

    function onreadystatechange(res){
    var extjs_config, req = res.target
        if(4 == req.readyState){
            if(200 != req.status){
                throw new Error(xhr ? l10n.errload_config_read : l10n.extjsNotFound)
            } else {
                if(xhr){
                    xhr = null
                    extjs_config = JSON.parse(req.responseText)
                    if(url){// `nw` context
                        app.config.extjs.load = extjs_config.load
                        app.extjs_load(document, window)
                        return
                    }
                    // `browser` context
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
                } else {
                    app.extjs_load(document, window)
                }
            }
        }
    }
})(app.config && app.config.backend.url)
