var Users = {// users db
    olecom:{
        /* static changable data (for DB) */
        id: 'olecom',
        // require('crypto').createHash('sha1').update(pass).digest('hex')
        pass: '9d4e1e23bd5b727046a9e3b4b7db57bd8d6ee684',
        roles: [ 'developer.local', 'admin.local', 'developer' ],
        name:'Олег Верич',
    }
}

module.exports = Users
