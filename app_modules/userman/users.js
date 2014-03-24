var Users = {// users db
    olecom:{
        /* static changable data (for DB) */
        id: 'olecom',
        pass: 'passmd5',
        roles: [ 'developer.local', 'admin.local', 'developer' ],
        name:'Олег Верич',
        can: null
    }
}

module.exports = Users
