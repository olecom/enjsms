function process_uglify_js(process, global){

    global.__res = null// catch request to inform UI, see note in 'uncaughtException'

    process.on('uncaughtException', function(err){
        log('Caught exception: ' + err.stack)
        if(__res){
        // NOTE: with many users and high load this may send errors to
        //       the wrong end; thus this is mostly a development tool
            __res.json({success:false, data: err.stack})
            __res = null
        }
    })

    process.on('exit', function process_exit(){
        log('$ backend process exit event')
    })

}

module.exports = process_uglify_js
