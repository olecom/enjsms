var cfg

try {
    cfg = JSON.parse(process.env.NODEJS_CONFIG)
} catch(ex){
    cfg = (new Function('var config ; return ' + process.env.NODEJS_CONFIG))(ex)
}

module.exports = cfg
