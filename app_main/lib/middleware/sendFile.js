module.exports = function sendFile(name){
    var fs = require('fs')
       ,api  = require('../api.js')
    return function sendFile(req, res){
        var fstream = fs.createReadStream(__dirname + '/../../' + name)
            fstream.on('open', function(fd){
                try{
                    res.writeHead(200,{
                        'Content-Type': 'application/javascript',
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
                res.json('')
            })
        }
}
