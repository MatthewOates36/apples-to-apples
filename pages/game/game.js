const socket = io('/game')

const body = $(document.body)

let id
let name
let judge = false
let hasGreenCard = false

socket.on('redirect', message => {
    let data = JSON.parse(message)
    window.location.href = 'http://' + window.location.hostname + ':' + window.location.port + data.location
})

socket.on('name', message => {
    let data = JSON.parse(message)

    id = data.id
    name = data.name

    $('#table-self-display').attr('data-id', id)
    $('#table-self-name').text(name + ' (you)')
})

socket.on('users', message => {
    let data = JSON.parse(message)

    let selfScoreDisplay = $('#table-self-score')

    if (data[0].score < 1) {
        selfScoreDisplay.css('display', 'none')
    } else {
        selfScoreDisplay.text(data[0].score)
        selfScoreDisplay.css('display', 'flex')
    }

    let allUserElements = $('.table-user-display').not('#table-self-display')

    allUserElements.remove()

    switch (data.length) {
        case 2:
            addUser('top', data[1])
            break
        case 3:
            addUser('top', data[1])
            addUser('top', data[2])
            break
        case 4:
            addUser('left', data[1])
            addUser('top', data[2])
            addUser('right', data[3])
            break
        case 5:
            addUser('left', data[1])
            addUser('top', data[2])
            addUser('top', data[3])
            addUser('right', data[4])
            break
        case 6:
            addUser('left', data[1])
            addUser('top', data[2])
            addUser('top', data[3])
            addUser('top', data[4])
            addUser('right', data[5])
    }
})

socket.on('num-selected', message => {
    let data = JSON.parse(message)

    tableSetNumSelected(data.num)
})

socket.on('selected-cards', message => {
    let data = JSON.parse(message)

    showPage('table')

    tableSetSelected(data.selected)

    if(judge) {
        judgeSetSelected(data.selected)
    }

    shuffle()
})

socket.on('flip-selected', message => {
    let data = JSON.parse(message)

    $('.table-card-front[data-card=' + data.selected + ']').parent().addClass('table-card-animate table-show-card')
    $('.judge-card-front[data-card=' + data.selected + ']').parent().addClass('judge-card-animate judge-show-card')
})

socket.on('hand', message => {
    let data = JSON.parse(message)

    if (judge) {
        clearTimeout(shakeTimeout)
        tableGreenCard.removeClass('table-greencard-shake')
        setTimeout(() => {
            tableGreenCard.removeClass('table-greencard-shake')
        }, 500)
    } else {

        showPage('select-card')

        $('#select-card-greencard-front').css('background-image', 'url(/assets/cards/green/card-' + data.greencard + '.jpg')

        dealDelay = 0

        for (let card in data.cards) {
            setRedCard(parseInt(card) + 1, data.cards[card])
        }
    }
})

socket.on('judge', message => {
    let data = JSON.parse(message)

    $('.table-user-display').removeClass('table-user-display-judge')

    let judgeElement = $('.table-user-display[data-id="' + data.id + '"]')

    judgeElement.addClass('table-user-display-judge')

    judge = data.id === id

    if (judge) {
        tableGreenCard.addClass('table-greencard-shake')
    } else {
        tableGreenCard.removeClass('table-greencard-shake')
    }
    tableGreenCard.attr('hidden', false)
})

socket.on('greencard', message => {
    let data = JSON.parse(message)

    tableGreenCard.removeClass('table-greencard-shake')

    $('#table-greencard-front, #judge-greencard-front').css('background-image', 'url(/assets/cards/green/card-' + data.greencard + '.jpg')

    setTimeout(() => {
        tableGreenCardInner.addClass('table-card-animate')
        tableGreenCardInner.addClass('table-show-card')
        hasGreenCard = true
    }, 100)

    if (judge) {
        shakeTimeout = setTimeout(() => {
            tableGreenCard.addClass('table-greencard-shake')
        }, 5500)
    }
})

