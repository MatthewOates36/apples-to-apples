const socket = io('/game')

const body = $(document.body)

socket.on('cards', text => {
    let cards = JSON.parse(text)

    for(let card of cards) {
        let cardElement = $("<div>")

        cardElement.css('background-image', 'url(/assets/cards/red/' + card + ')')

        body.append(cardElement)
    }
})