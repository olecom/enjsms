module.exports = function sendFile(name, absolute){
    var fs = require('fs')
       ,api  = require('../api.js')
    return function sendFile(req, res){
    var fstream = fs.createReadStream((absolute ? '' : __dirname + '/../../') + name)
        fstream.on('open', function(fd){
            try{
                res.writeHead(200,{
'Content-Type': ~name.indexOf('css') ? 'text/css' : 'application/javascript',
'Content-Length': fs.fstatSync(fd).size
                })
                fstream.pipe(res)
            } catch(ex){
                res.json('')
                api._err(api.ipt(ex))
            }
        })
        fstream.on('error', function(err){
            api._err(api.ipt(err))
            res.statusCode = 404
            res.end()
        })
    }
}
