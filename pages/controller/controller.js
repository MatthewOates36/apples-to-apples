const socket = io('/controller')

const usersUl = document.getElementById('users-list')
socket.on('users-list', usersJSON => {

    let users = JSON.parse(usersJSON).users
    usersUl.innerHTML = ''

    for (let user of Object.entries(users)) {

        let userItem = document.createElement('li')
        userItem.innerText = user[1]['name']
        userItem.style.color = user[1]['connected'] ? 'black' : 'red'

        userItem.addEventListener('click', () => {
            socket.emit('remove-user', JSON.stringify({id: user[0]}))
        })

        usersUl.append(userItem)
    }
})

const startGameButton = document.getElementById('start-game-btn')
startGameButton.addEventListener('click', () => {
    socket.emit('start-game')
})

const pauseGameButton = document.getElementById('pause-game-btn')
pauseGameButton.addEventListener('click', () => {
    socket.emit('pause-game')
})

const nextQuestionButton = document.getElementById('next-btn')
nextQuestionButton.addEventListener('click', () => {
    socket.emit('next')
})

const resetGameButton = document.getElementById('reset-game-btn')
resetGameButton.addEventListener('click', () => {
    if(confirm('Are you sure you want to reset the game?')) {
        socket.emit('reset-game')
    }
})