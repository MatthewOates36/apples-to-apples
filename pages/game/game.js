const socket = io('/game')

const body = $(document.body)

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
}

let fullScreenCard = (event) => {
    let element = $(event.target)

    selectCardSelectionButton.off('click')
    selectCardSelectionButton.on('click', (event) => {
        selectCardSelectionButton.off('click')
        element.off('click')

        element.removeClass('select-card-card-display-fullscreen')
        element.css('position', 'absolute')
        element.css('width', '80vw')
        element.css('height', '80vh')
        element.css('left', '10vw')
        element.css('top', '-100vh')

        setTimeout(() => {
            selectCardSelectionOverlay.css('display', 'none')
        }, 500)

        event.stopPropagation()
    })

    let exit = (event) => {
        selectCardSelectionButton.off('click')
        element.off('click')

        selectCardSelectionOverlay.css('display', 'none')
        element.css('position', 'absolute')
        element.removeClass('select-card-card-display-fullscreen')
        element.one('click', fullScreenCard)
        setTimeout(() => {
            element.css('position', '')
            element.css('width', '')
            element.css('height', '')
            element.css('left', '')
            element.css('top', '')
            element.css('z-index', 0)
        }, 250)
    }

    selectCardSelectionOverlay.css('display', 'block')

    selectCardSelectionOverlay.one('click', exit)
    element.one('click', exit)

    element.css('left', element.position().left)
    element.css('top', element.position().top)
    element.css('width', element.width())
    element.css('height', element.height())
    element.css('z-index', 3000)
    element.position()

    element.addClass('select-card-card-display-fullscreen')
}

$('.select-card-card-display').one('click', fullScreenCard)
