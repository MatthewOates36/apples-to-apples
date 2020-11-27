const express = require('express')
const app = express()
const http = require('http').createServer(app)
const cookie = require('cookie')
const io = require('socket.io')(http)
const fs = require('fs')
const path = require('path')
const {UserHandler, Users} = require('./assets/users.js')

const loginIO = io.of('/login')
const gameIO = io.of('/game')

const ip = require('ip').address()
const port = 80

const cardPath = '/assets/cards/'

const userHandler = new UserHandler(__dirname + '/data/users.json')

app.use('/pages', express.static(path.join(__dirname, 'pages')))

app.use('/assets', express.static(path.join(__dirname, 'assets')))

app.use('/cards', express.static(path.join(__dirname, cardPath)))

app.get('/', (req, res) => {
    res.writeHead(307, {Location: '/pages/login/login.html'})
    res.end()
})

app.get('/game', (req, res) => {
    res.writeHead(307, {Location: '/pages/game/game.html'})
    res.end()
})

loginIO.on('connection', socket => {
    socket.on('name', message => {
        let data = JSON.parse(message)

        userHandler.getUsers(users => {
            let cookies = undefined
            try {
                cookies = cookie.parse(socket.request.headers.cookie)
            } catch (e) {
            }

            let id = ''
            if (cookies === undefined || cookies.id === undefined) {
                do {
                    id = socket.conn.remoteAddress + Math.random().toString(36).substring(2, 15)
                } while (users.includes(id))
            } else {
                id = cookies.id
            }
            if (!users.includes(id)) {
                users.createUser(id, data.name)
            } else {
                users.userDisconnected(id)
                users.setUserProperty(id, 'name', data.name)
            }

            socket.emit('id', JSON.stringify({id: id}))

            return users
        })
    })
})

gameIO.on('connection', socket => {
    let id = undefined

    try {
        id = cookie.parse(socket.handshake.headers.cookie).id
    } catch (e) {

    }

    let redCardIds = getRedCardIds().sort((a, b) => {
        return Math.random() < 0.5 ? -1 : 1;
    })

    redCardIds.splice(7)

    socket.emit('hand', JSON.stringify(redCardIds))
})

let getRedCardIds = () => {
    let redCardNames = fs.readdirSync(path.join(__dirname, cardPath, 'red'))

    return redCardNames.map(card => card.replace('card-', '').replace('.jpg', ''))
}

http.listen(port, () => {
    console.log(`Listening on http://${ip}:${port}`)
})