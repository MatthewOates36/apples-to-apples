const fs = require('fs')
const path = require('path')

class CardHandler {

    constructor(cardPath, file = __dirname + '/data/cards.json', options = 'utf8') {
        this.cardPath = cardPath

        this.file = path.resolve(file)
        this.directory = path.dirname(this.file)
        this.options = options

        if(!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory)
        }

        if(!fs.existsSync(this.file)) {
            this.writeUsedCards({red: [], green: []})
        }
    }

    getAllRedCards() {
        let redCardNames = fs.readdirSync(path.join(this.cardPath, 'red'))

        return redCardNames.filter(card => !card.startsWith('.')).map(card => card.replace('card-', '').replace('.jpg', ''))
    }

    getUnusedRedCards() {
        let usedCards = this.getUsedRedCards()

        return this.getAllRedCards().filter(card => !usedCards.includes(card))
    }

    getUsedRedCards() {
        return this.readUsedCards()['red']
    }

    setUsedRedCards(cards) {
        let cardData = this.readUsedCards()

        cardData['red'] = cards

        this.writeUsedCards(cardData)
    }

    addUsedRedCards(cards) {
        let cardData = this.readUsedCards()

        if(Array.isArray(cards)) {
            cardData['red'] = cardData['red'].concat(cards)
        } else {
            cardData['red'].push(cards)
        }

        this.writeUsedCards(cardData)
    }

    getNewRedCards(number = 1) {
        let cards = this.randomize(this.getUnusedRedCards())

        cards.splice(number)

        this.addUsedRedCards(cards)

        if(number === 1) {
            return cards[0]
        }

        return cards
    }

    getAllGreenCards() {
        let greenCardNames = fs.readdirSync(path.join(this.cardPath, 'green'))

        return greenCardNames.filter(card => !card.startsWith('.')).map(card => card.replace('card-', '').replace('.jpg', ''))
    }

    getUnusedGreenCards() {
        let usedCards = this.getUsedGreenCards()

        return this.getAllGreenCards().filter(card => !usedCards.includes(card))
    }

    getUsedGreenCards() {
        return this.readUsedCards()['green']
    }

    setUsedGreenCards(cards) {
        let cardData = this.readUsedCards()

        cardData['green'] = cards

        this.writeUsedCards(cardData)
    }

    addUsedGreenCards(cards) {
        let cardData = this.readUsedCards()

        if(Array.isArray(cards)) {
            cardData['green'] = cardData['green'].concat(cards)
        } else {
            cardData['green'].push(cards)
        }

        this.writeUsedCards(cardData)
    }

    getNewGreenCards(number = 1) {
        let cards = this.randomize(this.getUnusedGreenCards())

        cards.splice(number)

        this.addUsedGreenCards(cards)

        if(number === 1) {
            return cards[0]
        }

        return cards
    }
    
    readUsedCards() {
        try {
            let cardData = JSON.parse(fs.readFileSync(this.file, this.options))

            if (undefined === cardData) {
                cardData = {}
            }

            if (undefined === cardData['red']) {
                cardData['red'] = []
            }

            if (undefined === cardData['green']) {
                cardData['green'] = []
            }

            return cardData

        } catch (e) {
            return {
                red: [],
                green: []
            }
        }
    }

    writeUsedCards(data) {
        fs.writeFileSync(this.file, JSON.stringify(data, null, 2), this.options)
    }

    randomize(array) {
        return array.sort((a, b) => {
            return Math.random() < 0.5 ? -1 : 1
        })
    }

    reset() {
        this.writeUsedCards({red: [], green: []})
    }
}

module.exports = {
    CardHandler
}