socket.on('judge-selected', message => {
    let data = JSON.parse(message)

    hasGreenCard = false
    judge = false

    showPage('table')

    let cardWrappers = $('#table-selected-cards-wrapper').children()

    for(let cardWrapper of cardWrappers) {
        if($(cardWrapper).find('.table-card-front').attr('data-card') !== data.selected) {
            $(cardWrapper).find('.table-card-inner').removeClass('table-show-card')
            let cardElement = $(cardWrapper).find('.table-card-display')
            setTimeout(() => {
                cardElement.removeClass('table-card-slide')
                cardElement.removeClass('table-card-slide-top')

                cardElement.css('left', cardElement.position().left)
                cardElement.css('top', cardElement.position().top)
                cardElement.css('width', cardElement.width())
                cardElement.css('height', cardElement.height())
                cardElement.css('z-index', 3000)
                cardElement.css('position', 'absolute')
                cardElement.position()

                cardElement.addClass('table-card-slide-top')

                cardElement.css('top', '-100vh')

                setTimeout(() => {
                    cardElement.removeClass('table-card-slide-top')

                    $(cardWrapper).remove()
                }, 1000)
            }, 1000)
        }

        setTimeout(() => {
            tableGreenCard.removeClass('table-card-slide')
            tableGreenCard.removeClass('table-card-slide-top')

            let tableGreenCardPosition = tableGreenCard.position()

            tableGreenCard.css('left', tableGreenCardPosition.left)
            tableGreenCard.css('top', tableGreenCardPosition.top)
            tableGreenCard.css('width', tableGreenCard.width())
            tableGreenCard.css('height', tableGreenCard.height())
            tableGreenCard.css('z-index', 3000)
            tableGreenCard.css('position', 'absolute')
            tableGreenCard.position()

            tableGreenCard.addClass('table-card-slide-top')

            let finalPositionElement = $('.table-user-display[data-id="' + data.winner + '"]')

            let finalPosition = finalPositionElement.position()

            console.log(finalPositionElement)

            tableGreenCard.css('left', finalPosition.left)
            tableGreenCard.css('top', finalPosition.top)
            tableGreenCard.position()

            setTimeout(() => {
                tableGreenCard.removeClass('table-card-slide-top')

                let tableGreenCardInner = $(tableGreenCard.children())
                tableGreenCardInner.removeClass('table-card-animate')
                tableGreenCardInner.removeClass('table-show-card')

                tableGreenCard.css('left', '')
                tableGreenCard.css('top', '')
                tableGreenCard.css('width', '')
                tableGreenCard.css('height', '')
                tableGreenCard.css('z-index', '')
                tableGreenCard.css('position', '')
                tableGreenCard.position()

                tableGreenCardInner.addClass('table-card-animate')

                tableSelectedCardsWrapper.empty()
            }, 1000)
        }, 4000)
    }
})


const showPage = (page) => {
    $('.page').attr('hidden', true)
    $('#' + page + '-view').attr('hidden', false)
}

const tableCardSelectionOverlay = $('#table-selection-overlay')
const tableCardShowButton = $('#table-show-button')
const tableGreenCard = $('#table-greencard')
const tableGreenCardInner = $('#table-greencard-inner')
const tableSelectedCardsWrapper = $('#table-selected-cards-wrapper')
let shakeTimeout

const addUser = (position, data) => {

    let display = $('<div>', {
        'class': 'table-user-display',
        'data-id': data.id
    })

    if (data.score > 0) {
        $('<div>', {
            'class': 'table-greencard-score-back',
            'text': data.score
        }).appendTo(display)
    }

    if(data.judge) {
        display.addClass('table-user-display-judge')
    }

    $('<div>', {
        'class': 'table-name-display',
        'text': data.name
    }).appendTo(display)

    display.appendTo($('#table-' + position + '-wrapper'))
}

