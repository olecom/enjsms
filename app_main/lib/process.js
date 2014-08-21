function process_uglify_js(process, global){

    global.__res = null// catch request to inform UI

    process.on('uncaughtException', function(err){
        log('Caught exception: ' + err.stack)
        if(__res){
            __res.json({success:false, data: err.stack})
            __res = null
        }
    })

    process.on('exit', function process_exit(){
        log('$ backend process exit event')
    })

}

module.exports = process_uglify_js
