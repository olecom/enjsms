module.exports = function process_uglify_js(_log, _err){

global._log = _log
global._err = _err

process.on('uncaughtException', function(err){
    _log('Caught exception: ' + err.stack)
})

process.on('exit', function process_exit(){
    _log('$ backend process exit event')
})

}
