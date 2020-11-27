const express = require('express')
const app = express()
const http = require('http').createServer(app)
const cookie = require('cookie')
const io = require('socket.io')(http)
const fs = require('fs')
const path = require('path')
const {UserHandler, Users} = require('./assets/users.js')
const {CardHandler} = require('./assets/cards.js')

const loginIO = io.of('/login')
const gameIO = io.of('/game')

const ip = require('ip').address()
const port = 80

const cardPath = path.join(__dirname, '/assets/cards/')

const userHandler = new UserHandler(__dirname + '/data/users.json')

const cardHandler = new CardHandler(cardPath, __dirname + '/data/cards.json')

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

    userHandler.getUsers(users => {
        if (id === undefined || !users.includes(id)) {
            socket.emit('redirect', JSON.stringify({location: ''}))
            return
        }

        users.userConnected(id)
        users.setUserProperty(id, 'socket', socket.id)

        socket.emit('name', users.getUserProperty(id, 'name'))

        userHandler.setUsers(users)
    })

    let hand = cardHandler.getNewRedCards(7)

    socket.emit('hand', JSON.stringify(hand))

    socket.on('select', card => {
        console.log(card)
    })

    socket.on('disconnect', () => {
        userHandler.getUsers(users => {
            if (id !== undefined) {
                users.userDisconnected(id)
            }
            userHandler.setUsers(users)
        })
    })
})

http.listen(port, () => {
    console.log(`Listening on http://${ip}:${port}`)
})