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
    xhr.onreadystatechange = function(res){
        var extjs_config
        if(4 == res.target.readyState){
            if(200 != res.target.status){
                throw new Error(xhr ? l10n.errload_config_read : l10n.extjsNotFound)
            } else {
                if(xhr){
                    extjs_config = JSON.parse(xhr.responseText)
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
                    xhr.open(// check for network availability of ExtJS
                        'HEAD'
                       ,(url ? url : '') + app.config.extjs.path + 'ext-all-nw.js'
                       ,true
                    )
                    xhr.send()
                    xhr = null
                } else {
                    app.extjs_load(document, window)
                }
            }
        }
    }
    xhr.send()
})(app.config && app.config.backend.url)
