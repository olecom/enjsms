/*
 *  'nodejs + connectjs': HTTP communication with backend (remote web browser)
 */

var xhr = new XMLHttpRequest
xhr.open('GET' ,'/app.config.extjs.json' ,true)
xhr.onreadystatechange = function(){
    if(4 == xhr.readyState){
        if(200 != xhr.status){
            document.write(l10n.errload_config_read)
            window.console && console.error && console.error(
                l10n.errload_config_read
            )
            alert(l10n.errload_config_read)
        } else {// start external/remote ExtJS 'App'
            app = {
                config:{
                    extjs: JSON.parse(xhr.responseText),
                    backend:{// record start time
                        time: new Date,
                        msg: l10n.stsBackendXHR,
                        op: l10n.stsCheck
                    }
                }
            }
            extjs_load(document, window)
        }
    }
}
xhr.send()

if(window.process){
    throw new Error('Wrong code execution attempt!')
}
