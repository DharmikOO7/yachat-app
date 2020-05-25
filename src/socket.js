let socketio = require('socket.io');
const { generateMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
let io = socketio();
let socketApi = {};
//Your socket logic here
socketApi.io = io;
let count = 0;
// socket.io events
const sendUsersList = (room) => {
    const users = getUsersInRoom(room);
    io.to(room).emit('roomUsers', { room, users })
}

io.on("connection", (socket) => {
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', `Welcome ${user.username}!`))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined`));
        sendUsersList(user.room);
        callback();
    })

    socket.on('sendMessage', (msg, callback) => {

        const user = getUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage(user.username, msg));
            return callback();
        }
        callback('No user found.')
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the room`));
            sendUsersList(user.room);
        }
    });
});

module.exports = socketApi;