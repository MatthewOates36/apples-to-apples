const fs = require('fs')
const path = require('path')

class GameHandler {

    constructor(userHandler, cardHandler, file = __dirname + '/data/game.json', options = 'utf8') {
        this.userHandler = userHandler
        this.cardHandler = cardHandler

        this.file = path.resolve(file)
        this.directory = path.dirname(this.file)
        this.options = options

        if(!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory)
        }

        if(!fs.existsSync(this.file)) {
            this.writeAllData({users: {}, order: []})
        }
    }

    start() {
        let allUserData = this.getAllUserData()

        for(let user of Object.keys(allUserData)) {
            let hand = allUserData[user]['hand']
            allUserData[user]['hand'] = hand.concat(this.cardHandler.getNewRedCards(7 - hand.length))
        }

        this.writeData('users', allUserData)

        if(this.getGreenCard() === undefined) {
            this.setGreenCard(this.cardHandler.getNewGreenCards())
        }
    }

    getAllUserData() {
        let userData = this.readAllData()['users']

        let users = this.userHandler.getUsersSync()

        let updated = false

        Object.keys(userData).filter(user => !users.includes(user)).forEach(user => {
            delete userData[user]
            updated = true
        })

        if(updated) {
            this.writeData('users', userData)
        }

        return userData
    }

    getUserData(user) {
        return this.getAllUserData()[user]
    }

    setUserData(user, data) {
        this.writeData('users', user, data)
    }

    setUserParameter(user, key, value) {
        this.writeData('users', user, key, value)
    }

    addUser(user) {
        if(undefined === this.getUserData(user)) {
            this.setUserData(user, {
                hand: [],
                greencards: []
            })
        }

        let order = this.getOrder()
        if(!order.includes(user)) {
            order.push(user)
        }
        this.setOrder(order)
    }

    removeUser(user) {
        this.setUserData(user, undefined)

        let order = this.getOrder()
        if(order.includes(user)) {
            order.splice(order.indexOf(user), 1)
            this.setOrder(order)
        }
    }

    getHand(user) {
        let userData = this.getUserData(user)

        if(undefined !== userData) {
            return userData['hand']
        }

        return []
    }

    getScore(user) {
        let userData = this.getUserData(user)

        if(undefined !== userData) {
            let greencards = userData['greencards']
            if(undefined !==  greencards) {
                return greencards.length
            }
        }

        return 0
    }

    selectCard(user, card) {
        let hand = this.getHand(user)
        hand[hand.indexOf(card)] = this.cardHandler.getNewRedCards()

        this.setUserParameter(user, 'hand', hand)

        this.setUserParameter(user, 'selectedcard', card)
    }

    allSelected() {
        let allUserData = this.getAllUserData()

        let judge = this.getJudge()

        for(let user of Object.keys(allUserData)) {
            if(user === judge) {
                continue
            }
            if(undefined === allUserData[user]['selectedcard']) {
                return false
            }
        }

        return true
    }

    hasUserSelected(user) {
        let allUserData = this.getAllUserData()

        let userData = allUserData[user]

        if(undefined === userData) {
            return false
        }

        return undefined !== userData['selectedcard']
    }

    getSelectedCards() {
        let allUserData = this.getAllUserData()

        let selectedCards = []

        for(let id of Object.keys(allUserData)) {
            let selectedCard = allUserData[id]['selectedcard']

            if(undefined !== selectedCard) {
                selectedCards.push(selectedCard)
            }
        }

        return selectedCards
    }

    clearSelectedCards() {
        let allUserData = this.getAllUserData()

        for(let id of Object.keys(allUserData)) {
            delete allUserData[id]['selectedcard']
        }

        this.writeData('users', allUserData)
    }

    judgeCard(card) {
        let allUserData = this.getAllUserData()

        for(let id of Object.keys(allUserData)) {
            let user = allUserData[id]
            if(user['selectedcard'] === card) {
                user['greencards'].push(this.getGreenCard())
                this.setUserParameter(id, 'greencards', user['greencards'])

                this.clearSelectedCards()
                return id
            }
        }

        this.clearSelectedCards()
    }

    nextJudge() {
        let users = this.userHandler.getUsersSync()

        let order = this.getOrder()

        order = order.filter(user => users.includes(user))

        let newOrder = order.splice(1)
        newOrder = newOrder.concat(order)

        this.setOrder(newOrder)

        return newOrder[0]
    }

    getJudge() {
        if(this.getGreenCard() === undefined) {
            return undefined
        }

        return this.getOrder()[0]
    }

    getTableForUser(user) {

        let order = this.getOrder()

        let userIndex = order.indexOf(user)

        let userOrder = order.splice(userIndex)

        userOrder = userOrder.concat(order)

        let users = this.userHandler.getUsersSync()

        let judge = this.getJudge()

        userOrder = userOrder.map(user => ({
            id: user,
            name: users.getUserProperty(user, 'name'),
            score: this.getScore(user),
            judge: user === judge
        }))

        return userOrder
    }

    getOrder() {
        let users = this.userHandler.getUsersSync()

        return this.readAllData()['order'].filter(user => users.includes(user))
    }

    setOrder(order) {
        this.writeData('order', order)
    }

    getGreenCard() {
        return this.readAllData()['greencard']
    }

    setGreenCard(card) {
        this.writeData('greencard', card)
    }

    readAllData() {
        return JSON.parse(fs.readFileSync(this.file, this.options))
    }

    writeAllData(data) {
        fs.writeFileSync(this.file, JSON.stringify(data, null, 2), this.options)
    }

    writeData(...data) {
        let allData = this.readAllData()

        let finalData = allData

        for(let i = 0; i < data.length - 2; i++) {
            finalData = finalData[data[i]]
        }

        finalData[data[data.length - 2]] = data[data.length - 1]

        this.writeAllData(allData)
    }

    reset() {
        this.writeAllData({users: {}, order: []})
    }
}

module.exports = {
    GameHandler
}