const tableSetNumSelected = (num) => {
    tableSelectedCardsWrapper.empty()

    for(let i = 0; i < num; i++) {
        let card = $('<div>', {
            'class': 'table-card-display'
        })

        let cardInner = $('<div>', {
            'class': 'table-card-inner'
        })

        let cardBack = $('<div>', {
            'class': 'table-redcard-back'
        })

        cardBack.appendTo(cardInner)

        let cardFront = $('<div>', {
            'class': 'table-card-front'
        })

        cardFront.appendTo(cardInner)

        cardInner.appendTo(card)
        card.appendTo(tableSelectedCardsWrapper)
    }
}

const tableSetSelected = (cards) => {
    tableSelectedCardsWrapper.empty()

    for(let card of cards) {
        let cardWrapper = $('<div>')

        let cardElement = $('<div>', {
            'class': 'table-card-display'
        })

        let cardInner = $('<div>', {
            'class': 'table-card-inner'
        })

        let cardBack = $('<div>', {
            'class': 'table-redcard-back'
        })

        cardBack.appendTo(cardInner)

        let cardFront = $('<div>', {
            'class': 'table-card-front',
            'data-card': card
        })
        cardFront.css('background-image', 'url(/assets/cards/red/card-' + card + '.jpg)')

        cardFront.on('click', tableFullScreenCard)

        cardFront.appendTo(cardInner)
        cardInner.appendTo(cardElement)
        cardElement.appendTo(cardWrapper)
        cardWrapper.appendTo(tableSelectedCardsWrapper)
    }
}

const shuffle = () => {
    let cards = tableSelectedCardsWrapper.children()

    for (let card of cards) {
        let cardElement = $(card)

        let position = cardElement.position()
        cardElement.css('left', position.left)
        cardElement.css('top', position.top)
    }

    let width = $(cards[0]).width()

    for (let card of cards) {
        let cardElement = $(card)

        cardElement.css('width', width)
        cardElement.css('height', cardElement.height())
        cardElement.css('position', 'absolute')
    }

    tableSelectedCardsWrapper.position()

    let delay = 500

    for (let card of cards) {
        let cardElement = $(card)

        cardElement.addClass('table-redcard-slide')
        cardElement.addClass('table-redcard-center')

        setTimeout(() => {
            cardElement.addClass('table-redcard-shuffle')
        }, delay)

        delay += 500
    }

    for (let card of cards) {
        let cardElement = $(card)

        setTimeout(() => {
            cardElement.removeClass('table-redcard-center')
            cardElement.removeClass('table-redcard-shuffle')

            setTimeout(() => {
                cardElement.removeClass('table-card-slide')

                cardElement.css('position', '')
                cardElement.css('left', '')
                cardElement.css('top', '')
                cardElement.css('width', '')
                cardElement.css('height', '')

                if(judge) {
                    showPage('judge')
                }
            }, 1000)
        }, delay + 3000)
    }
}

