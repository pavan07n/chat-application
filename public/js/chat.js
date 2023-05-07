const socket = io()

//Selecting HTML Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (Math.round(containerHeight - newMessageHeight) <= Math.round(scrollOffset + 1 )) {
        $messages.scrollTop = $messages.scrollHeight
    }

}


//message event listener
socket.on('message', (message) =>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('kk:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html) 
    
    autoscroll()
})

//location event listener
socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('kk:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    
    autoscroll()
})

//roomdata event listener
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    }) 
    document.querySelector('#sidebar').innerHTML = html
})

//USERMESSAGE EVENT
$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()

    //Disable button
    $messageFormButton.setAttribute('disabled', 'disabled')

    //store the users msg from input field
    const message = event.target.elements.message.value

    //send/emit the message to the server and get ack and send an ack to user
    socket.emit('sendMessage', message, (error) => {
        //Enable button
        $messageFormButton.removeAttribute('disabled')
        //clear input and focus
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error) {
          return console.log(error)
        }
        console.log('Message delivered')
    })
})

//USERLOCATION EVENT
$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    //get users lat & long and emit to server, and get ack and send an ack to user
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
           $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error)
        location.href="/"
    }
})