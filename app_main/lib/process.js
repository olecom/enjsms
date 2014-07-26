function process_uglify_js(process){

    process.on('uncaughtException', function(err){
        log('Caught exception: ' + err.stack)
    })

    process.on('exit', function process_exit(){
        log('$ backend process exit event')
    })

}

module.exports = process_uglify_js