const tableFullScreenCard = event => {
    event.stopPropagation()

    let cardElement = $(event.target).parent().parent()

    clearTimeout(shakeTimeout)
    cardElement.removeClass('table-greencard-shake')
    setTimeout(() => {
        cardElement.removeClass('table-greencard-shake')
    }, 500)

    if(judge && cardElement.attr('id') === 'table-greencard') {
        tableCardShowButton.css('display', '')

        tableCardShowButton.off('click')
        tableCardShowButton.on('click', (event) => {
            tableCardShowButton.off('click')

            selectCardSelectionButton.off('click')
            cardElement.off('click')
            cardElement.on('click', tableGreenCardClick)

            tableCardSelectionOverlay.attr('hidden', true)
            cardElement.css('position', 'fixed')
            cardElement.removeClass('table-card-display-fullscreen')

            setTimeout(() => {
                tableCardSelectionOverlay.attr('hidden', true)

                cardElement.css('position', '')
                cardElement.css('width', '')
                cardElement.css('height', '')
                cardElement.css('left', '')
                cardElement.css('top', '')
                cardElement.css('z-index', 0)
            }, 250)

            event.stopPropagation()

            if (judge) {
                startSelect()
            }
        })
    } else {
        tableCardShowButton.css('display', 'none')
    }

    let exit = () => {
        if(judge) {
            cardElement.addClass('table-greencard-shake')
        }

        tableCardShowButton.off('click')
        cardElement.off('click')
        cardElement.on('click', tableGreenCardClick)

        tableCardSelectionOverlay.attr('hidden', true)
        cardElement.css('position', 'fixed')
        cardElement.removeClass('table-card-display-fullscreen')

        setTimeout(() => {
            cardElement.css('position', '')
            cardElement.css('width', '')
            cardElement.css('height', '')
            cardElement.css('left', '')
            cardElement.css('top', '')
            cardElement.css('z-index', 0)
        }, 250)
    }

    tableCardSelectionOverlay.attr('hidden', false)

    tableCardSelectionOverlay.one('click', exit)

    cardElement.off('click')
    cardElement.one('click', exit)

    cardElement.removeClass('table-card-slide')
    cardElement.css('left', cardElement.position().left)
    cardElement.css('top', cardElement.position().top)
    cardElement.css('width', cardElement.width())
    cardElement.css('height', cardElement.height())
    cardElement.css('z-index', 3000)
    cardElement.position()
    cardElement.addClass('table-card-slide')

    cardElement.addClass('table-card-display-fullscreen')
}

const startSelect = () => {
    socket.emit('start-select')
}

const tableGreenCardClick = event => {
    if (hasGreenCard) {
        tableFullScreenCard(event)
    } else if (judge) {
        socket.emit('show-greencard')
    }
}

tableGreenCard.on('click', tableGreenCardClick)


const judgeSelectionOverlay = $('#judge-selection-overlay')
const judgeSelectionButton = $('#judge-select-button')
const judgeRedcardsWrapper = $('#judge-redcards-wrapper')

