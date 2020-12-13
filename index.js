const express = require('express')
const app = express()
const http = require('http').createServer(app)
const cookie = require('cookie')
const io = require('socket.io')(http)
const path = require('path')

const {UserHandler} = require('./assets/users.js')
const {CardHandler} = require('./assets/cards.js')
const {GameHandler} = require('./assets/game-handler.js')

const loginIO = io.of('/login')
const gameIO = io.of('/game')
const controllerIO = io.of('/controller')

const ip = require('ip').address()
const port = 80

const cardPath = path.join(__dirname, '/assets/cards/')

const userHandler = new UserHandler(__dirname + '/data/users.json')

const cardHandler = new CardHandler(cardPath, __dirname + '/data/cards.json')

const game = new GameHandler(userHandler, cardHandler, __dirname + '/data/game.json')

const GameMode = {
    STARTING: 0,
    PAUSED: 1,
    RUNNING: 2
}

let currentGameMode = GameMode.STARTING

let currentSelectedCards = []
let flippedCards = []


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

app.get('/controller', (req, res) => {
    res.writeHead(307, {Location: '/pages/controller/controller.html'})
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

        socket.emit('name', JSON.stringify({id: id, name: users.getUserProperty(id, 'name')}))

        userHandler.setUsers(users)

        game.addUser(id)

        sendUserList()
    })

    socket.on('show-greencard', () => {
        sendGreenCard()
    })

    socket.on('start-select', () => {
        startSelect()
    })

    socket.on('select', card => {
        game.selectCard(id, card)

        sendNumSelectedCards()

        if(game.allSelected()) {
            currentSelectedCards = randomizeArray(game.getSelectedCards())
            flippedCards = []

            setTimeout(sendSelectedCards, 1500)
        }
    })

    socket.on('flip-selected', message => {
        gameIO.emit('flip-selected', message)

        let data = JSON.parse(message)
        flippedCards.push(data.selected)
    })

    socket.on('judge-select', message => {
        let data = JSON.parse(message)

        let selected = data.selected

        let winner = game.judgeCard(selected)

        gameIO.emit('judge-selected', JSON.stringify({selected: selected, winner: winner}))

        setTimeout(() => {
            sendUserList()

            game.setGreenCard(cardHandler.getNewGreenCards())
            game.nextJudge()

            startRound()
        }, 5000)
    })

    socket.on('disconnect', () => {
        if (currentGameMode === GameMode.STARTING) {
            game.removeUser(id)
        }
        userHandler.getUsers(users => {
            if (id !== undefined && users.includes(id)) {
                users.userDisconnected(id)
            }
            userHandler.setUsers(users, sendUserList)
        })
    })
})

controllerIO.on('connection', socket => {

    sendUserList()

    socket.on('start-game', () => {
        currentGameMode = GameMode.RUNNING

        game.start()

        startRound()
    })

    socket.on('pause-game', () => {

    })

    socket.on('next', () => {
        game.nextJudge()
    })

    socket.on('reset-game', () => {

    })

    socket.on('remove-player', message => {
        let data = JSON.parse(message)

        userHandler.getUsers(users => {
            let user = data.id

            if (user === undefined) {
                return
            }

            let socket = gameIO.sockets[users.getUserProperty(user, 'socket')]
            if (socket !== undefined) {
                socket.emit('redirect', JSON.stringify({location: ''}))
            }

            sendUserList()
        })
    })
})


const sendUserList = () => {
    userHandler.getUsers(users => {
        let userList = {}

        for (let user of Object.keys(users.getUsers())) {
            if (users.getUserProperty(user, 'connected')) {
                userList[user] = {
                    name: users.getUserProperty(user, 'name'),
                    connected: users.getUserProperty(user, 'connected'),
                    ready: true
                }
            }
        }

        controllerIO.emit('users-list', JSON.stringify({users: userList}))

        for (let user of Object.keys(users.getUsers())) {
            if (users.getUserProperty(user, 'connected')) {
                let socket = gameIO.sockets.get(users.getUserProperty(user, 'socket'))
                if (undefined !== socket) {
                    socket.emit('users', JSON.stringify(game.getTableForUser(user)))
                }
            }
        }
    })
}

const startRound = () => {
    sendJudge()
}

const sendJudge = () => {
    let judge = game.getJudge()

    let users = userHandler.getUsersSync()

    gameIO.emit('judge', JSON.stringify({id: judge, name: users.getUserProperty(judge, 'name')}))
}

const sendGreenCard = () => {
    gameIO.emit('greencard', JSON.stringify({greencard: game.getGreenCard()}))
}

const startSelect = () => {
    let users = userHandler.getUsersSync()

    for (let user of Object.keys(users.getUsers())) {
        if (users.getUserProperty(user, 'connected')) {
            let socket = gameIO.sockets.get(users.getUserProperty(user, 'socket'))
            if (undefined !== socket) {
                socket.emit('hand', JSON.stringify({greencard: game.getGreenCard(), cards: game.getHand(user)}))
            }
        }
    }
}

const sendNumSelectedCards = () => {
    gameIO.emit('num-selected', JSON.stringify({num: game.getSelectedCards().length}))
}

const sendSelectedCards = () => {
    gameIO.emit('selected-cards', JSON.stringify({selected: currentSelectedCards}))
}

const randomizeArray = (array) => {
    return array.sort((a, b) => {
        return Math.random() < 0.5 ? -1 : 1
    })
}


http.listen(port, () => {
    console.log(`Listening on http://${ip}:${port}`)
})