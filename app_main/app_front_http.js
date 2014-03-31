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
    xhr.onreadystatechange = function(){
        var extjs_config
        if(4 == xhr.readyState){
            if(200 != xhr.status){
                document.write(l10n.errload_config_read)
                window.console && console.error && console.error(
                    l10n.errload_config_read
                )
                alert(l10n.errload_config_read)
            } else {
                extjs_config = JSON.parse(xhr.responseText)
                if(!url){// `browser` context
                    app.config = {
                        extjs: extjs_config,
                        backend:{// record start time
                            time: new Date,
                            msg: l10n.stsBackendXHR,
                            op: l10n.stsCheck
                        }
                    }
                } else {// `nw` context
                    app.config.extjs.load = extjs_config.load
                }
                app.extjs_load(document, window)
            }
        }
    }
    xhr.send()
})(app.config && app.config.backend.url)
