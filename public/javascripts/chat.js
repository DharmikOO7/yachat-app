var socket = io();
/* Code to update total no. of users
    socket.on('countUpdated', (count) => {
    console.log(`The no of users are ${count}`);
}) */

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages');

const messageTemplate = document.querySelector('#message-template').innerHTML
const usersListTemplate = document.querySelector('#usersList').innerHTML;
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild
    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    // Visible height
    const visibleHeight = $messages.offsetHeight
    // Height of messages container
    const containerHeight = $messages.scrollHeight
    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (msg) => {
    const newMsg = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('k:mm'),
        // username
    });
    $messages.insertAdjacentHTML('beforeend', newMsg);
    autoscroll();
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.elements.message.value
    $messageFormButton.setAttribute('disabled', 'disabled');
    socket.emit('sendMessage', msg, (err) => {
        $messageFormInput.value = ''
        $messageFormInput.focus()
        $messageFormButton.removeAttribute('disabled');
        if (err) {
            return console.log('Unable to deliver message')
        }
        // console.log('Message delivered.');
    });
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/'
    }
})

socket.on('roomUsers', ({ room, users }) => {
    const html = Mustache.render(usersListTemplate, { room, users, noOfUsers: users.length })
    document.querySelector('#sidebar').innerHTML = html;
})