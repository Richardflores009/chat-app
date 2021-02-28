const socket = io()

// Elements
const formDataEl = document.querySelector('#formData')
const messageFormInputEl = formDataEl.querySelector('input')
const messageFormButtonEl = formDataEl.querySelector('button')
const sendLocationButtonEl = document.querySelector('#sendLocation')
const messagesEl = document.querySelector('#messages')
//? template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//* options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoScroll = () => {
    // New message element
    const newMessageEl = messagesEl.lastElementChild

    // Height of new message
    const newMessgeStyles = getComputedStyle(newMessageEl)
    const newMessageMargin = parseInt(newMessgeStyles.marginBottom)
    const newMessageHeight = newMessageEl.offsetHeight + newMessageMargin

    // visble height
    const visableHeight = messagesEl.offsetHeight
    
    // Height of messages container
    const containerHeight = messagesEl.scrollHeight
    
    // How far have I scrolled
    const scrollOffset = messagesEl.scrollTop + visableHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        return messagesEl.scrollTop = messagesEl.scrollHeight
    }

}

socket.on('message', (message) => {
    console.log(message.text)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messagesEl.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        location: location.text,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    messagesEl.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData',  ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room: room,
        users:users
    })
    document.querySelector('#sidebar').innerHTML = html
})


formDataEl.addEventListener('submit', (e) => {
    e.preventDefault()
    messageFormButtonEl.setAttribute('disabled', 'disabled')
    // from form input
    const clientMessage = e.target.message.value
    socket.emit('sendMessage', clientMessage, (error) => {
        messageFormButtonEl.removeAttribute('disabled')
        messageFormInputEl.value = ''
        messageFormInputEl.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message Delivered')
    })
})

sendLocationButtonEl.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    sendLocationButtonEl.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
            if (error) {
                return console.log(error)
            }
            console.log('Location shared!')
            sendLocationButtonEl.removeAttribute('disabled')
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})