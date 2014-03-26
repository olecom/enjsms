var http = require('http')

http.ServerResponse.prototype.ContentTypes = {
    AppJSON:   { 'Content-Type': 'application/json; charset=utf-8' },
    AppJS:     { 'Content-Type': 'application/javascript; charset=utf-8' },
    TextPlain: { 'Content-Type': 'text/plain; charset=utf-8' }
}

http.ServerResponse.prototype.json =
/*  res.json({ success: true })
 *  res.json('{ "success": true }')
 *  res.json(401, { msg: ' Authorization Required' })
 */
function res_json(obj){
    if(2 == arguments.length){// args: status / body
        this.statusCode = obj
        obj = arguments[1]
    }
    if('string' != typeof obj) obj = obj && JSON.stringify(obj) || '{"success": true}'
    this.setHeader('Content-Length', Buffer.byteLength(obj))
    this.writeHead(this.statusCode, this.ContentTypes.AppJSON)
    this.end(obj)
}

http.ServerResponse.prototype.js =
/*  res.json({ success: true })
 *  res.json('{ "success": true }')
 *  res.json(401, { msg: ' Authorization Required' })
 */
function res_js(code){
    if(!code){
        code = ';/* No Code or Unauthorized */;'
    } else if('string' != typeof obj){
        code = code.toString()
    }
    this.setHeader('Content-Length', Buffer.byteLength(code))
    this.writeHead(this.statusCode, this.ContentTypes.AppJS)
    this.end(code)
}
