const fs = require('fs')
const path = require('path')

class UserHandler {

    constructor(file = __dirname + '/data/users.json', options = 'utf8') {
        this.file = path.resolve(file)
        this.directory = path.dirname(this.file)
        this.options = options

        if(!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory)
        }

        if(!fs.existsSync(this.file)) {
            console.log('Users file does not exist')
            fs.writeFileSync(this.file, JSON.stringify({}))
        }
    }

    getUsers(callback) {
        fs.readFile(this.file, this.options, (err, data) => {
            if (err) {
                throw err
            }
            if (callback) {
                let newData = callback(new Users(data))
                if (newData !== undefined) {
                    this.setUsers(newData)
                }
            }
        })
    }

    getUsersSync() {
        return new Users(fs.readFileSync(this.file, this.options))
    }

    setUsers(users, callback = () => {
    }) {
        this.setUsersSync(users)
        callback()
    }

    setUsersSync(users) {
        fs.writeFileSync(this.file, users.toPrettyString(), this.options)
    }

    reset() {
        fs.writeFileSync(this.file, JSON.stringify({}))
    }
}

class Users {

    constructor(data) {
        if (typeof data === 'object') {
            this.data = data
        } else {
            try {
                this.data = JSON.parse(data)
            } catch (e) {
                this.data = {}
            }
        }
    }

    createUser(id, name) {
        if (this.getUser(id) === undefined) {
            this.setUser(id, {id: id, name: name, connected: false})
        }
    }

    getUserID(name) {
        for(let id of Object.keys(this.data)) {
            if(this.getUserProperty(id, 'name') === name) {
                return id
            }
        }
        return undefined
    }

    includes(id) {
        if(undefined === id) {
            return false
        }
        return this.getUser(id) !== undefined
    }

    userConnected(id) {
        this.setUserProperty(id, "connected", true)
    }

    userDisconnected(id) {
        this.setUserProperty(id, "connected", false)
    }

    getUserProperty(id, property) {
        return this.getUser(id)[property]
    }

    setUserProperty(id, property, value) {
        let user = this.getUser(id)
        if(user === undefined) {
            console.log('User ' + id + " doesn't exist")
            return
        }
        user[property] = value
        this.getUser(user)
    }

    getUsers() {
        return this.data
    }

    getConnectedUsers() {
        let connectedUsers = {}

        for(let id of Object.keys(this.getUsers())) {
            if(this.getUserProperty(id, 'connected')) {
                connectedUsers[id] = this.getUser(id)
            }
        }

        return connectedUsers
    }

    getUser(id) {
        return this.getUsers()[id]
    }

    setUser(id, data) {
        this.data[id] = data
    }

    toJSON() {
        return this.data
    }

    toPrettyString() {
        return JSON.stringify(this.toJSON(), null, 2)
    }

    toString() {
        return JSON.stringify(this.toJSON())
    }
}

module.exports = {
    UserHandler,
    Users
}