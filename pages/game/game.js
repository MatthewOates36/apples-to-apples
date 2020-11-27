const socket = io('/game')

const body = $(document.body)

const judgeSelectionOverlay = $('#judge-selection-overlay')
const judgeSelectionButton = $('#judge-select-button')

let judgeFullScreenCard = (event) => {
    let cardElement = $(event.target)

    judgeSelectionButton.off('click')
    judgeSelectionButton.on('click', (event) => {
        judgeSelectionButton.off('click')
        cardElement.off('click')

        // judge(cardElement.attr('data-card'))

        cardElement.removeClass('judge-card-display-fullscreen')
        cardElement.css('position', 'absolute')
        cardElement.css('width', '80vw')
        cardElement.css('height', '80vh')
        cardElement.css('left', '10vw')
        cardElement.css('top', '-100vh')

        setTimeout(() => {
            judgeSelectionOverlay.css('display', 'none')
        }, 500)

        event.stopPropagation()
    })

    let exit = (event) => {
        judgeSelectionButton.off('click')
        cardElement.off('click')

        judgeSelectionOverlay.css('display', 'none')
        cardElement.css('position', 'absolute')
        cardElement.removeClass('judge-card-display-fullscreen')
        cardElement.one('click', judgeFullScreenCard)
        setTimeout(() => {
            cardElement.css('position', '')
            cardElement.css('width', '')
            cardElement.css('height', '')
            cardElement.css('left', '')
            cardElement.css('top', '')
            cardElement.css('z-index', 0)
        }, 250)
    }

    judgeSelectionOverlay.css('display', 'block')

    judgeSelectionOverlay.one('click', exit)
    cardElement.one('click', exit)

    cardElement.css('left', cardElement.position().left)
    cardElement.css('top', cardElement.position().top)
    cardElement.css('width', cardElement.width())
    cardElement.css('height', cardElement.height())
    cardElement.css('z-index', 3000)
    cardElement.position()

    cardElement.addClass('judge-card-display-fullscreen')
}


const selectCardSelectionOverlay = $('#select-card-selection-overlay')
const selectCardSelectionButton = $('#select-card-select-button')

socket.on('hand', text => {
    let cards = JSON.parse(text)

    for (let card in cards) {
        setRedCard(parseInt(card) + 1, cards[card])
    }
})

let setRedCard = (cardNumber, cardID) => {
    let cardElement = $('#select-card-redcard' + cardNumber)
    cardElement.css('background-image', 'url(/assets/cards/red/card-' + cardID + '.jpg')
    cardElement.attr('data-card', cardID)
}

let selectCardFullScreenCard = (event) => {
    let cardElement = $(event.target)

    selectCardSelectionButton.off('click')
    selectCardSelectionButton.on('click', (event) => {
        selectCardSelectionButton.off('click')
        cardElement.off('click')

        selectCard(cardElement.attr('data-card'))

        cardElement.removeClass('select-card-card-display-fullscreen')
        cardElement.css('position', 'absolute')
        cardElement.css('width', '80vw')
        cardElement.css('height', '80vh')
        cardElement.css('left', '10vw')
        cardElement.css('top', '-100vh')

        setTimeout(() => {
            selectCardSelectionOverlay.css('display', 'none')
        }, 500)

        event.stopPropagation()
    })

    let exit = (event) => {
        selectCardSelectionButton.off('click')
        cardElement.off('click')

        selectCardSelectionOverlay.css('display', 'none')
        cardElement.css('position', 'absolute')
        cardElement.removeClass('select-card-card-display-fullscreen')
        cardElement.one('click', selectCardFullScreenCard)
        setTimeout(() => {
            cardElement.css('position', '')
            cardElement.css('width', '')
            cardElement.css('height', '')
            cardElement.css('left', '')
            cardElement.css('top', '')
            cardElement.css('z-index', 0)
        }, 250)
    }

    selectCardSelectionOverlay.css('display', 'block')

    selectCardSelectionOverlay.one('click', exit)
    cardElement.one('click', exit)

    cardElement.css('left', cardElement.position().left)
    cardElement.css('top', cardElement.position().top)
    cardElement.css('width', cardElement.width())
    cardElement.css('height', cardElement.height())
    cardElement.css('z-index', 3000)
    cardElement.position()

    cardElement.addClass('select-card-card-display-fullscreen')
}

let selectCard = (id) => {
    socket.emit('select', id)
}

$('.select-card-card-display').one('click', selectCardFullScreenCard)