const judgeFullScreenCard = event => {
    event.stopPropagation()

    let cardFrontElement = $(event.target)
    let cardElement = $(event.target).parent().parent()

    if(cardElement.attr('id') !== 'judge-greencard') {
        judgeSelectionButton.css('display', '')
        judgeSelectionButton.off('click')
        judgeSelectionButton.on('click', (event) => {
            judgeSelectionButton.off('click')
            cardElement.off('click')

            judgeSelection(cardFrontElement.attr('data-card'))

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
    } else {
        judgeSelectionButton.css('display', 'none')
    }

    let exit = event => {
        judgeSelectionButton.off('click')
        cardElement.off('click')

        judgeSelectionOverlay.css('display', 'none')

        cardElement.css('position', 'absolute')
        cardElement.removeClass('judge-card-display-fullscreen')

        cardElement.off('click')
        cardElement.on('click', judgeFullScreenCard)

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

    cardElement.removeClass('judge-card-slide')
    cardElement.css('left', cardElement.position().left)
    cardElement.css('top', cardElement.position().top)
    cardElement.css('width', cardElement.width())
    cardElement.css('height', cardElement.height())
    cardElement.css('z-index', 3000)
    cardElement.css('position', 'absolute')
    cardElement.position()
    cardElement.addClass('judge-card-slide')

    cardElement.addClass('judge-card-display-fullscreen')
}

const judgeSetSelected = (cards) => {
    judgeRedcardsWrapper.empty()

    for(let card of cards) {
        let cardWrapper = $('<div>')

        let cardElement = $('<div>', {
            'class': 'judge-card-display'
        })

        let cardInner = $('<div>', {
            'class': 'judge-card-inner'
        })

        let cardBack = $('<div>', {
            'class': 'judge-redcard-back'
        })

        cardBack.appendTo(cardInner)

        let cardFront = $('<div>', {
            'class': 'judge-card-front',
            'data-card': card
        })
        cardFront.css('background-image', 'url(/assets/cards/red/card-' + card + '.jpg)')

        if(judge) {
            cardElement.on('click', () => {
                socket.emit('flip-selected', JSON.stringify({selected: card}))

                cardElement.off('click')
                cardFront.on('click', judgeFullScreenCard)
            })
        }

        cardFront.appendTo(cardInner)
        cardInner.appendTo(cardElement)
        cardElement.appendTo(cardWrapper)
        cardWrapper.appendTo(judgeRedcardsWrapper)
    }
}

const judgeSelection = (card) => {
    socket.emit('judge-select', JSON.stringify({selected: card}))
}

$('#judge-greencard-front').on('click', judgeFullScreenCard)


const selectCardSelectionOverlay = $('#select-card-selection-overlay')
const selectCardSelectionButton = $('#select-card-select-button')

let dealDelay = 0

const setRedCard = (cardNumber, cardID) => {
    let cardElement = $('#select-card-redcard' + cardNumber + '-front')

    if (cardID !== cardElement.attr('data-card')) {
        let fullCard = cardElement.parent().parent()

        let initialPosition = fullCard.position()

        fullCard.css('width', fullCard.width())
        fullCard.css('height', fullCard.height())

        fullCard.removeClass('select-card-display')
        fullCard.addClass('select-card-deal-start')

        fullCard.position()

        setTimeout(() => {
            fullCard.css('left', initialPosition.left)
            fullCard.css('top', initialPosition.top)
            fullCard.css('z-index', 3000)

            fullCard.addClass('select-card-display')

            setTimeout(() => {
                fullCard.removeClass('select-card-deal-start')
                fullCard.css('position', '')
                fullCard.css('left', '')
                fullCard.css('top', '')
                fullCard.css('width', '')
                fullCard.css('height', '')
                fullCard.css('z-index', '')

                cardElement.parent().removeClass('select-card-animate')
                cardElement.parent().removeClass('select-card-show-card')

                cardElement.parent().position()

                cardElement.parent().addClass('select-card-animate')
                cardElement.parent().addClass('select-card-show-card')
            }, 1200)
        }, dealDelay)

        dealDelay += 200
    } else {
        cardElement.parent().removeClass('select-card-animate')
        cardElement.parent().addClass('select-card-show-card')
    }

    cardElement.attr('data-card', cardID)

    cardElement.css('background-image', 'url(/assets/cards/red/card-' + cardID + '.jpg')
}

const selectCardFullScreenCard = (event) => {
    event.stopPropagation()

    let cardElement = $(event.target).parent().parent()

    selectCardSelectionButton.css('display', cardElement.attr('id') === 'select-card-greencard' ? 'none' : '')

    selectCardSelectionButton.off('click')
    selectCardSelectionButton.on('click', (event) => {
        selectCardSelectionButton.off('click')
        cardElement.off('click')

        selectCard(cardElement.find('.select-card-front').attr('data-card'))

        cardElement.removeClass('select-card-card-display-fullscreen')
        cardElement.css('position', 'absolute')
        cardElement.css('width', '80vw')
        cardElement.css('height', '80vh')
        cardElement.css('left', '10vw')
        cardElement.css('top', '-100vh')

        setTimeout(() => {
            selectCardSelectionOverlay.attr('hidden', true)
            showPage('table')
        }, 500)

        event.stopPropagation()
    })

    let exit = () => {
        selectCardSelectionButton.off('click')
        cardElement.off('click')

        selectCardSelectionOverlay.attr('hidden', true)
        cardElement.css('position', 'fixed')
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

    selectCardSelectionOverlay.attr('hidden', false)

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

const selectCard = (id) => {
    socket.emit('select', id)
}

$('.select-card-display, #select-card-greencard').one('click', selectCardFullScreenCard)


showPage('table')

